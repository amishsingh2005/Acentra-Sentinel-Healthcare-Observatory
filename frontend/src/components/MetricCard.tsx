interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  subClass?: 'muted' | 'healthy' | 'critical' | 'warning';
  badge?: React.ReactNode;
  badgeClass?: 'healthy' | 'warning' | 'critical' | 'muted';
  rightText?: string;
}

export function MetricCard({ label, value, sub, subClass = 'muted', badge, badgeClass = 'healthy', rightText }: MetricCardProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 180 }}>
      <div className="metric-card-header">
        <div className="metric-card-label">{label}</div>
        {badge && (
          <div className={`mini-badge ${badgeClass}`}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <div className="metric-card-value">{value}</div>
        {rightText && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{rightText}</div>}
      </div>
      <div style={{ flex: 1 }}></div>
      <div className="metric-card-footer">
        <div className={`metric-card-sub ${subClass}`}>{sub}</div>
      </div>
    </div>
  );
}
