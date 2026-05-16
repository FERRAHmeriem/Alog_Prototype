import React from 'react';

/**
 * Premium Card component with soft shadow and rounded corners.
 */
export const Card = ({ children, className = "", title, subtitle }) => (
  <div className={`card ${className}`}>
    {(title || subtitle) && (
      <div className="card-header">
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
    )}
    <div className="card-content">{children}</div>
    <style>{`
      .card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }
      .card:hover {
        box-shadow: var(--shadow-md);
      }
      .card-header {
        padding: 1.25rem;
        border-bottom: 1px solid var(--color-border);
        background: #fafafa;
      }
      .card-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .card-subtitle {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        margin-top: 0.25rem;
      }
      .card-content {
        padding: 1.25rem;
      }
    `}</style>
  </div>
);

/**
 * Button component with loading state.
 */
export const Button = ({ children, onClick, disabled, variant = "primary", isLoading, className = "" }) => (
  <button 
    onClick={onClick} 
    disabled={disabled || isLoading}
    className={`btn btn--${variant} ${isLoading ? 'btn--loading' : ''} ${className}`}
  >
    {isLoading && <span className="spinner"></span>}
    {children}
    <style>{`
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 8px;
        border: 1px solid transparent;
        gap: 0.5rem;
      }
      .btn--primary {
        background: var(--color-primary);
        color: white;
      }
      .btn--primary:hover:not(:disabled) {
        background: var(--color-primary-dark);
      }
      .btn--secondary {
        background: white;
        border-color: var(--color-border);
        color: var(--color-text-secondary);
      }
      .btn--secondary:hover:not(:disabled) {
        background: var(--color-bg);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </button>
);

/**
 * Badge component for filter states.
 */
export const Badge = ({ status, children }) => {
  const statusMap = {
    idle: { bg: 'var(--color-idle)', text: 'var(--color-text-secondary)' },
    active: { bg: 'var(--color-active)', text: 'white' },
    done: { bg: 'var(--color-success)', text: 'white' },
    ignored: { bg: 'var(--color-bg)', text: 'var(--color-blocked)', border: '1px dashed var(--color-border)' },
    error: { bg: 'var(--color-error)', text: 'white' },
  };
  
  const style = statusMap[status] || statusMap.idle;

  return (
    <span className={`badge ${status === 'active' ? 'animate-pulse' : ''}`}>
      {children}
      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          background: ${style.bg};
          color: ${style.text};
          border: ${style.border || 'none'};
        }
      `}</style>
    </span>
  );
};
