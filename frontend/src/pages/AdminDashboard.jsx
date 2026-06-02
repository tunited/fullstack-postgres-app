import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigateToTickets, onViewTicket }) {
  const { user, API_URL } = useAuth();
  const [filter, setFilter] = useState('all'); // 'daily', 'weekly', 'monthly', 'all'
  const [custNumFilter, setCustNumFilter] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [report, setReport] = useState({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    avgResolutionSeconds: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBlock, setSelectedBlock] = useState(null); // 'total', 'active', 'closed'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Insights & Pivot States
  const [activeSubTab, setActiveSubTab] = useState('summary'); // 'summary' or 'insights'
  const [insightYear, setInsightYear] = useState(new Date().getFullYear());
  const [insightCustomer, setInsightCustomer] = useState('all');
  const [insightAgent, setInsightAgent] = useState('all');

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBlock, filter, custNumFilter, searchQuery, priorityFilter]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchReport();
    setSelectedBlock(null); // Reset selection when filter changes
  }, [filter, custNumFilter]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('apex_token');
      const response = await fetch(`${API_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('apex_token');
      const response = await fetch(`${API_URL}/reports/summary?filter=${filter}&custNum=${custNumFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถดึงข้อมูลรายงานได้');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return <div>0 นาที</div>;
    if (seconds < 60) return <div>&lt; 1 นาที</div>;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    if (h > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div>{h} ชั่วโมง</div>
          <div>{m} นาที</div>
        </div>
      );
    }
    return <div>{m} นาที</div>;
  };

  const getFilteredTickets = (rawTickets) => {
    if (!rawTickets) return [];
    return rawTickets.filter(t => {
      const matchSearch = searchQuery.trim() === '' || 
        (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.ticket_number && t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      
      return matchSearch && matchPriority;
    });
  };

  const handleExportCSV = (ticketsToExport) => {
    if (!ticketsToExport || ticketsToExport.length === 0) return;
    
    // Header columns
    const headers = [
      'Ticket Number',
      'Title',
      'Customer',
      'Priority',
      'Category',
      'Module',
      'Status',
      'Created At',
      'Resolved At',
      'Agent'
    ];
    
    const rows = ticketsToExport.map(t => [
      t.ticket_number || ('#' + t.id),
      t.title.replace(/"/g, '""'),
      (t.user_name || t.customer_name) + ' (' + (t.actual_customer_name || t.customer_cust_num || '-') + ')',
      t.priority,
      t.category,
      t.module,
      t.status === 'open' ? 'รอดำเนินการ' : t.status === 'assigned' ? 'กำลังแก้ไข' : 'ปิดเคสแล้ว',
      new Date(t.created_at).toLocaleString('th-TH'),
      t.resolved_at ? new Date(t.resolved_at).toLocaleString('th-TH') : '-',
      t.agent_name || '-'
    ]);
    
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ppcc_care_report_${filter}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTicketTable = (title, tickets, emptyMessage, colorClass, colorHex) => {
    const totalPages = Math.ceil((tickets?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTickets = tickets ? tickets.slice(startIndex, startIndex + itemsPerPage) : [];

    return (
      <div className={`glass-card ${colorClass}`} style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: '0.5rem 0 0 0.75rem', color: colorHex }}>{title} ({tickets?.length || 0})</h3>
          {tickets && tickets.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center' }}>
                แสดงหน้าละ:
                <select 
                  className="glass-input" 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ marginLeft: '0.5rem', padding: '0.2rem 1.5rem 0.2rem 0.5rem', width: 'auto', minWidth: '70px', height: '30px' }}
                >
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          )}
        </div>

        {tickets && tickets.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', color: '#475569', fontWeight: 'bold' }}>หัวข้อ (Title)</th>
                  <th style={{ padding: '0.75rem', color: '#475569', fontWeight: 'bold' }}>ผู้แจ้งเรื่อง (RequestBy)</th>
                  <th style={{ padding: '0.75rem', color: '#475569', fontWeight: 'bold' }}>สถานะ (Status)</th>
                  <th style={{ padding: '0.75rem', color: '#475569', fontWeight: 'bold' }}>เวลาอัปเดต (Time)</th>
                  <th style={{ padding: '0.75rem', color: '#475569', fontWeight: 'bold' }}>ผู้รับผิดชอบ (Agent)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map(ticket => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td 
                      style={{ padding: '0.75rem', color: '#1e293b', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.15)' }}
                      onClick={() => window.open(`/?ticketId=${ticket.id}`, '_blank')}
                      title="คลิกเพื่อดูรายละเอียด (เปิดในแท็บใหม่)"
                    >
                      {ticket.ticket_number || '#' + ticket.id} {ticket.title}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#334155' }}>{ticket.user_name || ticket.customer_name} <span style={{fontSize: '0.85em', color: '#64748b'}}>({ticket.actual_customer_name || ticket.user_cust_num || ticket.customer_cust_num || '-'})</span></td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge-status ${ticket.status}`}>
                        {ticket.status === 'open' ? 'รอดำเนินการ' : ticket.status === 'assigned' ? 'กำลังแก้ไข' : 'ปิดเคสแล้ว'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#334155' }}>
                      {new Date(ticket.status === 'resolved' && ticket.resolved_at ? ticket.resolved_at : ticket.created_at).toLocaleString('th-TH')}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{ticket.agent_name || (ticket.status === 'resolved' ? '-' : 'ยังไม่มีเจ้าหน้าที่รับเคส')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', margin: 0 }}
                >
                  ◀ ก่อนหน้า
                </button>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', margin: 0 }}
                >
                  ถัดไป ▶
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: '#64748b', padding: '1rem 0.75rem' }}>{emptyMessage}</p>
        )}
      </div>
    );
  };

  // Calculate dynamic stats for the selected report interval
  let ticketsForAnalytics = report.tickets || [];
  if (selectedBlock === 'active') {
    ticketsForAnalytics = report.activeTickets || [];
  } else if (selectedBlock === 'closed') {
    ticketsForAnalytics = report.closedTickets || [];
  }

  const stats = {
    priority: { low: 0, medium: 0, high: 0 },
    category: {},
    module: {},
    total: ticketsForAnalytics.length
  };

  ticketsForAnalytics.forEach(ticket => {
    // Priority
    if (ticket.priority === 'low') stats.priority.low++;
    else if (ticket.priority === 'medium') stats.priority.medium++;
    else if (ticket.priority === 'high') stats.priority.high++;

    // Category
    if (ticket.category) {
      stats.category[ticket.category] = (stats.category[ticket.category] || 0) + 1;
    }

    // Module
    if (ticket.module) {
      stats.module[ticket.module] = (stats.module[ticket.module] || 0) + 1;
    }
  });

  const getPercent = (value) => {
    if (stats.total === 0) return '0%';
    return `${Math.round((value / stats.total) * 100)}%`;
  };

  // --- INSIGHTS & PIVOT MATRIX CALCULATIONS ---
  const allTickets = report.tickets || [];

  // Extract unique years, agents, customers
  const years = Array.from(new Set(allTickets.map(t => {
    if (!t.created_at) return null;
    return new Date(t.created_at).getFullYear();
  }).filter(Boolean))).sort((a,b) => b-a);
  if (years.length === 0) years.push(new Date().getFullYear());

  const agents = Array.from(new Set(allTickets.map(t => t.agent_name).filter(Boolean))).sort();
  const uniqueCustomers = Array.from(new Set(allTickets.map(t => t.customer_name || t.customer_cust_num).filter(Boolean))).sort();

  // Filter tickets for active insights view
  const insightFilteredTickets = allTickets.filter(t => {
    if (!t.created_at) return false;
    const tDate = new Date(t.created_at);
    const matchYear = tDate.getFullYear() === Number(insightYear);
    const matchCust = insightCustomer === 'all' || (t.customer_name === insightCustomer || t.customer_cust_num === insightCustomer);
    const matchAgent = insightAgent === 'all' || t.agent_name === insightAgent;
    return matchYear && matchCust && matchAgent;
  });

  // Calculate monthly stats for the Line/Area Trend Chart
  const monthlyCounts = Array(12).fill(0);
  insightFilteredTickets.forEach(t => {
    if (!t.created_at) return;
    const month = new Date(t.created_at).getMonth();
    monthlyCounts[month]++;
  });

  const maxMonthlyCount = Math.max(...monthlyCounts, 1);

  // Generate Pivot Matrix Data (Rows: Customer, Cols: Jan-Dec)
  const pivotCustomers = insightCustomer === 'all' ? uniqueCustomers : [insightCustomer];
  
  const pivotData = pivotCustomers.map(cust => {
    const months = Array(12).fill(0);
    let total = 0;
    
    allTickets.forEach(t => {
      if (!t.created_at) return;
      const tDate = new Date(t.created_at);
      if (tDate.getFullYear() === Number(insightYear)) {
        const isThisCust = t.customer_name === cust || t.customer_cust_num === cust;
        const isThisAgent = insightAgent === 'all' || t.agent_name === insightAgent;
        if (isThisCust && isThisAgent) {
          const month = tDate.getMonth();
          months[month]++;
          total++;
        }
      }
    });
    
    return { customer: cust, months, total };
  }).filter(row => row.total > 0 || (insightCustomer !== 'all' && uniqueCustomers.includes(insightCustomer))); // Filter out empty rows to keep it neat

  // Calculate Grand Totals for columns
  const columnTotals = Array(12).fill(0);
  let grandTotal = 0;
  pivotData.forEach(row => {
    row.months.forEach((count, m) => {
      columnTotals[m] += count;
      grandTotal += count;
    });
  });

  // Export Pivot CSV
  const handleExportPivotCSV = () => {
    const headers = ['ลูกค้า / บริษัท', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ยอดรวมสะสม (Total)'];
    
    const rows = pivotData.map(row => [
      row.customer,
      ...row.months,
      row.total
    ]);
    
    rows.push([
      'ยอดรวมสะสม (Total)',
      ...columnTotals,
      grandTotal
    ]);
    
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ppcc_care_pivot_${insightYear}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, background: 'linear-gradient(135deg, #a855f7, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
          📊 Admin Insights & Analytics Portal
        </h1>
        
        {activeSubTab === 'summary' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="glass-input" 
              style={{ margin: 0, minWidth: '150px' }}
              value={custNumFilter} 
              onChange={(e) => setCustNumFilter(e.target.value)}
            >
              <option value="all">ลูกค้าทั้งหมด (All Customers)</option>
              {customers.map(c => (
                <option key={c.id} value={c.cust_num}>{c.cust_num} - {c.cust_name}</option>
              ))}
            </select>
            <select 
              className="glass-input" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ margin: 0, width: 'auto', minWidth: '150px' }}
            >
              <option value="all">ทั้งหมด (All Time)</option>
              <option value="daily">รายวัน (Daily)</option>
              <option value="weekly">รายสัปดาห์ (Weekly)</option>
              <option value="monthly">รายเดือน (Monthly)</option>
            </select>
          </div>
        )}
      </div>

      <div className="segment-control" style={{ marginBottom: '2rem', display: 'inline-flex', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', padding: '0.25rem', borderRadius: '14px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('summary')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeSubTab === 'summary' ? '#ffffff' : 'transparent', color: activeSubTab === 'summary' ? '#1e293b' : '#64748b', boxShadow: activeSubTab === 'summary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          📊 สรุปประมวลผล (Overview Board)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('insights')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeSubTab === 'insights' ? '#ffffff' : 'transparent', color: activeSubTab === 'insights' ? '#1e293b' : '#64748b', boxShadow: activeSubTab === 'insights' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          📈 ตารางวิเคราะห์สรุปไขว้ (Pivot & Trend Analytics)
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : activeSubTab === 'summary' ? (
        <>
          <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            
            <div 
              className={`glass-card stat-card glow-cyan clickable-card ${selectedBlock === 'total' ? 'selected' : ''}`}
              onClick={() => setSelectedBlock('total')}
              style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0', fontWeight: 600 }}>📁 จำนวนเคสทั้งหมด</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0ea5e9' }}>{report.totalCases}</div>
            </div>
            
            <div 
              className={`glass-card stat-card glow-purple clickable-card ${selectedBlock === 'active' ? 'selected' : ''}`}
              onClick={() => setSelectedBlock('active')}
              style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0', fontWeight: 600 }}>⏳ กำลังดำเนินการ</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{report.activeCases}</div>
            </div>
            
            <div 
              className={`glass-card stat-card glow-green clickable-card ${selectedBlock === 'closed' ? 'selected' : ''}`} 
              style={{ borderTop: '3px solid #10b981', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setSelectedBlock('closed')}
            >
              <h3 style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0', fontWeight: 600 }}>✅ ปิดเคสแล้ว</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{report.closedCases}</div>
            </div>

            <div className="glass-card stat-card glow-orange" style={{ borderTop: '3px solid #f59e0b', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0', fontWeight: 600 }}>⏱️ เวลาเฉลี่ยต่อเคส</h3>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', textAlign: 'right' }}>
                {formatTime(report.avgResolutionSeconds)}
              </div>
            </div>

          </div>

          {/* 🔍 Advanced Search, Filters Panel & Export CSV */}
          {report && (
            <div className="search-filter-panel">
              <div className="filter-row">
                <div className="filter-item">
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="🔍 ค้นหาด้วยคำสำคัญ (หัวข้อ, รายละเอียด, รหัสตั๋ว)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
                <div className="filter-item-small">
                  <select
                    className="glass-input"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ margin: 0 }}
                  >
                    <option value="all">ความเร่งด่วน (ทั้งหมด)</option>
                    <option value="high">สูง (High)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="low">ต่ำ (Low)</option>
                  </select>
                </div>
                <button
                  className="btn btn-export-csv"
                  onClick={() => handleExportCSV(getFilteredTickets(selectedBlock === 'active' ? report.activeTickets : selectedBlock === 'closed' ? report.closedTickets : report.tickets))}
                  disabled={getFilteredTickets(selectedBlock === 'active' ? report.activeTickets : selectedBlock === 'closed' ? report.closedTickets : report.tickets).length === 0}
                  style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  📥 ส่งออกข้อมูล ({getFilteredTickets(selectedBlock === 'active' ? report.activeTickets : selectedBlock === 'closed' ? report.closedTickets : report.tickets).length}) CSV
                </button>
              </div>
            </div>
          )}

          {/* Tables for tickets */}
          {report && selectedBlock && (
            <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
              {selectedBlock === 'total' && renderTicketTable('📁 จำนวนเคสทั้งหมด', getFilteredTickets(report.tickets), 'ไม่มีเคสในระบบ', 'glow-cyan', '#0ea5e9')}
              {selectedBlock === 'active' && renderTicketTable('⏳ เคสที่กำลังดำเนินการ', getFilteredTickets(report.activeTickets), 'ไม่มีเคสที่กำลังดำเนินการ', 'glow-purple', '#8b5cf6')}
              {selectedBlock === 'closed' && renderTicketTable('✅ เคสที่ปิดแล้ว', getFilteredTickets(report.closedTickets), 'ไม่มีเคสที่ถูกปิดในช่วงเวลานี้', 'glow-green', '#10b981')}
            </div>
          )}

          {/* Analytics breakdown panel */}
          {report && report.tickets && (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', background: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  📊 บทวิเคราะห์ข้อมูลและสัดส่วนตั๋วบริการ (Ticket Analytics)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>สรุปวิเคราะห์เปรียบเทียบสัดส่วนตั๋วบริการช่วยเหลือในรูปแบบกราฟวิเคราะห์ผล</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {/* Priority Section */}
                <div className="chart-glass-card" style={{ padding: '1.5rem', alignItems: 'stretch', textAlign: 'left' }}>
                  <span className="chart-title">🔴 ระดับความเร่งด่วน (Priority Ratio)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1, justifyContent: 'center' }}>
                    <div className="analytics-bar-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <span style={{ color: '#ef4444' }}>สูง (High)</span>
                        <span>{stats.priority.high} เคส ({getPercent(stats.priority.high)})</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: getPercent(stats.priority.high), height: '100%', backgroundColor: 'var(--priority-high)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                      </div>
                    </div>
                    
                    <div className="analytics-bar-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <span style={{ color: '#d97706' }}>ปานกลาง (Medium)</span>
                        <span>{stats.priority.medium} เคส ({getPercent(stats.priority.medium)})</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: getPercent(stats.priority.medium), height: '100%', backgroundColor: 'var(--priority-medium)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                      </div>
                    </div>

                    <div className="analytics-bar-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <span style={{ color: '#475569' }}>ต่ำ (Low)</span>
                        <span>{stats.priority.low} เคส ({getPercent(stats.priority.low)})</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: getPercent(stats.priority.low), height: '100%', backgroundColor: 'var(--priority-low)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Donut Chart Section */}
                <div className="chart-glass-card">
                  <span className="chart-title">🏷️ สัดส่วนหมวดหมู่ยอดนิยม (Categories)</span>
                  
                  <div className="svg-donut-wrapper">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="10" />
                      {(() => {
                        const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'];
                        const donutData = Object.keys(stats.category).map((cat, index) => {
                          const count = stats.category[cat];
                          const pct = stats.total === 0 ? 0 : (count / stats.total) * 100;
                          return { label: cat, count, pct, color: colors[index % colors.length] };
                        });
                        
                        let cumulativePercent = 0;
                        return donutData.map((d) => {
                          const strokeDasharray = 251.2;
                          const strokeDashoffset = strokeDasharray - (strokeDasharray * d.pct) / 100;
                          const rotationAngle = -90 + (cumulativePercent * 3.6);
                          cumulativePercent += d.pct;
                          return (
                            <circle
                              key={d.label}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={d.color}
                              strokeWidth="10"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="svg-donut-circle"
                              style={{
                                transform: `rotate(${rotationAngle}deg)`,
                                transformOrigin: '50px 50px'
                              }}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="donut-center-info">
                      <span className="donut-center-number">{stats.total}</span>
                      <span className="donut-center-label">เคสรวม</span>
                    </div>
                  </div>

                  <div className="chart-legend">
                    {Object.keys(stats.category).map((cat, index) => {
                      const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'];
                      const color = colors[index % colors.length];
                      return (
                        <div key={cat} className="legend-item">
                          <span className="legend-color-dot" style={{ backgroundColor: color }}></span>
                          <span>{cat} ({stats.category[cat]})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modules Bar Chart Section */}
                <div className="chart-glass-card">
                  <span className="chart-title">🧩 โมดูลระบบงานยอดนิยม (Modules Frequency)</span>
                  
                  {Object.keys(stats.module).length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                      ยังไม่มีข้อมูลโมดูลตั๋วในระบบ
                    </div>
                  ) : (
                    <div style={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div className="bar-chart-container">
                        {Object.keys(stats.module).slice(0, 6).map((mod, index) => {
                          const count = stats.module[mod];
                          const maxCount = Math.max(...Object.values(stats.module), 1);
                          const heightPercent = `${Math.round((count / maxCount) * 100)}%`;
                          const colors = ['#004bb5', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
                          const color = colors[index % colors.length];
                          return (
                            <div key={mod} className="bar-column">
                              <div className="bar-rect" style={{ height: heightPercent, backgroundColor: color }}>
                                <span className="bar-tooltip">{mod}: {count} เคส ({getPercent(count)})</span>
                              </div>
                              <div className="bar-label" title={mod}>{mod}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Parameter Filters Panel */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255, 255, 255, 0.85)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>📅 เลือกปีที่เปิดเคส:</label>
              <select className="glass-input" value={insightYear} onChange={(e) => setInsightYear(Number(e.target.value))} style={{ margin: 0 }}>
                {years.map(y => <option key={y} value={y}>ปี ค.ศ. {y} (พ.ศ. {y + 543})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 2, minWidth: '200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>🤝 เลือกลูกค้า / บริษัท:</label>
              <select className="glass-input" value={insightCustomer} onChange={(e) => setInsightCustomer(e.target.value)} style={{ margin: 0 }}>
                <option value="all">ลูกค้าทั้งหมด (All Customers)</option>
                {uniqueCustomers.map(cust => <option key={cust} value={cust}>{cust}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 2, minWidth: '200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>👤 เลือกเจ้าหน้าที่ดูแลเคส:</label>
              <select className="glass-input" value={insightAgent} onChange={(e) => setInsightAgent(e.target.value)} style={{ margin: 0 }}>
                <option value="all">เจ้าหน้าที่ทั้งหมด (All Agents)</option>
                {agents.map(ag => <option key={ag} value={ag}>{ag}</option>)}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleExportPivotCSV}
              style={{ height: '42px', marginTop: '1.25rem', padding: '0 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #a855f7, #00e5ff)', border: 'none', cursor: 'pointer', borderRadius: '10px' }}
            >
              📥 ส่งออกสรุปไขว้ (Export Pivot)
            </button>
          </div>

          {/* Dynamic Insight KPI Widgets */}
          <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card stat-card glow-cyan" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>📋 เคสรวมในมิติช่วงเวลานี้</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0ea5e9', marginTop: '0.25rem' }}>{insightFilteredTickets.length} เคส</div>
              </div>
              <span style={{ fontSize: '2rem' }}>🎫</span>
            </div>

            <div className="glass-card stat-card glow-purple" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>⏳ เคสกำลังประสานงาน</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#8b5cf6', marginTop: '0.25rem' }}>
                  {insightFilteredTickets.filter(t => t.status === 'open' || t.status === 'assigned').length} เคส
                </div>
              </div>
              <span style={{ fontSize: '2rem' }}>⏳</span>
            </div>

            <div className="glass-card stat-card glow-green" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '3px solid #10b981' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>🏆 เคสที่แก้ไขเสร็จสิ้น</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.25rem' }}>
                  {insightFilteredTickets.filter(t => t.status === 'resolved').length} เคส
                </div>
              </div>
              <span style={{ fontSize: '2rem' }}>✅</span>
            </div>

            <div className="glass-card stat-card glow-orange" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '3px solid #f59e0b' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>🎯 อัตราการปิดเคสสำเร็จ</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.25rem' }}>
                  {insightFilteredTickets.length > 0 
                    ? `${Math.round((insightFilteredTickets.filter(t => t.status === 'resolved').length / insightFilteredTickets.length) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
              <span style={{ fontSize: '2rem' }}>📈</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Caseload Trend (Monthly) SVG Chart */}
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', background: 'rgba(255, 255, 255, 0.85)' }}>
              <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                📈 แนวโน้มการเปิดเคสช่วยเหลือรายเดือน (Monthly Caseload Trend - {insightYear})
              </h4>
              
              <div style={{ height: '240px', position: 'relative', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {insightFilteredTickets.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    ไม่มีข้อมูลเคสเพื่อแสดงกราฟแนวโน้มสำหรับเงื่อนไขนี้
                  </div>
                ) : (
                  <>
                    <svg width="100%" height="85%" viewBox="0 0 550 160" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Gridlines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                        const y = 140 - (140 * ratio);
                        return (
                          <line key={index} x1="0" y1={y} x2="520" y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                        );
                      })}

                      {/* Area and Line Graph */}
                      {(() => {
                        const points = monthlyCounts.map((count, i) => {
                          const x = (520 / 11) * i;
                          const y = 140 - (count / maxMonthlyCount) * 120;
                          return { x, y, count, monthIndex: i };
                        });

                        const pathD = points.reduce((acc, p, i) => {
                          return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                        }, "");

                        const areaD = pathD + ` L 520 140 L 0 140 Z`;

                        return (
                          <>
                            <path d={areaD} fill="url(#areaGrad)" />
                            <path d={pathD} fill="none" stroke="#00e5ff" strokeWidth="3" />
                            {points.map((p, index) => (
                              <g key={index}>
                                <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#00e5ff" strokeWidth="2.5" />
                                {p.count > 0 && (
                                  <text x={p.x} y={p.y - 10} fontSize="10" fontWeight="800" textAnchor="middle" fill="#0f172a">
                                    {p.count}
                                  </text>
                                )}
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                    
                    {/* X-axis labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '5px', paddingRight: '25px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((m, i) => (
                        <span key={i}>{m}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Agent Performance Workload Matrix */}
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', background: 'rgba(255, 255, 255, 0.85)' }}>
              <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                👥 สถิติการปฏิบัติงานของเจ้าหน้าที่ (Agent Performance Matrix)
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {agents.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>ไม่มีสถิติตัวแทนดูแลเคสในเงื่อนไขการกรองนี้</p>
                ) : (
                  agents.map(agName => {
                    const agTickets = insightFilteredTickets.filter(t => t.agent_name === agName);
                    const agResolved = agTickets.filter(t => t.status === 'resolved').length;
                    const agActive = agTickets.length - agResolved;
                    const pct = agTickets.length > 0 ? Math.round((agResolved / agTickets.length) * 100) : 0;
                    
                    return (
                      <div key={agName} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{agName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                            {agTickets.length} เคส (เสร็จ {agResolved} / กำลังทำ {agActive}) - {pct}%
                          </span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.4s ease' }} title="เสร็จสิ้น"></div>
                          <div style={{ width: `${100 - pct}%`, height: '100%', backgroundColor: '#8b5cf6', transition: 'width 0.4s ease' }} title="รอดำเนินการ"></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Customer Monthly Pivot Grid */}
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', background: 'rgba(255, 255, 255, 0.9)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                  📊 ตารางวิเคราะห์สรุปไขว้จำแนกตามรายลูกค้าและช่วงเดือน (Customer Caseload Monthly Pivot Table - {insightYear})
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>ตารางสรุปจำนวนเคสที่ถูกสร้างแยกตามมิติเวลา (เดือน ม.ค. - ธ.ค.) และบริษัทคู่ค้า</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2.5px solid #cbd5e1', background: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569', minWidth: '160px' }}>ลูกค้า / บริษัท</th>
                    {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map(m => (
                      <th key={m} style={{ padding: '0.75rem', color: '#475569', width: '6.5%' }}>{m}</th>
                    ))}
                    <th style={{ padding: '0.75rem', color: '#0f172a', fontWeight: 800, background: 'rgba(14, 165, 233, 0.05)', width: '8%', borderLeft: '1px solid #cbd5e1' }}>ยอดรวม (Total)</th>
                  </tr>
                </thead>
                <tbody>
                  {pivotData.length === 0 ? (
                    <tr>
                      <td colSpan="14" style={{ padding: '3rem', color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
                        ไม่มีข้อมูลเคสที่ตรงตามเกณฑ์สำหรับแสดงตารางสรุปไขว้
                      </td>
                    </tr>
                  ) : (
                    <>
                      {pivotData.map(row => (
                        <tr key={row.customer} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>{row.customer}</td>
                          {row.months.map((count, mIdx) => (
                            <td key={mIdx} style={{ padding: '0.75rem', color: count > 0 ? '#0f172a' : '#94a3b8', fontWeight: count > 0 ? 600 : 400 }}>
                              {count > 0 ? count : '-'}
                            </td>
                          ))}
                          <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.03)', borderLeft: '1px solid #e2e8f0' }}>
                            {row.total}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Column Grand Totals row */}
                      <tr style={{ borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', background: 'rgba(14, 165, 233, 0.05)', fontWeight: 800 }}>
                        <td style={{ padding: '0.75rem', textAlign: 'left', color: '#1e293b' }}>ยอดรวมสะสม (Total)</td>
                        {columnTotals.map((colTotal, mIdx) => (
                          <td key={mIdx} style={{ padding: '0.75rem', color: colTotal > 0 ? '#0ea5e9' : '#94a3b8' }}>
                            {colTotal > 0 ? colTotal : '-'}
                          </td>
                        ))}
                        <td style={{ padding: '0.75rem', color: '#0284c7', background: 'rgba(14, 165, 233, 0.1)', borderLeft: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                          {grandTotal}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-table th { font-weight: 600; }
        .badge-status { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
        .badge-status.open { background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; }
        .badge-status.assigned { background: #fef3c7; color: #d97706; border: 1px solid #fcd34d; }
        .badge-status.resolved { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }
        
        .clickable-card {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .clickable-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .clickable-card.selected {
          border: 2px solid #0ea5e9;
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
