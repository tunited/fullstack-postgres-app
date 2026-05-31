import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { sendTicketCreatedEmail, sendTicketUpdatedEmail, sendTicketClosedEmail } from '../services/emailService.js';

// 1. Create a Ticket (Customer Only)
export const createTicket = async (req, res) => {
  const { title, description, category, priority, module, form_name, additional_email, cust_num, program_type, issue_type } = req.body;
  const customerId = req.user.id;

  if (!title || !description || !cust_num) {
    return res.status(400).json({ error: 'Title, description, and Customer are required.' });
  }

  const validPriorities = ['low', 'medium', 'high'];
  const ticketPriority = validPriorities.includes(priority) ? priority : 'medium';
  
  const attachmentUrl = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;
  const attachmentName = req.files && req.files.length > 0 ? req.files[0].originalname : null;

  try {
    const categoriesResult = await pool.query('SELECT name FROM categories');
    const validCategories = categoriesResult.rows.map(r => r.name);
    const ticketCategory = validCategories.includes(category) ? category : (validCategories[0] || 'Technical');

    const modulesResult = await pool.query('SELECT name FROM modules');
    const validModules = modulesResult.rows.map(r => r.name);
    const ticketModule = validModules.includes(module) ? module : (validModules[0] || 'GeneralLedger');

    const programTypesResult = await pool.query('SELECT name FROM program_types');
    const validProgramTypes = programTypesResult.rows.map(r => r.name);
    const ticketProgramType = validProgramTypes.includes(program_type) ? program_type : (validProgramTypes[0] || 'Standard');

    const issueTypesResult = await pool.query('SELECT name FROM issue_types');
    const validIssueTypes = issueTypesResult.rows.map(r => r.name);
    const ticketIssueType = validIssueTypes.includes(issue_type) ? issue_type : (validIssueTypes[0] || 'Technical');

    // Generate custom ticket_number: custnum + YY + MM + running 3 digit
    const now = new Date();
    const yearStr = now.getFullYear().toString().slice(2);
    const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${cust_num}${yearStr}${monthStr}`;
    
    // Get latest ticket with this prefix to calculate next running number
    const latestRes = await pool.query(
      `SELECT ticket_number FROM tickets WHERE ticket_number LIKE $1 ORDER BY id DESC LIMIT 1`,
      [`${prefix}%`]
    );
    
    let runningNumber = 1;
    if (latestRes.rows.length > 0 && latestRes.rows[0].ticket_number) {
      const latestNum = latestRes.rows[0].ticket_number.slice(-3);
      const parsedNum = parseInt(latestNum, 10);
      if (!isNaN(parsedNum)) {
        runningNumber = parsedNum + 1;
      }
    }
    const ticketNumber = `${prefix}${runningNumber.toString().padStart(3, '0')}`;

    const newTicketResult = await pool.query(
      `INSERT INTO tickets (ticket_number, title, description, category, module, program_type, issue_type, form_name, additional_email, priority, status, customer_id, cust_num, attachment_url, attachment_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open', $11, $12, $13, $14) 
       RETURNING *`,
      [ticketNumber, title, description, ticketCategory, ticketModule, ticketProgramType, ticketIssueType, form_name || null, additional_email || null, ticketPriority, customerId, cust_num, attachmentUrl, attachmentName]
    );

    const newTicket = newTicketResult.rows[0];

    // Insert all files into ticket_attachments table
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = `/uploads/${file.filename}`;
        const fileName = file.originalname;
        await pool.query(
          `INSERT INTO ticket_attachments (ticket_id, file_url, file_name) VALUES ($1, $2, $3)`,
          [newTicket.id, fileUrl, fileName]
        );
      }
    }

    // Fetch multiple attachments
    const attachmentsRes = await pool.query(
      `SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [newTicket.id]
    );
    newTicket.attachments = attachmentsRes.rows;

    // Send email notification
    try {
      const customerRes = await pool.query('SELECT email FROM users WHERE id = $1', [customerId]);
      const adminsRes = await pool.query("SELECT email FROM users WHERE role IN ('admin', 'agent')");
      
      const customerEmail = customerRes.rows[0]?.email;
      const adminEmails = adminsRes.rows.map(r => r.email);
      
      await sendTicketCreatedEmail(newTicket, customerEmail, adminEmails, additional_email);
    } catch (emailErr) {
      console.error('Failed to send creation email:', emailErr);
    }

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'Server error while creating ticket.' });
  }
};

