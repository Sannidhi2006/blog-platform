import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast('success', msg, duration), [addToast]);
  const error = useCallback((msg, duration) => addToast('error', msg, duration), [addToast]);
  const info = useCallback((msg, duration) => addToast('info', msg, duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, removeToast }}>
      {children}
      {/* Toast Container */}
      <div
        id="toast-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          const bgColor = '#ffffff';
          const borderColor = isSuccess ? '#86efac' : isError ? '#fca5a5' : '#f9a8d4';
          const iconColor = isSuccess ? '#16a34a' : isError ? '#dc2626' : '#ec4899';
          const textColor = '#0f172a';

          return (
            <div
              key={toast.id}
              className="toast-item"
              style={{
                pointerEvents: 'auto',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-md, 10px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0,0,0,0.06)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ color: iconColor, fontSize: '1.25rem', display: 'flex', flexShrink: 0 }}>
                {isSuccess && <FiCheckCircle />}
                {isError && <FiAlertCircle />}
                {!isSuccess && !isError && <FiInfo />}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: textColor,
                  flex: 1,
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                }}
              >
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                  flexShrink: 0,
                }}
                aria-label="Close notification"
              >
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
