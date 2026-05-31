import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail({ ticketId, onBack }) {
  const { user, token, API_URL } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [solution, setSolution] = useState('');
  const [workaround, setWorkaround] = useState('');
  const [savingSolution, setSavingSolution] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (ticket) {
      setSolution(ticket.solution || '');
      setWorkaround(ticket.workaround || '');
    }
  }, [ticket]);

  const fetchTicketDetails = async () => {
    try {
      // Fetch ticket info
      const ticketRes = await fetch(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!ticketRes.ok) throw new Error('Failed to load ticket details.');
      const ticketData = await ticketRes.json();
      setTicket(ticketData);

      // Fetch messages
      const msgsRes = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (msgsRes.ok) {
        const msgsData = await msgsRes.json();
        setMessages(msgsData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();

    // Auto polling every 4 seconds to fetch new chat messages (free real-time feeling!)
    const interval = setInterval(() => {
      fetchMessagesOnly();
    }, 4000);

    return () => clearInterval(interval);
  }, [ticketId, token]);

  const fetchMessagesOnly = async () => {
    try {
      const msgsRes = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (msgsRes.ok) {
        const msgsData = await msgsRes.json();
        setMessages(msgsData);
      }
    } catch (err) {
      console.error('Quiet polling error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message_text: newMessageText })
      });

      if (!response.ok) throw new Error('Failed to send message.');

      const newMsg = await response.json();
      setMessages(prev => [...prev, newMsg]);
      setNewMessageText('');
      
      // Scroll to bottom of chat only when explicitly sending a message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status.');
      const updatedTicket = await response.json();
      
      // Update local ticket state
      setTicket(prev => ({
        ...prev,
        status: updatedTicket.status,
        agent_id: updatedTicket.agent_id
      }));

      // Reload all to sync assigned names
      await fetchTicketDetails();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleClaimTicket = async () => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to claim ticket.');
      
      // Reload details
      await fetchTicketDetails();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveSolutionWorkaround = async (e) => {
    e.preventDefault();
    setSavingSolution(true);
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/solution-workaround`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ solution, workaround })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save solution & workaround.');
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      alert('บันทึกข้อมูล Solution และ Workaround สำเร็จแล้ว! 🎉');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSavingSolution(false);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert('มีบางไฟล์ภาพมีขนาดเกิน 5MB (ระบบจะข้ามการอัปโหลดไฟล์ที่ขนาดเกิน)');
    }

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_URL}/tickets/${ticketId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to upload image attachments.');
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      alert('อัปโหลดรูปภาพแนบสำเร็จแล้ว! 🖼️');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploadingAttachment(false);
      e.target.value = null;
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('คุณต้องการลบรูปภาพประกอบเคสนี้ใช่หรือไม่? ❌')) return;

    setUploadingAttachment(true);
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete attachment.');
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      alert('ลบรูปภาพประกอบสำเร็จแล้ว! 🗑️');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploadingAttachment(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>กำลังเปิดดูเคสสนทนา...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="main-content">
        <div className="glass-card empty-state glow-rose" style={{ border: '1px solid rgba(244,63,94,0.3)' }}>
          <span className="empty-icon">⚠️</span>
          <h3>เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
          <p>{error || 'ไม่พบเคสช่วยเหลือนี้ในระบบ หรือคุณไม่มีสิทธิ์เข้าถึง'}</p>
          <button className="btn btn-secondary" onClick={onBack}>
            ย้อนกลับไปที่แดชบอร์ด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Header breadcrumb & quick info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          ⬅️ ย้อนกลับ
        </button>
        <span style={{ color: '#475569' }}>/</span>
        <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>Ticket {ticket.ticket_number || '#' + String(ticket.id).padStart(3, '0')}</span>
      </div>

      {/* Main details page content split grid */}
      <div className="detail-layout">
        {/* Left Side: Ticket core, and chat conversation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Core issue card */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'left' }}>
            {user.role === 'agent' && ticket.agent_id === user.id && (
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                color: 'var(--accent-purple)',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.05)'
              }}>
                <span>👑</span>
                <span>คุณเป็นผู้ดูแลเคสนี้ (เคสนี้ฉันเป็นคนดูแล ⚡)</span>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
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

            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '1rem' }}>{ticket.title}</h2>
            <div style={{ background: 'rgba(0, 75, 181, 0.03)', border: '1px solid rgba(0, 75, 181, 0.08)', padding: '1.25rem', borderRadius: '12px', color: '#1e293b', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {ticket.description}
            </div>

            {/* Attachment Display & Upload Control */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                  🖼️ ไฟล์และรูปภาพแนบประกอบเคส:
                </h4>
                
                {/* File input trigger */}
                <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.35rem 0.85rem', margin: 0 }}>
                  <span>📎 แนบไฟล์หรือรูปภาพเพิ่มเติม (รองรับ: ภาพ, PDF, Word, Excel, ZIP ฯลฯ ไม่เกิน 20MB)</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar" 
                    multiple={true}
                    style={{ display: 'none' }} 
                    onChange={handleAttachmentUpload}
                    disabled={uploadingAttachment}
                  />
                </label>
              </div>

              {uploadingAttachment && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                  ⏳ กำลังดำเนินการเกี่ยวกับไฟล์แนบ...
                </div>
              )}

              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {ticket.attachments.map((att) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_url);
                    return (
                    <div key={att.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--glass-border)', padding: '0.25rem', borderRadius: '8px', background: 'var(--glass-bg)', overflow: 'hidden' }}>
                      <a href={`${API_URL.replace('/api', '')}${att.file_url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                        {isImage ? (
                          <img 
                            src={`${API_URL.replace('/api', '')}${att.file_url}`} 
                            alt={att.file_name} 
                            style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', cursor: 'zoom-in' }} 
                          />
                        ) : (
                          <div style={{ width: '100%', height: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '6px', color: '#475569' }}>
                            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0 0.5rem', textAlign: 'center', wordBreak: 'break-all' }}>ดาวน์โหลดไฟล์</span>
                          </div>
                        )}
                      </a>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ maxWidth: '75%' }} title={att.file_name}>{att.file_name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '2px',
                            color: 'var(--accent-purple)',
                            fontWeight: 'bold'
                          }}
                          title="ลบไฟล์นี้"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.01)', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                  ยังไม่มีไฟล์หรือรูปภาพแนบประกอบเคสนี้
                </div>
              )}
            </div>
          </div>

          {/* Solution & Workaround Panel */}
          <div className="glass-card glow-purple" style={{ padding: '1.5rem 2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
                แนวทางแก้ไข & วิธีเลี่ยงปัญหา (Solution & Workaround)
              </h3>
            </div>

            {user.role === 'agent' || user.role === 'admin' ? (
              // AGENT / ADMIN view: editable form
              <form onSubmit={handleSaveSolutionWorkaround} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    แนวทางแก้ไขปัญหา (Solution)
                  </label>
                  <textarea
                    className="glass-input"
                    style={{ width: '100%', minHeight: '80px', padding: '0.75rem', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="ระบุแนวทางหรือขั้นตอนในการแก้ไขปัญหานี้..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    disabled={savingSolution}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    วิธีเลี่ยงปัญหาชั่วคราว (Workaround)
                  </label>
                  <textarea
                    className="glass-input"
                    style={{ width: '100%', minHeight: '80px', padding: '0.75rem', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="ระบุวิธีเลี่ยงปัญหาชั่วคราว inกรณีที่ยังแก้ปัญหาถาวรไม่ได้..."
                    value={workaround}
                    onChange={(e) => setWorkaround(e.target.value)}
                    disabled={savingSolution}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }} disabled={savingSolution}>
                    {savingSolution ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
                  </button>
                </div>
              </form>
            ) : (
              // CUSTOMER view: read-only display
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                    แนวทางแก้ไขปัญหา (Solution)
                  </h4>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: ticket.solution ? '#1e293b' : '#64748b',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5
                  }}>
                    {ticket.solution || '✨ อยู่ระหว่างการตรวจสอบและจัดทำแนวทางแก้ไขปัญหา'}
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                    วิธีเลี่ยงปัญหาชั่วคราว (Workaround)
                  </h4>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: ticket.workaround ? '#1e293b' : '#64748b',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5
                  }}>
                    {ticket.workaround || '✨ ยังไม่มีวิธีเลี่ยงปัญหาชั่วคราวระบุไว้'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat conversation area */}
          <div className="glass-card chat-panel glow-cyan">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="logo-dot"></span>
                <span style={{ fontWeight: 600 }}>บทสนทนาโต้ตอบในเคส</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>โพสต์ข้อความได้ทันที</span>
            </div>

            {/* Scrollable messages container */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', margin: 'auto', padding: '2rem' }}>
                  <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</p>
                  <p style={{ fontSize: '0.9rem' }}>ยังไม่มีการพูดคุยเกี่ยวกับเคสนี้ ส่งข้อความที่ด้านล่างเพื่อเริ่มการประสานงาน</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMyMessage = Number(msg.sender_id) === Number(user?.id) || (msg.sender_name && user?.name && msg.sender_name === user.name);
                  const cleanRole = msg.sender_role ? msg.sender_role.toLowerCase() : '';
                  const isAgentOrAdmin = cleanRole === 'agent' || cleanRole === 'admin';
                  
                  let roleLabel = 'ลูกค้า';
                  if (cleanRole === 'admin') {
                    roleLabel = 'ผู้ดูแลระบบ';
                  } else if (cleanRole === 'agent') {
                    roleLabel = 'เจ้าหน้าที่';
                  }

                  return (
                    <div key={msg.id} className={`message-bubble ${isMyMessage ? 'outgoing' : 'incoming'}`}>
                      <div>{msg.message_text}</div>
                      <div className="message-info" style={{ justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }}>
                        <span className="msg-sender" style={{ color: isAgentOrAdmin ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                          {msg.sender_name} ({roleLabel})
                        </span>
                        <span>•</span>
                        <span className="msg-time">
                          {new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="chat-form">
                <input
                  type="text"
                  className="glass-input"
                  placeholder={ticket.status === 'resolved' ? "เคสได้รับการแก้ไขเสร็จสิ้นแล้ว แต่คุณยังสามารถพิมพ์แจ้งต่อได้หากปัญหายังค้างคา" : "พิมพ์ข้อความตอบกลับเพื่อประสานงานช่วยเหลือ..."}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={sending}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }} disabled={sending}>
                  {sending ? 'ส่ง...' : 'ส่ง'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Metadata sidebar and status controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status management block */}
          <div className="glass-card sidebar-panel glow-purple">
            <h3 style={{ fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              การจัดการเคสช่วยเหลือ
            </h3>

            {/* AGENT CONTROLS */}
            {user.role === 'agent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {ticket.status === 'open' ? (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleClaimTicket} disabled={updatingStatus}>
                    📥 เคลมตั๋วรับเคสดูแล
                  </button>
                ) : (
                  <>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>เปลี่ยนสถานะการทำงาน</label>
                      <select
                        className="glass-input"
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updatingStatus}
                        style={{ background: 'var(--glass-bg)', cursor: 'pointer' }}
                      >
                        <option value="assigned">⚡ กำลังประสานงาน (Assigned)</option>
                        <option value="resolved">✅ แก้ไขเสร็จสิ้น (Resolved)</option>
                        <option value="open">❌ คืนกลับเข้าคิวว่าง (Open)</option>
                      </select>
                    </div>

                    {ticket.status === 'assigned' && (
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => handleStatusChange('resolved')} disabled={updatingStatus}>
                        ✅ แก้ไขสำเร็จ (Resolve Case)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* CUSTOMER CONTROLS */}
            {user.role === 'customer' && ticket.status !== 'resolved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>หากปัญหานี้ได้รับการแก้ไขแล้ว คุณสามารถช่วยปิดเคสช่วยเหลือได้</p>
                <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--status-resolved)', color: '#ffffff', boxShadow: 'none' }} onClick={() => handleStatusChange('resolved')} disabled={updatingStatus}>
                  ✅ แก้ไขปัญหานี้เสร็จสิ้นแล้ว
                </button>
              </div>
            )}

            {/* REOPEN IF RESOLVED */}
            {ticket.status === 'resolved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--status-resolved)', fontWeight: 600 }}>🏆 เคสนี้ถูกทำเครื่องหมายว่าปิดงานแล้ว</span>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleStatusChange(user.role === 'agent' ? 'assigned' : 'open')} disabled={updatingStatus}>
                  🔓 เปิดเคสขึ้นมาใหม่อีกครั้ง
                </button>
              </div>
            )}
          </div>

          {/* Ticket Info details list */}
          <div className="glass-card sidebar-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0f172a' }}>รายละเอียดทั่วไป</h3>

            <div className="sidebar-section">
              <div className="detail-row">
                <span className="detail-label">รหัสอ้างอิง:</span>
                <span className="detail-val" style={{ fontFamily: 'monospace' }}>{ticket.ticket_number || '#' + String(ticket.id).padStart(3, '0')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">หมวดหมู่:</span>
                <span className="detail-val" style={{ textTransform: 'capitalize' }}>{ticket.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ระบบงาน (Module):</span>
                <span className="detail-val" style={{ color: 'var(--accent-cyan)' }}>{ticket.module}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ประเภทโปรแกรม:</span>
                <span className="detail-val" style={{ color: '#ec4899' }}>{ticket.program_type || 'Standard'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ประเภทปัญหา:</span>
                <span className="detail-val" style={{ color: '#d97706' }}>{ticket.issue_type || 'Technical'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">หน้าจอ (Form Name):</span>
                <span className="detail-val">{ticket.form_name || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ความเร่งด่วน:</span>
                <span className="detail-val" style={{ color: ticket.priority === 'high' ? 'var(--priority-high)' : 'inherit' }}>
                  {ticket.priority === 'low' ? 'ต่ำ (Low)' : ticket.priority === 'medium' ? 'ปานกลาง (Medium)' : 'สูง (High)'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ผู้เปิดเคส:</span>
                <span className="detail-val">{ticket.customer_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">อีเมลผู้ส่ง:</span>
                <span className="detail-val" style={{ fontSize: '0.8rem' }}>{ticket.customer_email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">อีเมลเพิ่มเติม (CC):</span>
                <span className="detail-val" style={{ fontSize: '0.8rem' }}>{ticket.additional_email || '-'}</span>
              </div>
              {ticket.user_cust_num && (
                <div className="detail-row">
                  <span className="detail-label">รหัสลูกค้า:</span>
                  <span className="detail-val" style={{ fontWeight: 600 }}>{ticket.user_cust_num}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">ผู้รับผิดชอบ:</span>
                <span className="detail-val" style={{ color: 'var(--accent-purple)' }}>{ticket.agent_name || 'ยังไม่มีเจ้าหน้าที่รับเคส'}</span>
              </div>
              <div className="detail-row" style={{ fontSize: '0.8rem', color: ticket.assigned_at ? 'var(--accent-purple)' : '#64748b' }}>
                <span className="detail-label">รับเคสเมื่อ:</span>
                <span className="detail-val">{ticket.assigned_at ? new Date(ticket.assigned_at).toLocaleString('th-TH') : '-'}</span>
              </div>
              <hr style={{ border: 'none', borderBottom: '1px solid var(--glass-border)' }} />
              <div className="detail-row" style={{ fontSize: '0.8rem' }}>
                <span className="detail-label">วันที่เปิดเคส:</span>
                <span className="detail-val">{new Date(ticket.created_at).toLocaleString('th-TH')}</span>
              </div>
              <div className="detail-row" style={{ fontSize: '0.8rem' }}>
                <span className="detail-label">อัปเดตล่าสุด:</span>
                <span className="detail-val">{new Date(ticket.updated_at).toLocaleString('th-TH')}</span>
              </div>
              {ticket.resolved_at && (
                <>
                  <div className="detail-row" style={{ fontSize: '0.8rem', color: 'var(--priority-high)' }}>
                    <span className="detail-label">ผู้ปิดเคส:</span>
                    <span className="detail-val">{ticket.resolver_name || '-'}</span>
                  </div>
                  <div className="detail-row" style={{ fontSize: '0.8rem', color: 'var(--priority-high)' }}>
                    <span className="detail-label">วันที่ปิดเคส:</span>
                    <span className="detail-val">{new Date(ticket.resolved_at).toLocaleString('th-TH')}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