// 2. Get All Tickets (Customer gets their own, Agent gets all)
export const getTickets = async (req, res) => {
  const { id, role } = req.user;

  try {
    let ticketsResult;

    if (role === 'agent' || role === 'admin') {
      // Agents see all tickets with customer and agent names
      ticketsResult = await pool.query(
        `SELECT t.*, 
                c.name as user_name, c.email as customer_email, c.cust_num as user_cust_num,
                
                a.name as agent_name,
                cust.cust_name as actual_customer_name
         FROM tickets t
         JOIN users c ON t.customer_id = c.id
         LEFT JOIN users a ON t.agent_id = a.id
         LEFT JOIN customers cust ON t.cust_num = cust.cust_num
         ORDER BY t.updated_at DESC`
      );
    } else {
      // Customers see only their own tickets
      ticketsResult = await pool.query(
        `SELECT t.*, 
                c.name as user_name, c.cust_num as user_cust_num,
                
                a.name as agent_name,
                cust.cust_name as actual_customer_name
         FROM tickets t
         JOIN users c ON t.customer_id = c.id
         LEFT JOIN users a ON t.agent_id = a.id
         LEFT JOIN customers cust ON t.cust_num = cust.cust_num
         WHERE t.customer_id = $1
         ORDER BY t.updated_at DESC`,
        [id]
      );
    }

    return res.status(200).json(ticketsResult.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Server error while fetching tickets.' });
  }
};

// 3. Get Ticket Details by ID
export const getTicketById = async (req, res) => {
  const { id: userId, role } = req.user;
  const ticketId = req.params.id;

  try {
    const ticketResult = await pool.query(
      `SELECT t.*, 
              c.name as user_name, c.email as customer_email, c.cust_num as user_cust_num,
              
              a.name as agent_name,
              r.name as resolver_name,
              cust.cust_name as actual_customer_name
       FROM tickets t
       JOIN users c ON t.customer_id = c.id
       LEFT JOIN users a ON t.agent_id = a.id
       LEFT JOIN users r ON t.resolved_by = r.id
       LEFT JOIN customers cust ON t.cust_num = cust.cust_num
       WHERE t.id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = ticketResult.rows[0];

    // Authorization: customer can only view their own tickets
    if (role !== 'agent' && role !== 'admin' && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this ticket.' });
    }

    // Fetch multiple attachments
    const attachmentsRes = await pool.query(
      `SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketId]
    );
    ticket.attachments = attachmentsRes.rows;

    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return res.status(500).json({ error: 'Server error while fetching ticket.' });
  }
};

