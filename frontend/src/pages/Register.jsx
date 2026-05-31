import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onToggleView, onAuthSuccess }) {
  const { register, API_URL } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว');
      setLoading(false);
      return;
    }

    const result = await register(name, email, password, role, null);
    setLoading(false);

    if (result.success) {
      if (result.pendingApproval) {
        setSuccessMessage(result.message || 'สมัครสมาชิกสำเร็จแล้ว! กรุณารอการตรวจสอบและอนุมัติการใช้งานจากผู้ดูแลระบบ');
        setName('');
        setEmail('');
        setPassword('');
        } else {
        if (onAuthSuccess) onAuthSuccess();
      }
    } else {
      setError(result.error || 'Registration failed. Email might already be taken.');
    }
  };

  return (
    <div className="auth-page">
      {/* Solid white card with matching mockup elements, centered directly on user's background image */}
      <div className="auth-card-mockup" style={{ maxWidth: '440px' }}>
        <div className="auth-header-mockup" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e3a8a', marginTop: '0.25rem' }}>สมัครสมาชิกใหม่ (Register)</h3>
        </div>

        {successMessage && (
          <div className="alert-box alert-success" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', marginBottom: '1.25rem', borderRadius: '12px', fontSize: '0.82rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.25rem', borderRadius: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Name Input Pill */}
          <div className="input-pill-group">
            <div className="input-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input
              type="text"
              className="input-pill-field"
              placeholder="ชื่อผู้ใช้งาน (Full Name)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>



          {/* Email Input Pill */}
          <div className="input-pill-group">
            <div className="input-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
              </svg>
            </div>
            <input
              type="email"
              className="input-pill-field"
              placeholder="อีเมล (Email Address)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Password Input Pill */}
          <div className="input-pill-group">
            <div className="input-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <input
              type="password"
              className="input-pill-field"
              placeholder="รหัสผ่าน (Password - ขั้นต่ำ 6 ตัว)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ fontSize: '0.72rem', color: '#4b5563', textAlign: 'left', background: 'rgba(99, 102, 241, 0.03)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px dashed rgba(99, 102, 241, 0.15)', marginTop: '0.1rem', marginBottom: '0.2rem', lineHeight: '1.3' }}>
            <strong style={{ color: '#1e3a8a' }}>⚠️ เงื่อนไขรหัสผ่าน:</strong>
            <ul style={{ margin: '0.2rem 0 0 1.1rem', padding: 0, listStyleType: 'disc' }}>
              <li>ยาวอย่างน้อย 6 ตัวอักษร</li>
              <li>มีพิมพ์เล็ก (a-z), พิมพ์ใหญ่ (A-Z) อย่างน้อยอย่างละ 1 ตัว</li>
              <li>มีตัวเลข (0-9) และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว</li>
            </ul>
          </div>



          {/* Role Choice Block */}
          <div style={{ textAlign: 'left', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
              บทบาทหน้าที่ของคุณ (Choose Role)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.825rem', borderRadius: '30px' }}
                onClick={() => handleRoleChange('customer')}
                disabled={loading}
              >
                👤 ผู้ใช้บริการ
              </button>
              <button
                type="button"
                className={`btn ${role === 'agent' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.825rem', borderRadius: '30px' }}
                onClick={() => handleRoleChange('agent')}
                disabled={loading}
              >
                🛡️ เจ้าหน้าที่
              </button>
            </div>
          </div>

          {/* Submit Register Button */}
          <button type="submit" className="btn-signin-pill" style={{ marginTop: '1.25rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="auth-footer-mockup">
          <span>มีบัญชีสมาชิกอยู่แล้ว? </span>
          <a href="#" className="auth-link-mockup" onClick={(e) => { e.preventDefault(); onToggleView('login'); }}>
            เข้าสู่ระบบที่นี่
          </a>
        </div>
      </div>
    </div>
  );
}
