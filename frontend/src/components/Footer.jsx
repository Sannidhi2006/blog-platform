import React from 'react';
import { Link } from 'react-router-dom';
import { FiFeather, FiGithub, FiHeart, FiCompass, FiShield, FiTag } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="main-footer"
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.30)',
                }}
              >
                <FiFeather />
              </div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--text-main)',
                }}
              >
                Blog<span style={{ color: 'var(--accent-primary)' }}>Platform</span>
              </span>
            </Link>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '320px',
              }}
            >
              A high-performance modern MERN blogging architecture designed for creators, developers, and thinkers.
              Write, share, and connect seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1.2rem',
              }}
            >
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Home Feed
                </Link>
              </li>
              <li>
                <Link to="/create" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Write an Article
                </Link>
              </li>
              <li>
                <Link to="/my-blogs" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  My Articles
                </Link>
              </li>
              <li>
                <Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Author Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1.2rem',
              }}
            >
              Topics &amp; Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/search?category=Technology" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/search?category=Programming" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Programming
                </Link>
              </li>
              <li>
                <Link to="/search?category=Travel" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Travel
                </Link>
              </li>
              <li>
                <Link to="/search?category=Lifestyle" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Lifestyle
                </Link>
              </li>
            </ul>
          </div>

          {/* Stack & Demo Details */}
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1.2rem',
              }}
            >
              College Demo
            </h4>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Full MERN Architecture
              </div>
              <div>Node.js &bull; Express &bull; MongoDB &bull; React &bull; Vite &bull; JWT Auth &bull; Multer</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {currentYear} <strong>BlogPlatform</strong>. Built for Academic Demonstration.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Engineered with <FiHeart style={{ color: '#ef4444', fontSize: '0.9rem' }} /> using React &amp; Node.js
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
