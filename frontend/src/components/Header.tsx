import type { NavPage, NotificationStatus } from '../types';

interface HeaderProps {
  page: NavPage;
  onNav: (page: NavPage) => void;
  connected: boolean;
  notifStatus: NotificationStatus | null;
  systemStatus: string;
}

export function Header({ page, onNav, connected }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-name" style={{ display: 'flex', alignItems: 'center', height: 48, gap: 16 }}>
          {/* Acentra Health Pure HTML/SVG Logo */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Scroll to top"
          >
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: -2 }}>
              <path d="M 14 20 L 22 6 L 34 32" stroke="#39D353" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 6 32 Q 20 22 34 32" stroke="#39D353" strokeWidth="5.5" strokeLinecap="round" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: '#39D353', fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: 'system-ui, sans-serif' }}>Acentra</span>
              <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 600, letterSpacing: '0.36em', paddingLeft: 2, marginTop: 1, fontFamily: 'system-ui, sans-serif' }}>HEALTH</span>
            </div>
          </div>

          <span className="brand-name-accent" style={{ marginLeft: 12 }}>/</span>
          <span className="brand-name-secondary" style={{ fontSize: 16 }}>SENTINEL</span>
          <span style={{ color: 'var(--accent-primary)', marginLeft: 4, fontSize: 14 }}>●</span>
        </div>
        
        <nav className="nav-links">
          {(['overview', 'services', 'alerts', 'logs', 'incidents', 'topology'] as NavPage[]).map((p) => (
            <button
              key={p}
              className={`nav-link ${page === p ? 'active' : ''}`}
              onClick={() => onNav(p as NavPage)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <div className="demo-badge">
          <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>Demo Environment</span>
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          Synthetic Data
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          No PHI
        </div>

        <div className="status-indicator">
          <span className={`status-dot ${connected ? 'healthy' : 'critical'}`} />
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>
    </header>
  );
}
