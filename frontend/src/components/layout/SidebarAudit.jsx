import React, { useRef, useEffect } from 'react';

const FILTER_COLORS = { 1: '#8b5cf6', 2: '#ca8a04', 3: '#16a34a', 4: '#d97706' };

export default function SidebarAudit({ entries, filterNode }) {
  const listRef = useRef(null);

  // If filterNode is given, only show entries from that node
  const filtered = filterNode
    ? entries.filter(e => e.noeud === filterNode)
    : entries;

  // Auto-scroll to the bottom when a new entry is appended
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [filtered.length]);

  return (
    <div className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-title">AUDIT TRAIL</div>
        <div className="sidebar-sub">Événements P2P temps réel (Chronologique)</div>
      </div>

      <div className="sidebar-list" ref={listRef}>
        {filtered.length === 0 ? (
          <div className="audit-empty">Aucun événement</div>
        ) : (
          filtered.map((e, i) => (
            <div key={i} className="audit-item fade-in">
              <div className="audit-meta">
                <span className="audit-node">{e.noeud}</span>
                <span className="audit-time">{formatTime(e.timestamp)}</span>
              </div>
              <div className="audit-body">
                <div
                  className="audit-bar"
                  style={{ background: FILTER_COLORS[e.filterId] || '#9ca3af' }}
                />
                <div className="audit-content">
                  <p className="audit-text">{e.action}</p>
                  {e.filterId === 2 && (
                    <div className="secure-badge">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      ECDSA Vérifié
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 0.75rem;
          gap: 0.5rem;
        }
        .sidebar-head {
          flex-shrink: 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0.25rem;
        }
        .sidebar-title {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #166534;
        }
        .sidebar-sub {
          font-size: 0.58rem;
          color: #9ca3af;
          margin-top: 0.1rem;
        }
        .sidebar-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          scroll-behavior: smooth;
        }
        .audit-empty {
          text-align: center;
          padding: 2rem 0;
          font-size: 0.72rem;
          color: #d1d5db;
        }
        .audit-item {
          padding: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .audit-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .audit-node {
          font-size: 0.6rem;
          font-weight: 700;
          color: #166534;
        }
        .audit-time {
          font-size: 0.55rem;
          color: #9ca3af;
        }
        .audit-body {
          display: flex;
          gap: 0.4rem;
          align-items: flex-start;
        }
        .audit-bar {
          width: 3px;
          min-height: 24px;
          border-radius: 2px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .audit-content { flex: 1; min-width: 0; }
        .audit-text {
          font-size: 0.67rem;
          line-height: 1.35;
          color: #4b5563;
          margin: 0;
          word-break: break-word;
        }
        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          margin-top: 0.3rem;
          font-size: 0.55rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: none; } }
      `}</style>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
