import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="eduerp-login-wrap">
      <button
        className="eduerp-icon-btn eduerp-theme-switch"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle color theme"
      >
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
      </button>
      <div className="eduerp-login-card">
        <div className="eduerp-login-logo">E</div>
        <h3 className="fw-bold mb-1">Welcome back</h3>
        <p className="text-muted mb-4">Sign in to your EduERP account</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label small fw-semibold">Email</label>
          <div className="input-group mb-3">
            <span className="input-group-text border-end-0"><FiMail className="text-muted" /></span>
            <input
              type="email"
              className="form-control border-start-0"
              placeholder="you@eduerp.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <label className="form-label small fw-semibold">Password</label>
          <div className="input-group mb-2">
            <span className="input-group-text border-end-0"><FiLock className="text-muted" /></span>
            <input
              type="password"
              className="form-control border-start-0"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-end mb-3">
            <a
              href="#"
              className="small text-decoration-none"
              onClick={(e) => { e.preventDefault(); alert('Password reset is not implemented in this academic demo. Contact an administrator to reset your password.'); }}
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2" disabled={loading}>
            {loading ? 'Signing in…' : <>Login <FiArrowRight /></>}
          </button>
        </form>

        <div className="text-center mt-4 small text-muted">
          Academic · Finance · Administration &amp; HR, in one place.
        </div>
      </div>
    </div>
  );
}