// 4. Claim a Ticket (Agent Only)
export const claimTicket = async (req, res) => {
  const agentId = req.user.id;
  const ticketId = req.params.id;

  try {
    // Check if ticket exists
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = checkTicket.rows[0];
    if (ticket.status !== 'open') {
      return res.status(400).json({ error: 'Ticket is already assigned or resolved.' });
    }

    // Update ticket with agent_id and set status to 'assigned'
    const updatedResult = await pool.query(
      `UPDATE tickets 
       SET agent_id = $1, status = 'assigned', updated_at = CURRENT_TIMESTAMP, assigned_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [agentId, ticketId]
    );

    return res.status(200).json(updatedResult.rows[0]);
  } catch (error) {
    console.error('Error claiming ticket:', error);
    return res.status(500).json({ error: 'Server error while claiming ticket.' });
  }
};

// 5. Update Ticket Status (Agent can change any, Customer can only close/resolve own)
export const updateTicketStatus = async (req, res) => {
  const { id: userId, role } = req.user;
  const ticketId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['open', 'assigned', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = checkTicket.rows[0];

    // Authorization
    if (role === 'agent' || role === 'admin') {
      // Agents and admins can change status
      // If setting back to 'open', clear agent_id
      let query;
      let params;

      if (status === 'open') {
        query = `UPDATE tickets SET status = $1, agent_id = NULL, assigned_at = NULL, updated_at = CURRENT_TIMESTAMP, resolved_by = NULL WHERE id = $2 RETURNING *`;
        params = [status, ticketId];
      } else {
        // If assigned but no agent, set to current agent
        const newAgentId = ticket.agent_id || userId;
        const resolvedClause = status === 'resolved' ? `, resolved_at = CURRENT_TIMESTAMP, resolved_by = $4` : '';
        const assignedClause = (!ticket.agent_id && newAgentId) ? `, assigned_at = CURRENT_TIMESTAMP` : '';
        query = `UPDATE tickets SET status = $1, agent_id = $2, updated_at = CURRENT_TIMESTAMP${assignedClause}${resolvedClause} WHERE id = $3 RETURNING *`;
        params = status === 'resolved' ? [status, newAgentId, ticketId, userId] : [status, newAgentId, ticketId];
      }

      const updated = await pool.query(query, params);
      const updatedTicket = updated.rows[0];
      if (status === 'resolved') {
        try {
          const customerRes = await pool.query('SELECT email FROM users WHERE id = $1', [ticket.customer_id]);
          const customerEmail = customerRes.rows[0]?.email;
          await sendTicketClosedEmail(updatedTicket, customerEmail, ticket.additional_email);
        } catch (emailErr) {
          console.error('Failed to send closing email:', emailErr);
        }
      }
      return res.status(200).json(updatedTicket);
    } else {
      // Customers can only mark their own tickets as resolved
      if (ticket.customer_id !== userId) {
        return res.status(403).json({ error: 'Access denied. You do not own this ticket.' });
      }

      if (status !== 'resolved' && status !== 'open') {
        return res.status(400).json({ error: 'Customers can only reopen or close (resolve) their own tickets.' });
      }

      if (status === 'open') {
        const updated = await pool.query(
          `UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP, resolved_by = NULL WHERE id = $2 RETURNING *`,
          [status, ticketId]
        );
        return res.status(200).json(updated.rows[0]);
      } else {
        const resolvedClause = status === 'resolved' ? `, resolved_at = CURRENT_TIMESTAMP, resolved_by = $3` : '';
        const params = status === 'resolved' ? [status, ticketId, userId] : [status, ticketId];
        const updated = await pool.query(
          `UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP${resolvedClause} WHERE id = $2 RETURNING *`,
          params
        );
        const updatedTicket = updated.rows[0];
        if (status === 'resolved') {
          try {
            const customerRes = await pool.query('SELECT email FROM users WHERE id = $1', [ticket.customer_id]);
            const customerEmail = customerRes.rows[0]?.email;
            await sendTicketClosedEmail(updatedTicket, customerEmail, ticket.additional_email);
          } catch (emailErr) {
            console.error('Failed to send closing email:', emailErr);
          }
        }
        return res.status(200).json(updatedTicket);
      }
    }
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return res.status(500).json({ error: 'Server error while updating status.' });
  }
};

// 6. Add a Chat Message to Ticket
export const addMessage = async (req, res) => {
  const { id: userId, role } = req.user;
  const ticketId = req.params.id;
  const { message_text } = req.body;

  if (!message_text || message_text.trim() === '') {
    return res.status(400).json({ error: 'Message text cannot be empty.' });
  }

  try {
    // Check if ticket exists and user is authorized
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = checkTicket.rows[0];

    if (role !== 'agent' && role !== 'admin' && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to post in this ticket.' });
    }

    // Insert message
    const newMessageResult = await pool.query(
      `INSERT INTO messages (ticket_id, sender_id, message_text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [ticketId, userId, message_text]
    );

    // Update ticket's updated_at
    await pool.query('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [ticketId]);

    // Fetch the inserted message along with sender name and role for instant UI display
    const msgWithSender = await pool.query(
      `SELECT m.*, u.name as sender_name, u.role as sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = $1`,
      [newMessageResult.rows[0].id]
    );

    const msgData = msgWithSender.rows[0];

    try {
      const customerRes = await pool.query('SELECT email FROM users WHERE id = $1', [ticket.customer_id]);
      const customerEmail = customerRes.rows[0]?.email;
      
      let toEmail;
      
      if (role === 'agent' || role === 'admin') {
        toEmail = customerEmail;
      } else {
        if (ticket.agent_id) {
          const agentRes = await pool.query('SELECT email FROM users WHERE id = $1', [ticket.agent_id]);
          toEmail = agentRes.rows[0]?.email;
        } else {
          const adminsRes = await pool.query("SELECT email FROM users WHERE role IN ('admin', 'agent')");
          toEmail = adminsRes.rows.map(r => r.email).join(',');
        }
      }
      
      await sendTicketUpdatedEmail(ticket, toEmail, ticket.additional_email, message_text, msgData.sender_name);
    } catch (emailErr) {
      console.error('Failed to send update email:', emailErr);
    }

    return res.status(201).json(msgData);
  } catch (error) {
    console.error('Error adding message:', error);
    return res.status(500).json({ error: 'Server error while sending message.' });
  }
};

// 7. Get All Messages of a Ticket
export const getTicketMessages = async (req, res) => {
  const { id: userId, role } = req.user;
  const ticketId = req.params.id;

  try {
    // Verify ticket ownership/access
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = checkTicket.rows[0];

    if (role !== 'agent' && role !== 'admin' && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not have access to these messages.' });
    }

    const messagesResult = await pool.query(
      `SELECT m.*, u.name as sender_name, u.role as sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`,
      [ticketId]
    );

    return res.status(200).json(messagesResult.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Server error while fetching messages.' });
  }
};

// 8. Get Support Desk Analytics Stats (Agent Only)
export const getAgentStats = async (req, res) => {
  try {
    // 1. Total counts by status
    const statusCountsResult = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM tickets 
       GROUP BY status`
    );

    // 2. Total counts by priority
    const priorityCountsResult = await pool.query(
      `SELECT priority, COUNT(*) as count 
       FROM tickets 
       GROUP BY priority`
    );

    // 3. Category counts
    const categoryCountsResult = await pool.query(
      `SELECT category, COUNT(*) as count 
       FROM tickets 
       GROUP BY category`
    );

    // 4. Module counts
    const moduleCountsResult = await pool.query(
      `SELECT module, COUNT(*) as count 
       FROM tickets 
       GROUP BY module`
    );

    // Fetch all categories and modules to initialize counts to 0
    const dbCategories = await pool.query('SELECT name FROM categories');
    const dbModules = await pool.query('SELECT name FROM modules');

    // Format results
    const stats = {
      status: { open: 0, assigned: 0, resolved: 0 },
      priority: { low: 0, medium: 0, high: 0 },
      category: {},
      module: {},
      total: 0
    };

    dbCategories.rows.forEach(c => {
      stats.category[c.name] = 0;
    });

    dbModules.rows.forEach(m => {
      stats.module[m.name] = 0;
    });

    statusCountsResult.rows.forEach(r => {
      if (stats.status[r.status] !== undefined) {
        stats.status[r.status] = parseInt(r.count, 10);
      }
    });

    priorityCountsResult.rows.forEach(r => {
      if (stats.priority[r.priority] !== undefined) {
        stats.priority[r.priority] = parseInt(r.count, 10);
      }
    });

    categoryCountsResult.rows.forEach(r => {
      stats.category[r.category] = parseInt(r.count, 10);
    });

    moduleCountsResult.rows.forEach(r => {
      stats.module[r.module] = parseInt(r.count, 10);
    });

    stats.total = stats.status.open + stats.status.assigned + stats.status.resolved;

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ error: 'Server error while fetching statistics.' });
  }
};

// 9. Dynamic Categories CRUD Controllers

export const getErrorTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM error_types ORDER BY error_id ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching error types:', error);
    return res.status(500).json({ error: 'Server error while fetching error types.' });
  }
};

export const createErrorType = async (req, res) => {
  const { error_id, description, remark } = req.body;
  if (!error_id || !description) {
    return res.status(400).json({ error: 'error_id and description are required.' });
  }

  try {
    const checkExist = await pool.query('SELECT * FROM error_types WHERE error_id = $1', [error_id.trim()]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ error: 'Error type ID already exists.' });
    }

    const result = await pool.query(
      'INSERT INTO error_types (error_id, description, remark) VALUES ($1, $2, $3) RETURNING *',
      [error_id.trim(), description.trim(), remark ? remark.trim() : '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating error type:', error);
    return res.status(500).json({ error: 'Server error while creating error type.' });
  }
};

export const updateErrorType = async (req, res) => {
  const { id } = req.params; // Using id in the route for error_id
  const { description, remark } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'description is required.' });
  }

  try {
    const result = await pool.query(
      'UPDATE error_types SET description = $1, remark = $2 WHERE error_id = $3 RETURNING *',
      [description.trim(), remark ? remark.trim() : '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Error type not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating error type:', error);
    return res.status(500).json({ error: 'Server error while updating error type.' });
  }
};

export const deleteErrorType = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM error_types WHERE error_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Error type not found.' });
    }

    return res.status(200).json({ message: 'Error type deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting error type:', error);
    return res.status(500).json({ error: 'Server error while deleting error type.' });
  }
};
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Server error while fetching categories.' });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  try {
    const checkExist = await pool.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Server error while creating category.' });
  }
};

export const deleteCategory = async (req, res) => {
  const { name } = req.params;

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(countResult.rows[0].count, 10) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last remaining category.' });
    }

    const result = await pool.query(
      'DELETE FROM categories WHERE name = $1 RETURNING *',
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    return res.status(200).json({ message: 'Category deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ error: 'Server error while deleting category.' });
  }
};

export const updateCategory = async (req, res) => {
  const { name } = req.params;
  const { newName } = req.body;

  if (!newName || !newName.trim()) {
    return res.status(400).json({ error: 'New category name is required.' });
  }

  try {
    const checkResult = await pool.query('SELECT * FROM categories WHERE name = $1', [newName.trim()]);
    if (checkResult.rows.length > 0 && newName.trim() !== name) {
      return res.status(400).json({ error: 'New category name already exists.' });
    }

    await pool.query('BEGIN');

    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE name = $2 RETURNING *',
      [newName.trim(), name]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Category not found.' });
    }

    await pool.query(
      'UPDATE tickets SET category = $1 WHERE category = $2',
      [newName.trim(), name]
    );

    await pool.query('COMMIT');
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating category:', error);
    return res.status(500).json({ error: 'Server error while updating category.' });
  }
};

// 10. Dynamic Modules CRUD Controllers
export const getModules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM modules ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({ error: 'Server error while fetching modules.' });
  }
};

export const createModule = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Module name is required.' });
  }

  try {
    const checkExist = await pool.query('SELECT * FROM modules WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ error: 'Module already exists.' });
    }

    const result = await pool.query(
      'INSERT INTO modules (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating module:', error);
    return res.status(500).json({ error: 'Server error while creating module.' });
  }
};

export const deleteModule = async (req, res) => {
  const { name } = req.params;

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM modules');
    if (parseInt(countResult.rows[0].count, 10) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last remaining module.' });
    }

    const result = await pool.query(
      'DELETE FROM modules WHERE name = $1 RETURNING *',
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    return res.status(200).json({ message: 'Module deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting module:', error);
    return res.status(500).json({ error: 'Server error while deleting module.' });
  }
};

export const updateModule = async (req, res) => {
  const { name } = req.params;
  const { newName } = req.body;

  if (!newName || !newName.trim()) {
    return res.status(400).json({ error: 'New module name is required.' });
  }

  try {
    const checkResult = await pool.query('SELECT * FROM modules WHERE name = $1', [newName.trim()]);
    if (checkResult.rows.length > 0 && newName.trim() !== name) {
      return res.status(400).json({ error: 'New module name already exists.' });
    }

    await pool.query('BEGIN');

    const result = await pool.query(
      'UPDATE modules SET name = $1 WHERE name = $2 RETURNING *',
      [newName.trim(), name]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Module not found.' });
    }

    await pool.query(
      'UPDATE tickets SET module = $1 WHERE module = $2',
      [newName.trim(), name]
    );

    await pool.query('COMMIT');
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating module:', error);
    return res.status(500).json({ error: 'Server error while updating module.' });
  }
};

// 13. Dynamic Roles CRUD Controllers
export const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({ error: 'Server error while fetching roles.' });
  }
};

export const createRole = async (req, res) => {
  const { name, base_role } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Role name is required.' });
  }
  if (!['customer', 'agent', 'admin'].includes(base_role)) {
    return res.status(400).json({ error: 'Invalid base role.' });
  }

  try {
    const checkExist = await pool.query('SELECT * FROM roles WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ error: 'Role already exists.' });
    }

    const result = await pool.query(
      'INSERT INTO roles (name, base_role) VALUES ($1, $2) RETURNING *',
      [name.trim(), base_role]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({ error: 'Server error while creating role.' });
  }
};

export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, base_role } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Role name is required.' });
  }
  if (!['customer', 'agent', 'admin'].includes(base_role)) {
    return res.status(400).json({ error: 'Invalid base role.' });
  }

  try {
    const checkExist = await pool.query('SELECT * FROM roles WHERE LOWER(name) = LOWER($1) AND id != $2', [name.trim(), id]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ error: 'Role name already in use by another record.' });
    }

    const oldRoleRes = await pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    if (oldRoleRes.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found.' });
    }
    const oldRoleName = oldRoleRes.rows[0].name;

    const result = await pool.query(
      'UPDATE roles SET name = $1, base_role = $2 WHERE id = $3 RETURNING *',
      [name.trim(), base_role, id]
    );

    // If role name changed, update it in users table
    if (oldRoleName.toLowerCase() !== name.trim().toLowerCase()) {
      await pool.query('UPDATE users SET role = $1 WHERE LOWER(role) = LOWER($2)', [name.trim(), oldRoleName]);
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ error: 'Server error while updating role.' });
  }
};

export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if role is used by any user
    const roleRes = await pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    if (roleRes.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found.' });
    }

    const roleName = roleRes.rows[0].name;
    const checkUser = await pool.query('SELECT 1 FROM users WHERE role = $1 LIMIT 1', [roleName]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete role because it is currently assigned to one or more users.' });
    }

    const result = await pool.query(
      'DELETE FROM roles WHERE id = $1 RETURNING *',
      [id]
    );

    return res.status(200).json({ message: 'Role deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({ error: 'Server error while deleting role.' });
  }
};

// 14. Update Ticket Solution and Workaround (Agent/Admin Only)
export const updateTicketSolutionWorkaround = async (req, res) => {
  const { id: userId, role } = req.user;
  const ticketId = req.params.id;
  const { solution, workaround } = req.body;

  try {
    // Check if ticket exists
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    // Only agents and admins can update this
    if (role !== 'agent' && role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only support agents and admins can edit solution or workaround.' });
    }

    await pool.query(
      `UPDATE tickets 
       SET solution = $1, workaround = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [solution, workaround, ticketId]
    );

    // Fetch the full ticket details again to return consistent format
    const ticketResult = await pool.query(
      `SELECT t.*, 
              c.name as customer_name, c.email as customer_email,
              
              a.name as agent_name
       FROM tickets t
       JOIN users c ON t.customer_id = c.id
       LEFT JOIN users a ON t.agent_id = a.id
       WHERE t.id = $1`,
      [ticketId]
    );

    return res.status(200).json(ticketResult.rows[0]);
  } catch (error) {
    console.error('Error updating solution/workaround:', error);
    return res.status(500).json({ error: 'Server error while updating solution/workaround.' });
  }
};

// 15. Add Ticket Attachments (Customer who owns the ticket OR Agent/Admin Only)
export const addTicketAttachments = async (req, res) => {
  const { id: userId, role } = req.user;
  const ticketId = req.params.id;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No image files were provided for upload.' });
  }

  try {
    // Check if ticket exists
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = checkTicket.rows[0];

    // Authorization: owner customer OR agent/admin
    if (role !== 'agent' && role !== 'admin' && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this ticket.' });
    }

    // Insert all uploaded files into ticket_attachments table
    for (const file of req.files) {
      const fileUrl = `/uploads/${file.filename}`;
      const fileName = file.originalname;
      await pool.query(
        `INSERT INTO ticket_attachments (ticket_id, file_url, file_name) VALUES ($1, $2, $3)`,
        [ticketId, fileUrl, fileName]
      );
    }

    // Update tickets' updated_at
    await pool.query('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [ticketId]);

    // Fetch and return the updated ticket details
    const ticketResult = await pool.query(
      `SELECT t.*, 
              c.name as customer_name, c.email as customer_email,
              
              a.name as agent_name
       FROM tickets t
       JOIN users c ON t.customer_id = c.id
       LEFT JOIN users a ON t.agent_id = a.id
       WHERE t.id = $1`,
      [ticketId]
    );

    const fullTicket = ticketResult.rows[0];
    const attachmentsRes = await pool.query(
      `SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketId]
    );
    fullTicket.attachments = attachmentsRes.rows;

    return res.status(200).json(fullTicket);
  } catch (error) {
    console.error('Error adding ticket attachments:', error);
    return res.status(500).json({ error: 'Server error while uploading attachments.' });
  }
};

// 16. Delete Ticket Attachment (Customer who owns the ticket OR Agent/Admin Only)
export const deleteTicketAttachment = async (req, res) => {
  const { id: userId, role } = req.user;
  const { id: ticketId, attachmentId } = req.params;

  try {
    // Check if ticket exists
    const checkTicket = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (checkTicket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = checkTicket.rows[0];

    // Authorization: owner customer OR agent/admin
    if (role !== 'agent' && role !== 'admin' && ticket.customer_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this ticket.' });
    }

    // Check if attachment exists and belongs to this ticket
    const checkAttachment = await pool.query(
      'SELECT * FROM ticket_attachments WHERE id = $1 AND ticket_id = $2',
      [attachmentId, ticketId]
    );
    
    if (checkAttachment.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found for this ticket.' });
    }

    const attachment = checkAttachment.rows[0];

    // Delete the file from the uploads directory
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const fileName = path.basename(attachment.file_url);
      const filePath = path.join(__dirname, '../uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.error('Error deleting attachment file from system:', fsErr);
    }

    // Delete the record from database
    await pool.query('DELETE FROM ticket_attachments WHERE id = $1', [attachmentId]);

    // Update tickets' updated_at
    await pool.query('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [ticketId]);

    // Fetch and return the updated ticket details
    const ticketResult = await pool.query(
      `SELECT t.*, 
              c.name as customer_name, c.email as customer_email,
              
              a.name as agent_name
       FROM tickets t
       JOIN users c ON t.customer_id = c.id
       LEFT JOIN users a ON t.agent_id = a.id
       WHERE t.id = $1`,
      [ticketId]
    );

    const fullTicket = ticketResult.rows[0];
    const attachmentsRes = await pool.query(
      `SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketId]
    );
    fullTicket.attachments = attachmentsRes.rows;

    return res.status(200).json(fullTicket);
  } catch (error) {
    console.error('Error deleting ticket attachment:', error);
    return res.status(500).json({ error: 'Server error while deleting attachment.' });
  }
};

// New Config Endpoints
export const getProgramTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM program_types ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching program types:', error);
    return res.status(500).json({ error: 'Server error while fetching program types.' });
  }
};

