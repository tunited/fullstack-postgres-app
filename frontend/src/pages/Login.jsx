import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onToggleView, onAuthSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (onAuthSuccess) onAuthSuccess();
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      {/* Solid white card with high-elevation shadow, centered directly on user's background image */}
      <div className="auth-card-mockup">
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Username Input Pill */}
          <div className="input-pill-group">
            <div className="input-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input
              type="email"
              className="input-pill-field"
              placeholder="Username"
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Centered Sign-in Button */}
          <button type="submit" className="btn-signin-pill" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer-mockup">
          <span>ยังไม่มีบัญชีสมาชิก? </span>
          <a href="#" className="auth-link-mockup" onClick={(e) => { e.preventDefault(); onToggleView('register'); }}>
            สมัครสมาชิกใหม่ที่นี่
          </a>
        </div>
      </div>
    </div>
  );
}
