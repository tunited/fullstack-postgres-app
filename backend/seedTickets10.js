import pool from './src/config/db.js';

async function seedTickets() {
  try {
    console.log('Fetching customers and metadata...');
    
    // Get all users with role 'customer'
    const usersRes = await pool.query("SELECT id FROM users WHERE role = 'customer'");
    const userIds = usersRes.rows.map(r => r.id);
    
    if (userIds.length === 0) {
      console.log('No customer users found. Please create a customer first.');
      return;
    }

    // Get all customers (for cust_num)
    const customersRes = await pool.query('SELECT cust_num FROM customers');
    const custNums = customersRes.rows.map(r => r.cust_num);

    if (custNums.length === 0) {
      console.log('No customers found in customers table.');
      return;
    }

    // Get all agents (for random assignment)
    const agentsRes = await pool.query("SELECT id FROM users WHERE role IN ('agent', 'admin')");
    const agentIds = agentsRes.rows.map(r => r.id);

    // Metadata
    const categoriesRes = await pool.query('SELECT name FROM categories');
    const categories = categoriesRes.rows.map(r => r.name);

    const modulesRes = await pool.query('SELECT name FROM modules');
    const modules = modulesRes.rows.map(r => r.name);
    
    const programTypesRes = await pool.query('SELECT name FROM program_types');
    const programTypes = programTypesRes.rows.map(r => r.name);
    
    const issueTypesRes = await pool.query('SELECT name FROM issue_types');
    const issueTypes = issueTypesRes.rows.map(r => r.name);

    const priorities = ['low', 'medium', 'high'];
    const statuses = ['open', 'assigned', 'resolved'];

    const sampleTitles = [
      'Cannot login to the system',
      'Report generating too slow',
      'Error when saving data',
      'Need permission to access module',
      'Data mismatch in dashboard',
      'App crashing on startup',
      'Please update my email',
      'How to export data?',
      'Wrong calculation in GL',
      'Missing attachments in AR'
    ];

    const sampleForms = ['FRM-001', 'FRM-002', 'GL-Report', 'AR-Dashboard', 'Settings'];

    console.log(`Starting generation of 10 tickets...`);
    
    let createdCount = 0;

    for (let i = 0; i < 10; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomCustNum = custNums[Math.floor(Math.random() * custNums.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomModule = modules[Math.floor(Math.random() * modules.length)];
      const randomProgramType = programTypes[Math.floor(Math.random() * programTypes.length)] || 'Standard';
      const randomIssueType = issueTypes[Math.floor(Math.random() * issueTypes.length)] || 'Technical';
      
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAgentId = (randomStatus === 'assigned' || randomStatus === 'resolved') && agentIds.length > 0
        ? agentIds[Math.floor(Math.random() * agentIds.length)]
        : null;
        
      const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)] + ' #' + i;
      const randomForm = sampleForms[Math.floor(Math.random() * sampleForms.length)];
      
      const description = `This is an automated generated ticket description for case #${i}. Priority: ${randomPriority}.`;

      // Generate ticket number: custNum + YY + MM + running
      const now = new Date();
      // Randomize created_at slightly to make them look real
      const randomDaysAgo = Math.floor(Math.random() * 30);
      now.setDate(now.getDate() - randomDaysAgo);
      
      const yearStr = now.getFullYear().toString().slice(2);
      const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `${randomCustNum}${yearStr}${monthStr}`;
      
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
      
      const resolvedAt = randomStatus === 'resolved' ? new Date().toISOString() : null;
      const resolvedBy = randomStatus === 'resolved' ? randomAgentId : null;

      await pool.query(
        `INSERT INTO tickets (
          ticket_number, title, description, category, module, program_type, issue_type, form_name, priority, status, 
          customer_id, cust_num, agent_id, created_at, updated_at, resolved_at, resolved_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, $15, $16)`,
        [
          ticketNumber, randomTitle, description, randomCategory, randomModule, randomProgramType, randomIssueType, randomForm, 
          randomPriority, randomStatus, randomUserId, randomCustNum, randomAgentId,
          now.toISOString(), resolvedAt, resolvedBy
        ]
      );
      createdCount++;
    }

    console.log(`Successfully generated ${createdCount} tickets!`);

  } catch (error) {
    console.error('Error seeding tickets:', error);
  } finally {
    await pool.end();
  }
}

seedTickets();
