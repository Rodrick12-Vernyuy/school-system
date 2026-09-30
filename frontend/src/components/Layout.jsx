import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMail, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { NAV_BY_ROLE } from './navConfig';

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  student: 'Student',
};

function initialsFor(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';
}

// Two-tier top navigation, styled after well-established professional
// application shells (GitHub's global header + repo tab bar, Vercel's team
// header + project tabs, Tailwind UI's "Stacked" application shell): a
// slim global row (brand, search, notifications, theme toggle, account),
// and a horizontally-scrollable row of role-based section tabs directly
// beneath it. No left sidebar, at any screen width.
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const items = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="eduerp-app">
      <header className="eduerp-navbar">
        <div className="eduerp-navbar-top">
          <div className="eduerp-navbar-brand">
            <div className="eduerp-brand-mark">E</div>
            <span>EduERP</span>
          </div>

          <div className="eduerp-search">
            <FiSearch />
            <input placeholder="Search…" />
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <button
              className="eduerp-icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <button className="eduerp-icon-btn d-none d-md-flex"><FiMail /></button>
            <button className="eduerp-icon-btn"><FiBell /></button>
            <div className="d-flex align-items-center gap-2 ms-1">
              <div className="eduerp-avatar">{initialsFor(user?.fullName)}</div>
              <div className="d-none d-lg-block">
                <div className="fw-semibold" style={{ fontSize: '0.85rem', lineHeight: 1.1 }}>{user?.fullName}</div>
                <div className="small" style={{ color: 'var(--eduerp-muted)' }}>{ROLE_LABEL[user?.role] || user?.role}</div>
              </div>
            </div>
          </div>
        </div>

        <nav className="eduerp-navbar-tabs">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {Icon && <Icon />}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <a className="eduerp-logout-link" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <FiLogOut /> <span>Logout</span>
          </a>
        </nav>
      </header>

      <main className="eduerp-content-wrap">
        <div className="eduerp-content">{children}</div>
      </main>
    </div>
  );
}
