import { useState } from 'react';
import type { LogEntry, LogLevel } from '../types';
import { LogViewer } from '../components/LogViewer';

interface LogsPageProps {
  logs: LogEntry[];
}

const LEVEL_FILTERS: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];

export function LogsPage({ logs }: LogsPageProps) {
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  const services = Array.from(new Set(logs.map((l) => l.service))).sort();

  const filtered = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (serviceFilter !== 'ALL' && log.service !== serviceFilter) return false;
    return true;
  });

  const errorCount = logs.filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL').length;
  const warnCount = logs.filter((l) => l.level === 'WARN').length;

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">LOGS</h1>
        <p className="hero-subtitle">
          {logs.length} entries · <span style={{ color: 'var(--status-critical)' }}>{errorCount} errors</span> · <span style={{ color: 'var(--status-warning)' }}>{warnCount} warnings</span>
        </p>
      </div>

      <div className="card section-gap" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase' }}>Level</span>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            {(['ALL', ...LEVEL_FILTERS] as (LogLevel | 'ALL')[]).map((lvl) => (
              <button
                key={lvl}
                className="btn"
                style={{
                  background: levelFilter === lvl ? 'var(--border-subtle)' : 'transparent',
                  color: levelFilter === lvl ? 'var(--text-primary)' : 'var(--text-muted)',
                  height: 28,
                  fontSize: 12,
                  padding: '0 8px'
                }}
                onClick={() => setLevelFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase' }}>Service</span>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{
              fontFamily: 'inherit',
              fontSize: 13,
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Auto-scroll
          </label>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {filtered.length} entries
          </span>
        </div>
      </div>

      <LogViewer logs={filtered.slice(-200)} autoScroll={autoScroll} />
    </div>
  );
}