export const getIssueTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM issue_types ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching issue types:', error);
    return res.status(500).json({ error: 'Server error while fetching issue types.' });
  }
};

export const createProgramType = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Program type name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO program_types (name) VALUES ($1) RETURNING *',
      [name]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating program type:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Program type already exists' });
    }
    return res.status(500).json({ error: 'Server error creating program type' });
  }
};

export const updateProgramType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Program type name is required' });
  try {
    const result = await pool.query(
      'UPDATE program_types SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Program type not found' });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating program type:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Program type name already exists' });
    }
    return res.status(500).json({ error: 'Server error updating program type' });
  }
};

export const deleteProgramType = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM program_types WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Program type not found' });
    return res.status(200).json({ message: 'Program type deleted successfully' });
  } catch (error) {
    console.error('Error deleting program type:', error);
    return res.status(500).json({ error: 'Server error deleting program type' });
  }
};

export const createIssueType = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Issue type name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO issue_types (name) VALUES ($1) RETURNING *',
      [name]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating issue type:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Issue type already exists' });
    }
    return res.status(500).json({ error: 'Server error creating issue type' });
  }
};

export const updateIssueType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Issue type name is required' });
  try {
    const result = await pool.query(
      'UPDATE issue_types SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Issue type not found' });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating issue type:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Issue type name already exists' });
    }
    return res.status(500).json({ error: 'Server error updating issue type' });
  }
};

export const deleteIssueType = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM issue_types WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Issue type not found' });
    return res.status(200).json({ message: 'Issue type deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue type:', error);
    return res.status(500).json({ error: 'Server error deleting issue type' });
  }
};
