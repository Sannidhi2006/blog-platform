import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiFeather, FiEdit3, FiBookOpen, FiUser, FiLogOut,
  FiLogIn, FiUserPlus, FiMenu, FiX, FiSearch,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      closeMobileMenu();
    }
  };

  /* Link style helper */
  const navLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.875rem', fontWeight: 600,
    color: isActive(path) ? 'var(--accent-primary)' : 'var(--text-muted)',
    padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)',
    background: isActive(path) ? 'var(--accent-light)' : 'transparent',
    transition: 'all 0.16s ease',
    textDecoration: 'none',
  });

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: '#fff',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: '1240px', margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.1rem', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(236,72,153,0.35)',
          }}>
            <FiFeather />
          </div>
          <span style={{
            fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--text-main)',
          }}>
            BlogPlatform
          </span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="search-bar desktop-search"
          style={{ flex: '1', maxWidth: '340px', marginLeft: '0.5rem' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Search articles…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              padding: '0.55rem 0.9rem', fontSize: '0.875rem',
              borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', borderRight: 'none',
            }}
          />
          <button type="submit" style={{
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            padding: '0 0.85rem', background: 'var(--accent-gradient)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            <FiSearch style={{ fontSize: '0.9rem' }} />
          </button>
        </form>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {isAuthenticated ? (
            <>
              <Link to="/create" style={navLinkStyle('/create')} id="nav-create-blog-btn">
                <FiEdit3 style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }} />
                <span>Write</span>
              </Link>
              <Link to="/my-blogs" style={navLinkStyle('/my-blogs')} id="nav-my-blogs-btn">
                <FiBookOpen style={{ fontSize: '0.9rem' }} />
                <span>My Blogs</span>
              </Link>
              <Link to="/profile" style={navLinkStyle('/profile')} id="nav-profile-btn">
                <FiUser style={{ fontSize: '0.9rem' }} />
                <span>Profile</span>
              </Link>

              {/* Divider */}
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

              {/* User chip */}
              <div id="user-badge" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                background: 'var(--accent-light)', borderRadius: '999px',
                border: '1px solid rgba(236,72,153,0.25)',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'var(--accent-gradient)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase',
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span id="user-display-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  {user?.name || user?.username}
                </span>
              </div>

              <button
                type="button"
                id="logout-btn"
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', marginLeft: '0.25rem' }}
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" id="nav-login-btn" className="btn btn-secondary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                <FiLogIn /> Login
              </Link>
              <Link to="/register" id="nav-register-btn" className="btn btn-primary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                <FiUserPlus /> Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border-color)', background: '#fff',
            color: 'var(--text-main)', fontSize: '1.15rem', cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-drawer" style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#fff',
          padding: '1rem 1.5rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        }}>
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '0.75rem' }}>
            <input className="form-input" type="text" placeholder="Search articles…"
              value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
              style={{ padding: '0.6rem 0.9rem', fontSize: '0.875rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', borderRight: 'none' }}
            />
            <button type="submit" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: '0 1rem', background: 'var(--accent-gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <FiSearch />
            </button>
          </form>

          {isAuthenticated ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem', background: 'var(--accent-light)',
                borderRadius: 'var(--radius-md)', marginBottom: '0.5rem',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase',
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{user?.username}</div>
                </div>
              </div>

              {[
                { to: '/create', icon: <FiEdit3 />, label: 'Write Article' },
                { to: '/my-blogs', icon: <FiBookOpen />, label: 'My Blogs' },
                { to: '/profile', icon: <FiUser />, label: 'Profile' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} onClick={closeMobileMenu} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)',
                  color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive(to) ? 'var(--accent-light)' : 'transparent',
                  fontWeight: 600, fontSize: '0.9rem',
                }}>
                  {icon} {label}
                </Link>
              ))}

              <button type="button" onClick={handleLogout} className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMobileMenu} className="btn btn-secondary"
                style={{ justifyContent: 'center' }}>
                <FiLogIn /> Login
              </Link>
              <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary"
                style={{ justifyContent: 'center' }}>
                <FiUserPlus /> Register
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
