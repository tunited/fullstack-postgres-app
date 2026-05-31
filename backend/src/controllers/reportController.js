import pool from '../config/db.js';

export const getSummaryReport = async (req, res) => {
  const { filter, custNum } = req.query; // 'daily', 'weekly', 'monthly', or 'all'
  let dateFilter = '';
  
  if (filter === 'daily') {
    dateFilter = "AND created_at >= CURRENT_DATE";
  } else if (filter === 'weekly') {
    dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
  } else if (filter === 'monthly') {
    dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '1 month'";
  }

  let customerFilter = '';
  const queryParams = [];
  if (custNum && custNum !== 'all') {
    queryParams.push(custNum);
    customerFilter = `AND t.cust_num = $1`;
  }

  try {
    // Fetch all tickets for the period with customer and agent info
    const ticketsQuery = `
      SELECT t.*, 
             c.name as customer_name, c.cust_num as customer_cust_num,
             a.name as agent_name
      FROM tickets t
      JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.agent_id = a.id
      WHERE 1=1 ${dateFilter.replace('created_at', 't.created_at')} ${customerFilter}
      ORDER BY t.created_at DESC
    `;
    const ticketsResult = await pool.query(ticketsQuery, queryParams);
    const tickets = ticketsResult.rows;

    const totalCases = tickets.length;
    
    const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'assigned');
    const activeCases = activeTickets.length;

    const closedTickets = tickets.filter(t => t.status === 'resolved');
    const closedCases = closedTickets.length;

    // Calculate average resolution time using DB for accuracy on resolved_at
    const avgParams = [];
    let avgCustomerFilter = '';
    if (custNum && custNum !== 'all') {
      avgParams.push(custNum);
      avgCustomerFilter = `AND cust_num = $1`;
    }
    const avgTimeResult = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_seconds
      FROM tickets 
      WHERE status = 'resolved' AND resolved_at IS NOT NULL ${dateFilter} ${avgCustomerFilter}
    `, avgParams);
    
    const avgSeconds = avgTimeResult.rows[0].avg_seconds ? parseFloat(avgTimeResult.rows[0].avg_seconds) : 0;
    
    return res.status(200).json({
      totalCases,
      activeCases,
      closedCases,
      avgResolutionSeconds: avgSeconds,
      tickets,
      activeTickets,
      closedTickets
    });

  } catch (error) {
    console.error('Error fetching report summary:', error);
    return res.status(500).json({ error: 'Server error while fetching report summary.' });
  }
};
