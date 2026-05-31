import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TicketDetail from './pages/TicketDetail';

function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, changePassword } = useAuth();
  const [custNum, setCustNum] = useState(user?.cust_num || '');
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [companiesList, setCompaniesList] = useState([]);
  const { API_URL, token } = useAuth();

  useEffect(() => {
    if (isOpen && API_URL) {
      const fetchCompanies = async () => {
        try {
          const response = await fetch(`${API_URL}/auth/companies`);
          if (response.ok) {
            const data = await response.json();
            setCompaniesList(data);
          }
        } catch (error) {
          console.error('Error fetching companies in profile:', error);
        }
      };
      fetchCompanies();
    }
  }, [isOpen, API_URL]);

  // Sync state when user profile is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCustNum(user.cust_num || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!name.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้งาน');
      setSubmitting(false);
      return;
    }

    const result = await updateProfile(name, custNum);
    setSubmitting(false);

    if (result.success) {
      setSuccess('บันทึกข้อมูลส่วนตัวสำเร็จแล้ว!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } else {
      setError(result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    setPwSubmitting(true);

    if (!currentPassword) {
      setPwError('กรุณากรอกรหัสผ่านปัจจุบัน');
      setPwSubmitting(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPwError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว');
      setPwSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      setPwSubmitting(false);
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    setPwSubmitting(false);

    if (result.success) {
      setPwSuccess('เปลี่ยนรหัสผ่านสำเร็จแล้ว!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPwSuccess('');
        setShowPasswordSection(false);
      }, 1500);
    } else {
      setPwError(result.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 99999 }}>
      <div className="glass-card modal-content glow-purple" style={{ maxWidth: '880px', width: '95%', textAlign: 'left', padding: '2rem 2.5rem' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #6366f1, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
          ⚙️ ตั้งค่าข้อมูลส่วนตัว (Profile Settings)
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          
          {/* Left Column: User Profile Info */}
          <div>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#1e293b', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem', fontWeight: '600' }}>
              👤 ข้อมูลโปรไฟล์ (Profile Details)
            </h3>
            
            {error && (
              <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-box alert-success" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', marginBottom: '1rem' }}>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="profile-name">ชื่อผู้ใช้งาน (Full Name)</label>
                <input
                  type="text"
                  id="profile-name"
                  className="glass-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">อีเมล (Email Address)</label>
                <input
                  type="email"
                  id="profile-email"
                  className="glass-input"
                  value={user.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-custnum">รหัสลูกค้า (Customer Number)</label>
                <input
                  type="text"
                  id="profile-custnum"
                  className="glass-input"
                  value={custNum}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Change Password */}
          <div style={{ borderLeft: '1px solid rgba(0, 0, 0, 0.08)', paddingLeft: '2.5rem' }} className="profile-modal-divider">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#1e293b', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem', fontWeight: '600' }}>
              🔑 เปลี่ยนรหัสผ่าน (Change Password)
            </h3>

            {pwError && (
              <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="alert-box alert-success" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', marginBottom: '1rem' }}>
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current-password">รหัสผ่านปัจจุบัน (Current Password)</label>
                <input
                  type="password"
                  id="current-password"
                  className="glass-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={pwSubmitting}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="new-password">รหัสผ่านใหม่ (New Password)</label>
                  <input
                    type="password"
                    id="new-password"
                    className="glass-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={pwSubmitting}
                    placeholder="ขั้นต่ำ 6 ตัว"
                    style={{ margin: 0 }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password">ยืนยันรหัสใหม่ (Confirm Password)</label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="glass-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={pwSubmitting}
                    placeholder="ยืนยันรหัสอีกครั้ง"
                    style={{ margin: 0 }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569', lineHeight: '1.4', background: 'rgba(99, 102, 241, 0.04)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px dashed rgba(99, 102, 241, 0.2)' }}>
                <strong>⚠️ เงื่อนไขการตั้งรหัสผ่านใหม่:</strong>
                <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, listStyleType: 'disc' }}>
                  <li>ความยาวอย่างน้อย 6 ตัวอักษร</li>
                  <li>มีตัวพิมพ์เล็ก (a-z) และพิมพ์ใหญ่ (A-Z) อย่างละ 1 ตัว</li>
                  <li>มีตัวเลข (0-9) และอักขระพิเศษอย่างละ 1 ตัว</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none' }} disabled={pwSubmitting}>
                  {pwSubmitting ? 'กำลังเปลี่ยนรหัสผ่าน...' : '🔒 อัปเดตรหัสผ่าน'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

function MainAppContent() {
  const { user, loading, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [selectedTicketId, setSelectedTicketId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ticketId');
    return id ? parseInt(id, 10) : null;
  });
  
  const handleSetTicketId = (id) => {
    setSelectedTicketId(id);
    if (id === null) {
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      window.history.replaceState({}, '', `?ticketId=${id}`);
    }
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard' or 'tickets'

  // 1. Loading State
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#030712' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontFamily: 'Outfit' }}>กำลังโหลดระบบข้อมูลความปลอดภัย...</p>
        <style>{`
          :root { --accent-cyan: #00e5ff; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // 2. Unauthenticated State (Show Login or Register)
  if (!user) {
    return authView === 'login' ? (
      <Login onToggleView={setAuthView} onAuthSuccess={() => handleSetTicketId(null)} />
    ) : (
      <Register onToggleView={setAuthView} onAuthSuccess={() => handleSetTicketId(null)} />
    );
  }

  // 3. Authenticated State (Show Header + Dashboard/Detail)
  return (
    <div className="app-container">
      {/* Profile Settings Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Premium Glass Header */}
      <header className="header-glass">
        <div className="nav-content">
          <div className="logo-container" onClick={() => handleSetTicketId(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <img 
              src="/logo_clover.png" 
              alt="PPCC Care Logo" 
              style={{ width: '61px', height: '61px', borderRadius: '13px', objectFit: 'cover' }} 
            />
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>PPCC Care</span>
          </div>

          <div className="nav-actions">
            {user.role === 'admin' && (
               <>
                 <button 
                   className="btn btn-secondary" 
                   onClick={() => { handleSetTicketId(null); setAdminView(adminView === 'dashboard' ? 'tickets' : 'dashboard'); }}
                   style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginRight: '0.5rem' }}
                 >
                   {adminView === 'dashboard' ? '📂 จัดการทิคเก็ต' : '📊 ดูรายงานสรุป'}
                 </button>
                 <button 
                   className="btn btn-primary" 
                   onClick={() => { handleSetTicketId(null); setAdminView('config'); }}
                   style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginRight: '0.5rem' }}
                 >
                   ⚙️ จัดการระบบ
                 </button>
               </>
            )}
            <div 
              className="user-badge"
              onClick={() => setIsProfileOpen(true)}
              style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '0.35rem 0.85rem', borderRadius: '20px' }}
              title="คลิกเพื่อแก้ไขข้อมูลส่วนตัว"
            >
              <span>👤 {user.name}</span>
              <span className={`badge-role ${user.role}`}>
                {user.display_role || (user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'agent' ? 'เจ้าหน้าที่' : 'ลูกค้า')}
              </span>
              <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem', opacity: 0.8 }}>⚙️</span>
            </div>
            <button className="btn btn-danger" onClick={() => { setAuthView('login'); logout(); }} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Pages Container */}
      <main style={{ flexGrow: 1 }}>
        {selectedTicketId !== null ? (
          <TicketDetail
            ticketId={selectedTicketId}
            onBack={() => handleSetTicketId(null)}
          />
        ) : user.role === 'admin' && adminView === 'dashboard' ? (
          <AdminDashboard onNavigateToTickets={() => setAdminView('tickets')} onViewTicket={handleSetTicketId} />
        ) : user.role === 'admin' && adminView === 'config' ? (
          <AgentDashboard key="config" onViewTicket={handleSetTicketId} initialTab="config" />
        ) : user.role === 'agent' || (user.role === 'admin' && adminView === 'tickets') ? (
          <AgentDashboard key="dashboard" onViewTicket={handleSetTicketId} initialTab="queue" />
        ) : (
          <CustomerDashboard onViewTicket={handleSetTicketId} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem 1rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: '#475569', fontSize: '0.85rem', marginTop: 'auto' }}>
        <span>© 2026 PPCC Care. Built with Premium Glassmorphism UI & PostgreSQL API.</span>
      </footer>
    </div>
  );
}

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ppcc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ppcc_cookie_consent', 'true');
    setShow(false);
  };

  const handleDecline = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '680px',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '16px',
      padding: '1.25rem 1.75rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
      zIndex: 999999,
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      textAlign: 'left',
      flexWrap: 'wrap'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 150%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
      
      {/* Text Area */}
      <div style={{ flex: '1 1 350px', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <span style={{ fontSize: '1.75rem' }}>🍪</span>
        <div style={{ fontFamily: 'sans-serif' }}>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '1rem', fontWeight: 700 }}>
            แจ้งเตือนการใช้งานคุกกี้ (Cookie Notice)
          </h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.5 }}>
            เรามีการใช้งานคุกกี้ (Cookies) เพื่อความปลอดภัยในการรักษาความปลอดภัยของระบบเข้าสู่ระบบ (JWT) และเพิ่มประสิทธิภาพในการประสานงานดูแลช่วยเหลือลูกค้าให้ดียิ่งขึ้น คุณสามารถศึกษารายละเอียดและกดยอมรับเพื่อใช้งานระบบต่อได้อย่างราบรื่น
          </p>
        </div>
      </div>

      {/* Buttons Area */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'nowrap', alignItems: 'center' }}>
        <button 
          onClick={handleDecline} 
          style={{
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#94a3b8',
            padding: '0.5rem 1.25rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          ปฏิเสธ
        </button>
        <button 
          onClick={handleAccept} 
          style={{
            background: 'linear-gradient(135deg, var(--accent-cyan, #00e5ff), var(--accent-purple, #8b5cf6))',
            border: 'none',
            color: '#030712',
            padding: '0.5rem 1.5rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 229, 255, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 229, 255, 0.2)';
          }}
        >
          ยอมรับทั้งหมด
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
      <CookieConsent />
    </AuthProvider>
  );
}
