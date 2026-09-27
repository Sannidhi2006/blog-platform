import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiAtSign,
  FiUserPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Field component is kept OUTSIDE Register.
// This prevents the input from losing focus whenever the form state changes.
const Field = ({
  id,
  name,
  label,
  type,
  icon,
  placeholder,
  error,
  showToggle,
  showState,
  onToggle,
  value,
  onChange
}) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>

    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: '0.9rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-dim)',
          fontSize: '0.95rem',
          display: 'flex'
        }}
      >
        {icon}
      </span>

      <input
        id={id}
        name={name}
        type={
          showToggle
            ? showState
              ? 'text'
              : 'password'
            : type
        }
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          paddingLeft: '2.5rem',
          paddingRight: showToggle ? '2.75rem' : '1rem',
          borderColor: error ? 'var(--danger)' : ''
        }}
      />

      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute',
            right: '0.9rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-dim)'
          }}
        >
          {showState ? <FiEyeOff /> : <FiEye />}
        </button>
      )}
    </div>

    {error && <span className="form-error">{error}</span>}
  </div>
);

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({
      ...p,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((p) => ({
        ...p,
        [name]: ''
      }));
    }

    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const e = {};

    if (!formData.name.trim()) {
      e.name = 'Full name is required';
    }

    if (!formData.username.trim()) {
      e.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      e.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      e.username = 'Only letters, numbers, underscores';
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!emailRe.test(formData.email)) {
      e.email = 'Invalid email address';
    }

    if (!formData.password) {
      e.password = 'Password is required';
    } else if (formData.password.length < 6) {
      e.password = 'At least 6 characters';
    }

    if (!formData.confirmPassword) {
      e.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      toast.success('Account created successfully! Welcome aboard.');

      setSuccessMsg('Account created! Redirecting…');

      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed';

      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 130px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--bg-secondary)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px'
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px rgba(236,72,153,0.35)'
            }}
          >
            <FiUserPlus />
          </div>

          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.025em',
              marginBottom: '0.35rem'
            }}
          >
            Create an account
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}
          >
            Join the community of developers and writers
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            padding: '2rem'
          }}
        >
          {/* Server Error */}
          {serverError && (
            <div
              className="alert alert-error"
              id="register-error-message"
            >
              <FiAlertCircle style={{ flexShrink: 0 }} />
              {serverError}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div
              className="alert alert-success"
              id="register-success-message"
            >
              <FiCheckCircle style={{ flexShrink: 0 }} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <Field
              id="register-name"
              name="name"
              label="Full Name"
              type="text"
              icon={<FiUser />}
              placeholder="Jane Doe"
              error={errors.name}
              value={formData.name}
              onChange={handleChange}
            />

            {/* Username */}
            <Field
              id="register-username"
              name="username"
              label="Username"
              type="text"
              icon={<FiAtSign />}
              placeholder="janedoe"
              error={errors.username}
              value={formData.username}
              onChange={handleChange}
            />

            {/* Email */}
            <Field
              id="register-email"
              name="email"
              label="Email Address"
              type="email"
              icon={<FiMail />}
              placeholder="jane@example.com"
              error={errors.email}
              value={formData.email}
              onChange={handleChange}
            />

            {/* Password */}
            <Field
              id="register-password"
              name="password"
              label="Password"
              type="password"
              icon={<FiLock />}
              placeholder="Minimum 6 characters"
              showToggle
              showState={showPwd}
              onToggle={() => setShowPwd(!showPwd)}
              error={errors.password}
              value={formData.password}
              onChange={handleChange}
            />

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <Field
                id="register-confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                icon={<FiLock />}
                placeholder="Re-enter your password"
                showToggle
                showState={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                error={errors.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="register-submit-btn"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.8rem',
                fontSize: '0.975rem'
              }}
            >
              {submitting ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div
                    className="spinner"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderWidth: '2px'
                    }}
                  />

                  Creating Account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.9rem',
            color: 'var(--text-muted)'
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            id="link-to-login"
            style={{
              color: 'var(--accent-primary)',
              fontWeight: 600
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

