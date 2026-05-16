import React from 'react';

const FILTERS = [
  { id: 1, label: "Filtre ①", desc: "Adaptateur FHIR (ACL)" },
  { id: 2, label: "Filtre ②", desc: "Sécurité & Consentement" },
  { id: 3, label: "Filtre ③", desc: "Audit & Smart Cache" },
  { id: 4, label: "Filtre ④", desc: "Interface SIH" },
];

const STATUS_COLORS = {
  idle:    { border: '#d1d5db', bg: 'white',   dot: '#9ca3af' },
  active:  { border: '#3b82f6', bg: '#eff6ff',  dot: '#3b82f6' },
  done:    { border: '#16a34a', bg: '#16a34a',   dot: 'white'  },
  ignored: { border: '#e5e7eb', bg: '#f9fafb',   dot: '#d1d5db' },
  error:   { border: '#ef4444', bg: '#fff1f2',   dot: '#ef4444' },
};

export default function PipelineVisualizer({ filterStates, compact = false }) {
  return (
    <div className={`pv ${compact ? 'pv--compact' : ''}`}>
      <div className="pv-track">
        {FILTERS.map((f, i) => {
          const status = filterStates?.[f.id] || 'idle';
          const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;
          const isDone = status === 'done';
          const isActive = status === 'active';
          const isIgnored = status === 'ignored';

          return (
            <React.Fragment key={f.id}>
              <div className={`pv-node pv-node--${status}`}>
                {/* Circle */}
                <div
                  className="pv-circle"
                  style={{
                    borderColor: colors.border,
                    background: colors.bg,
                    transform: isActive ? 'scale(1.12)' : 'scale(1)',
                    boxShadow: isActive
                      ? `0 0 0 4px rgba(59,130,246,0.15)`
                      : isDone
                      ? `0 0 0 3px rgba(22,163,74,0.2)`
                      : 'none',
                    opacity: isIgnored ? 0.4 : 1,
                  }}
                >
                  {isDone && <CheckIcon />}
                  {isActive && <div className="pv-pulse" />}
                  {!isDone && !isActive && (
                    <div
                      className="pv-dot"
                      style={{ background: colors.dot }}
                    />
                  )}
                </div>

                {/* Label */}
                {!compact && (
                  <div className="pv-info">
                    <span className="pv-label">{f.label}</span>
                    <span className="pv-desc">{f.desc}</span>
                    <span className={`pv-badge pv-badge--${status}`}>{STATUS_TEXT[status]}</span>
                  </div>
                )}
                {compact && (
                  <div className="pv-info">
                    <span className="pv-label pv-label--sm">{f.label}</span>
                    <span className={`pv-badge pv-badge--${status}`}>{STATUS_TEXT[status]}</span>
                  </div>
                )}
              </div>

              {/* Pipe segment */}
              {i < FILTERS.length - 1 && (
                <div
                  className={`pv-pipe ${isDone ? 'pv-pipe--active' : ''}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        .pv {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
        }
        .pv--compact {
          padding: 0.75rem 1rem;
        }

        .pv-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0;
        }

        .pv-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
          z-index: 2;
          position: relative;
        }

        .pv-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .pv--compact .pv-circle {
          width: 32px;
          height: 32px;
        }

        .pv-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }

        .pv-pulse {
          width: 12px; height: 12px;
          background: #3b82f6;
          border-radius: 50%;
          animation: pvPing 1.2s cubic-bezier(0,0,0.2,1) infinite;
        }
        @keyframes pvPing {
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        .pv-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          text-align: center;
        }
        .pv-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #166534;
        }
        .pv-label--sm {
          font-size: 0.6rem;
        }
        .pv-desc {
          font-size: 0.65rem;
          color: #6b7280;
          max-width: 110px;
        }

        .pv-badge {
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
        }
        .pv-badge--idle    { background: #f3f4f6; color: #9ca3af; }
        .pv-badge--active  { background: #dbeafe; color: #1d4ed8; }
        .pv-badge--done    { background: #dcfce7; color: #166534; }
        .pv-badge--ignored { background: #f3f4f6; color: #d1d5db; }
        .pv-badge--error   { background: #fee2e2; color: #dc2626; }

        /* Connecting pipe */
        .pv-pipe {
          flex: 1;
          height: 3px;
          background: #e5e7eb;
          position: relative;
          z-index: 1;
          margin-bottom: 2.5rem; /* aligns with circle center in normal mode */
          overflow: hidden;
          transition: background 0.4s;
        }
        .pv--compact .pv-pipe {
          margin-bottom: 1.75rem;
        }
        .pv-pipe--active {
          background: #16a34a;
        }
        .pv-pipe--active::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: pvFlow 1.2s linear infinite;
        }
        @keyframes pvFlow {
          0%   { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

const STATUS_TEXT = {
  idle: 'Idle',
  active: 'Actif',
  done: 'Done',
  ignored: 'Ignoré',
  error: 'Erreur',
};

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
