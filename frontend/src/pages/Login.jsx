import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!formData.identifier.trim()) e.identifier = 'Email or username is required';
    if (!formData.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await login({ identifier: formData.identifier.trim(), password: formData.password });
      const userName = data?.user?.name || 'back';
      toast.success(`Welcome back, ${userName}!`);
      setSuccessMsg('Signed in! Redirecting…');
      setTimeout(() => navigate(from, { replace: true }), 600);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 130px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: 'var(--bg-secondary)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px',
            background: 'var(--accent-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.5rem', margin: '0 auto 1rem',
            boxShadow: '0 4px 14px rgba(236,72,153,0.35)',
          }}>
            <FiLogIn />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', padding: '2rem' }}>
          {serverError && (
            <div className="alert alert-error">
              <FiAlertCircle style={{ flexShrink: 0 }} /> {serverError}
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success">
              <FiCheckCircle style={{ flexShrink: 0 }} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="login-identifier">Email or Username</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '0.95rem' }} />
                <input
                  id="login-identifier" name="identifier" type="text" className="form-input"
                  placeholder="you@example.com or username"
                  value={formData.identifier} onChange={handleChange}
                  style={{ paddingLeft: '2.5rem', borderColor: errors.identifier ? 'var(--danger)' : '' }}
                />
              </div>
              {errors.identifier && <span className="form-error">{errors.identifier}</span>}
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '0.95rem' }} />
                <input
                  id="login-password" name="password" type={showPwd ? 'text' : 'password'} className="form-input"
                  placeholder="Your password"
                  value={formData.password} onChange={handleChange}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem', borderColor: errors.password ? 'var(--danger)' : '' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" id="login-submit-btn" className="btn btn-primary"
              disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.975rem' }}>
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" id="link-to-register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
