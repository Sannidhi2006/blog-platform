import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFound = () => (
  <div style={{
    minHeight: 'calc(100vh - 200px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: 'var(--bg-secondary)',
  }}>
    <div style={{
      background: '#fff', border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem',
      maxWidth: '460px', width: '100%', textAlign: 'center',
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeInUp 0.35s ease',
    }}>
      <div style={{
        fontSize: '5.5rem', fontWeight: 900, lineHeight: 1,
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
      }}>
        404
      </div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or the URL might be incorrect.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" id="notfound-home-btn" className="btn btn-primary">
          <FiHome /> Go to Home
        </Link>
        <button className="btn btn-secondary" onClick={() => window.history.back()} id="notfound-back-btn">
          <FiArrowLeft /> Go Back
        </button>
      </div>
    </div>
  </div>
);

export default NotFound;
