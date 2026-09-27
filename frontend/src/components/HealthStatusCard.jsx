import React, { useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw, FiServer, FiCpu, FiClock, FiTerminal } from 'react-icons/fi';

const HealthStatusCard = ({ data, loading, error, lastChecked, onRefresh }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 800);
  };

  const isConnected = !error && data && data.status === 'ok';

  return (
    <div
      id="backend-health-card"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : error ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: isConnected
          ? '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.1)'
          : 'var(--shadow-card)',
        padding: '2rem',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header bar inside card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(236, 72, 153, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: isConnected ? 'var(--success)' : error ? 'var(--danger)' : 'var(--accent-primary)',
          }}>
            {isConnected ? <FiCheckCircle /> : error ? <FiAlertCircle /> : <FiServer />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Backend Connectivity
              </h3>
              <span
                id="health-status-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.2)' : error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(236, 72, 153, 0.15)',
                  color: isConnected ? '#34d399' : error ? '#f87171' : '#ec4899',
                  border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#10b981' : error ? '#ef4444' : '#ec4899',
                  boxShadow: isConnected ? '0 0 8px #10b981' : error ? '0 0 8px #ef4444' : '0 0 8px #ec4899',
                  animation: 'pulse 2s infinite',
                }} />
                {loading ? 'Checking...' : isConnected ? 'Connected & Healthy' : 'Disconnected'}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              GET /api/health verification endpoint
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          id="btn-recheck-health"
          onClick={handleRefreshClick}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
        >
          <FiRefreshCw style={{
            transition: 'transform 0.5s ease',
            transform: isRotating || loading ? 'rotate(360deg)' : 'none'
          }} />
          {loading ? 'Pinging...' : 'Re-check Endpoint'}
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <FiServer /> Target URL
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            http://localhost:5000/api/health
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <FiCpu /> Status Key
          </div>
          <div
            id="health-status-value"
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: isConnected ? '#10b981' : error ? '#ef4444' : '#e2e8f0',
            }}
          >
            {loading ? 'Fetching...' : data?.status ? `"${data.status}"` : 'None'}
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <FiClock /> Last Synced
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            {lastChecked || 'Pending check'}
          </div>
        </div>
      </div>

      {/* Response Data Payload JSON */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <FiTerminal /> Response Payload
          </span>
          <span style={{ fontSize: '0.75rem', color: isConnected ? '#10b981' : '#94a3b8' }}>
            HTTP 200 OK • application/json
          </span>
        </div>

        <div style={{
          backgroundColor: '#070a10',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          position: 'relative',
        }}>
          {error ? (
            <div style={{ color: '#f87171', fontSize: '0.9rem' }}>
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <pre
              id="health-response-json"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: '#38bdf8',
                overflowX: 'auto',
                margin: 0,
              }}
            >
              {loading && !data ? '// Fetching health data from http://localhost:5000/api/health...' : JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthStatusCard;
