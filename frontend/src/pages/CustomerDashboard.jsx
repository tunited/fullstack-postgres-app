import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard({ onViewTicket }) {
  const { user, token, API_URL } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active'); // Add status filter
  const [sortOption, setSortOption] = useState('date_desc'); // Add sort option
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortOption]);

  // New ticket form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [module, setModule] = useState('');
  const [programType, setProgramType] = useState('');
  const [issueType, setIssueType] = useState('');
  const [formName, setFormName] = useState('');
  const [additionalEmail, setAdditionalEmail] = useState('');
  const [priority, setPriority] = useState('medium');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Dynamic configuration lists
  const [dbCategories, setDbCategories] = useState([]);
  const [dbModules, setDbModules] = useState([]);
  const [dbProgramTypes, setDbProgramTypes] = useState([]);
  const [dbIssueTypes, setDbIssueTypes] = useState([]);
  const [dbCustomers, setDbCustomers] = useState([]);
  const [custNum, setCustNum] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your support tickets.');
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const catRes = await fetch(`${API_URL}/tickets/config/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setDbCategories(catData);
        if (catData.length > 0) setCategory(catData[0].name);
      }

      const modRes = await fetch(`${API_URL}/tickets/config/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (modRes.ok) {
        const modData = await modRes.json();
        setDbModules(modData);
        if (modData.length > 0) setModule(modData[0].name);
      }

      const progRes = await fetch(`${API_URL}/tickets/config/program-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (progRes.ok) {
        const progData = await progRes.json();
        setDbProgramTypes(progData);
        if (progData.length > 0) setProgramType(progData[0].name);
      }

      const issueRes = await fetch(`${API_URL}/tickets/config/issue-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (issueRes.ok) {
        const issueData = await issueRes.json();
        setDbIssueTypes(issueData);
        if (issueData.length > 0) setIssueType(issueData[0].name);
      }

      const custRes = await fetch(`${API_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (custRes.ok) {
        const custData = await custRes.json();
        setDbCustomers(custData);
        if (custData.length > 0) {
          const matchedCustomer = custData.find(c => c.cust_name === user?.name);
          if (matchedCustomer) {
            setCustNum(matchedCustomer.cust_num);
          } else {
            setCustNum(custData[0].cust_num);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchConfig();
  }, [token]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    if (!title || !description || !custNum) {
      setFormError('กรุณากรอกหัวข้อ รายละเอียด และเลือกลูกค้า');
      setFormSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('module', module);
      formData.append('program_type', programType);
      formData.append('issue_type', issueType);
      formData.append('form_name', formName);
      formData.append('additional_email', additionalEmail);
      formData.append('priority', priority);
      formData.append('cust_num', custNum);
      
      if (attachmentFiles && attachmentFiles.length > 0) {
        attachmentFiles.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      // Reset form & reload
      setTitle('');
      setDescription('');
      setCategory(dbCategories.length > 0 ? dbCategories[0].name : '');
      setModule(dbModules.length > 0 ? dbModules[0].name : '');
      setProgramType(dbProgramTypes.length > 0 ? dbProgramTypes[0].name : '');
      setIssueType(dbIssueTypes.length > 0 ? dbIssueTypes[0].name : '');
      setFormName('');
      setAdditionalEmail('');
      setPriority('medium');
      setCustNum(dbCustomers[0]?.cust_num || '');
      setAttachmentFiles([]);
      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Stat calculations
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'assigned').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  // Filter and sort tickets for display
  const displayedTickets = tickets
    .filter(t => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return t.status === 'open' || t.status === 'assigned';
      if (statusFilter === 'resolved') return t.status === 'resolved';
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortOption === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortOption === 'id_desc') return b.id - a.id;
      if (sortOption === 'id_asc') return a.id - b.id;
      return 0;
    });

  const totalPages = Math.ceil(displayedTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = displayedTickets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="main-content">
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-gradient">ศูนย์ช่วยเหลือของคุณ</h1>
          <p className="subtitle-text" style={{ marginBottom: 0 }}>ส่งคำขอความช่วยเหลือ ติดตามผล และพูดคุยกับเจ้าหน้าที่ของเราได้ตลอด 24 ชั่วโมง</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          ส่งเคสช่วยเหลือใหม่
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div 
          className={`glass-card stat-card glow-purple ${statusFilter === 'active' ? 'selected' : ''}`} 
          style={{ '--card-border-color': 'var(--accent-purple)', cursor: 'pointer', transform: statusFilter === 'active' ? 'scale(1.02)' : 'none', border: statusFilter === 'active' ? '2px solid var(--accent-purple)' : '' }}
          onClick={() => setStatusFilter('active')}
        >
          <div className="stat-info">
            <span className="stat-label">อยู่ระหว่างดำเนินการ</span>
            <span className="stat-value">{activeTickets}</span>
          </div>
          <span className="stat-icon">⏳</span>
        </div>
        <div 
          className={`glass-card stat-card glow-cyan ${statusFilter === 'resolved' ? 'selected' : ''}`} 
          style={{ '--card-border-color': 'var(--status-resolved)', cursor: 'pointer', transform: statusFilter === 'resolved' ? 'scale(1.02)' : 'none', border: statusFilter === 'resolved' ? '2px solid var(--status-resolved)' : '' }}
          onClick={() => setStatusFilter('resolved')}
        >
          <div className="stat-info">
            <span className="stat-label">แก้ไขเสร็จสิ้นแล้ว</span>
            <span className="stat-value">{resolvedTickets}</span>
          </div>
          <span className="stat-icon">✅</span>
        </div>
        <div 
          className={`glass-card stat-card glow-cyan ${statusFilter === 'all' ? 'selected' : ''}`} 
          style={{ '--card-border-color': '#e2e8f0', cursor: 'pointer', transform: statusFilter === 'all' ? 'scale(1.02)' : 'none', border: statusFilter === 'all' ? '2px solid #94a3b8' : '' }}
          onClick={() => setStatusFilter('all')}
        >
          <div className="stat-info">
            <span className="stat-label">เคสทั้งหมดของคุณ</span>
            <span className="stat-value">{totalTickets}</span>
          </div>
          <span className="stat-icon">📂</span>
        </div>
      </div>

      {/* Main Board Content */}
      <div className="dashboard-layout">
        <div className="tickets-container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 className="section-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                <span>📋</span> รายการคำขอช่วยเหลือของคุณ
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>อัปเดตแบบเรียลไทม์</span>
            </div>
            <div>
              <select 
                className="glass-input" 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                style={{ margin: 0, padding: '0.35rem 1rem', fontSize: '0.85rem', width: 'auto', minWidth: '220px', borderRadius: '8px' }}
              >
                <option value="date_desc">เรียง: วันที่เปิดเคส (ใหม่ล่าสุด)</option>
                <option value="date_asc">เรียง: วันที่เปิดเคส (เก่าสุด)</option>
                <option value="id_desc">เรียง: Ticket ID (มาก-น้อย)</option>
                <option value="id_asc">เรียง: Ticket ID (น้อย-มาก)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="alert-box alert-error">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>กำลังโหลดข้อมูลเคสซัพพอร์ต...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : tickets.length === 0 ? (
            <div className="glass-card empty-state">
              <span className="empty-icon">📨</span>
              <h3>ยังไม่มีตั๋วหรือเคสช่วยเหลือ</h3>
              <p>หากคุณพบปัญหาการทำงานหรือต้องการข้อมูลสนับสนุน สามารถกดสร้างเคสใหม่ด้านขวาบนได้ทันที</p>
              <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setIsModalOpen(true)}>
                เริ่มต้นส่งเคสแรก
              </button>
            </div>
          ) : displayedTickets.length === 0 ? (
            <div className="glass-card empty-state">
              <span className="empty-icon">📨</span>
              <h3>ไม่พบเคสที่ตรงตามเงื่อนไข</h3>
              <p>ไม่มีข้อมูลเคสช่วยเหลือในสถานะที่คุณเลือก</p>
            </div>
          ) : (
            <>
              {paginatedTickets.map(ticket => (
                <div key={ticket.id} className="glass-card ticket-card interactive glow-cyan">
                  <div className="ticket-main">
                    <div className="ticket-header">
                      <span className="ticket-id">{ticket.ticket_number || '#' + String(ticket.id).padStart(3, '0')}</span>
                      <span className={`badge ${
                        ticket.status === 'open' ? 'badge-status-open' :
                        ticket.status === 'assigned' ? 'badge-status-assigned' : 'badge-status-resolved'
                      }`}>
                        {ticket.status === 'open' ? '• รอยืนยัน' :
                         ticket.status === 'assigned' ? '• กำลังดูแล' : '• เสร็จสิ้น'}
                      </span>
                      <span className="badge badge-category">{ticket.category}</span>
                      <span className="badge badge-module">🧩 {ticket.module}</span>
                      <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                        💻 {ticket.program_type || 'Standard'}
                      </span>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        🐛 {ticket.issue_type || 'Technical'}
                      </span>
                      <span className={`badge badge-priority-${ticket.priority}`}>
                        {ticket.priority === 'low' ? 'ต่ำ' :
                         ticket.priority === 'medium' ? 'ปานกลาง' : 'สูง !!'}
                      </span>
                    </div>
                    <h3 className="ticket-title" onClick={() => onViewTicket(ticket.id)}>{ticket.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {ticket.description}
                    </p>
                    <div className="ticket-meta">
                      <span className="meta-item">
                        🗓️ ส่งเมื่อ: {new Date(ticket.created_at).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {ticket.agent_name ? (
                        <span className="meta-item" style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>
                          👤 เจ้าหน้าที่ดูแล: {ticket.agent_name}
                        </span>
                      ) : (
                        <span className="meta-item" style={{ color: '#64748b' }}>
                          👤 เจ้าหน้าที่ดูแล: ยังไม่มีเจ้าหน้าที่รับเคส
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <button className="btn btn-secondary" onClick={() => onViewTicket(ticket.id)}>
                      ดูรายละเอียด & แชท
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>แสดงหน้าละ:</span>
                  <select 
                    className="glass-input" 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ margin: 0, padding: '0.25rem 1rem', fontSize: '0.85rem', width: 'auto', minWidth: '80px', borderRadius: '6px' }}
                  >
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', margin: 0, borderRadius: '6px' }}
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
                      style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', margin: 0, borderRadius: '6px' }}
                    >
                      ถัดไป ▶
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar help widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card sidebar-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              คู่มือแนะนำเบื้องต้น
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
              ตั๋วช่วยเหลือแต่ละใบสามารถใช้พิมพ์คุยกับเจ้าหน้าที่ได้แบบเรียลไทม์ คุณจะได้รับอีเมลตอบกลับหรือแจ้งเตือนเมื่อเจ้าหน้าที่รับเคลมเคสของคุณ
            </p>
            <hr style={{ border: 'none', borderBottom: '1px solid var(--glass-border)', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--status-open)' }}>●</span> รอยืนยัน = ตั๋วเข้าระบบ รอเจ้าหน้าที่มากดรับ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--status-assigned)' }}>●</span> กำลังดูแล = มีเจ้าหน้าที่รับเรื่องดูแลแล้ว
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--status-resolved)' }}>●</span> เสร็จสิ้น = แก้ไขปัญหาเรียบร้อย
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content glow-purple">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            <h2 style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #004bb5, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              สร้างคำขอความช่วยเหลือใหม่
            </h2>

            {formError && (
              <div className="alert-box alert-error">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label htmlFor="ticket-title">หัวข้อของปัญหา (Title)</label>
                <input
                  type="text"
                  id="ticket-title"
                  className="glass-input"
                  placeholder="เช่น ไม่สามารถดาวน์โหลดไฟล์รายงานได้ หรือ ต้องการขอใบกำกับภาษี"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={formSubmitting}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="ticket-additional-email">อีเมลเพิ่มเติม (CC)</label>
                  <input
                    type="email"
                    id="ticket-additional-email"
                    className="glass-input"
                    placeholder="เช่น user@example.com (ใส่ได้ 1 อีเมล)"
                    value={additionalEmail}
                    onChange={(e) => setAdditionalEmail(e.target.value)}
                    disabled={formSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ticket-customer">ลูกค้า (Customer Name)</label>
                  <select
                    id="ticket-customer"
                    className="glass-input"
                    value={custNum}
                    onChange={(e) => setCustNum(e.target.value)}
                    disabled={formSubmitting || dbCustomers.length === 0}
                    style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                    required
                  >
                    {dbCustomers.length === 0 && <option value="">ไม่มีข้อมูลลูกค้า</option>}
                    {dbCustomers.map(cust => (
                      <option key={cust.id} value={cust.cust_num}>{cust.cust_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ticket-form-name">หน้าจอที่เกี่ยวข้อง (Form Name)</label>
                  <input
                    type="text"
                    id="ticket-form-name"
                    className="glass-input"
                    placeholder="เช่น AR-001 หรือ หน้าจอออกใบแจ้งหนี้"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={formSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="ticket-category">หมวดหมู่ (Category)</label>
                  <select
                    id="ticket-category"
                    className="glass-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={formSubmitting}
                    style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                  >
                    {dbCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ticket-module">ระบบงาน (Module)</label>
                  <select
                    id="ticket-module"
                    className="glass-input"
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    disabled={formSubmitting}
                    style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                  >
                    {dbModules.map(mod => (
                      <option key={mod.id} value={mod.name}>{mod.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ticket-priority">ความเร่งด่วน (Priority)</label>
                  <select
                    id="ticket-priority"
                    className="glass-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={formSubmitting}
                    style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                  >
                    <option value="low">ต่ำ (Low)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="high">สูง (High - เร่งด่วน)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="ticket-program-type">ประเภทโปรแกรม (Program Type)</label>
                  <select
                    id="ticket-program-type"
                    className="glass-input"
                    value={programType}
                    onChange={(e) => setProgramType(e.target.value)}
                    disabled={formSubmitting || dbProgramTypes.length === 0}
                    style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                    required
                  >
                    {dbProgramTypes.length === 0 && <option value="">กำลังโหลด...</option>}
                    {dbProgramTypes.map(pt => (
                      <option key={pt.id} value={pt.name}>{pt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ticket-issue-type">ประเภทปัญหา (Issue Type)</label>
                  <select
                    id="ticket-issue-type"
                    className="glass-input"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    disabled={formSubmitting || dbIssueTypes.length === 0}
                    style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                    required
                  >
                    {dbIssueTypes.length === 0 && <option value="">กำลังโหลด...</option>}
                    {dbIssueTypes.map(it => (
                      <option key={it.id} value={it.name}>{it.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ticket-desc">รายละเอียดปัญหาอย่างละเอียด (Description)</label>
                <textarea
                  id="ticket-desc"
                  className="glass-input"
                  rows="5"
                  placeholder="กรุณาเขียนรายละเอียดของปัญหา ขั้นตอนการเกิดปัญหาอย่างครบถ้วน เพื่อให้เจ้าหน้าที่วิเคราะห์ได้อย่างรวดเร็ว"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={formSubmitting}
                  required
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="ticket-files">ไฟล์และรูปภาพแนบประกอบเคส (รองรับ: ภาพ, PDF, Word, Excel, ZIP ฯลฯ ขนาดแต่ละไฟล์ไม่เกิน 20MB)</label>
                <input
                  type="file"
                  id="ticket-files"
                  className="glass-input"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar"
                  multiple={true}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const invalidFiles = files.filter(f => f.size > 20 * 1024 * 1024);
                    if (invalidFiles.length > 0) {
                      setFormError('ขนาดบางไฟล์เกิน 20MB (ไฟล์ที่มีปัญหาจะไม่ถูกเลือก)');
                    }
                    const validFiles = files.filter(f => f.size <= 20 * 1024 * 1024);
                    setFormError('');
                    setAttachmentFiles(prev => [...prev, ...validFiles]);
                    e.target.value = null;
                  }}
                  disabled={formSubmitting}
                />

                {/* List of currently selected files with delete button */}
                {attachmentFiles.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>📸 รูปภาพที่เลือกแนบ ({attachmentFiles.length} รูป):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {attachmentFiles.map((file, idx) => (
                        <div key={idx} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#1e1b4b'
                        }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setAttachmentFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--accent-purple)',
                              cursor: 'pointer',
                              padding: 0,
                              fontWeight: 'bold',
                              fontSize: '0.85rem'
                            }}
                            title="ยกเลิกรูปนี้"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={formSubmitting}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'กำลังส่งตั๋วเข้าระบบ...' : 'ยืนยันการส่งตั๋ว'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
