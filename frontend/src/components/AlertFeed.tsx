import type { Alert } from '../types';

interface AlertFeedProps {
  alerts: Alert[];
  onSelect: (alert: Alert) => void;
  limit?: number;
}

export function AlertFeed({ alerts, onSelect, limit }: AlertFeedProps) {
  const displayAlerts = limit ? alerts.slice(0, limit) : alerts;
  
  if (displayAlerts.length === 0) {
    return <div className="text-muted" style={{ padding: 'var(--space-2)' }}>No alerts detected.</div>;
  }

  return (
    <div className="alert-feed">
      {displayAlerts.map(alert => {
        const severityClass = alert.severity === 'CRITICAL' ? 'critical' : alert.severity === 'WARNING' ? 'warning' : 'info';
        
        return (
          <div key={alert.id} className="alert-item" onClick={() => onSelect(alert)}>
            <div className="alert-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className={`status-dot ${severityClass}`} />
                <span className="alert-service">{alert.service_display}</span>
              </div>
              <span className="text-muted" style={{ fontSize: 12 }}>{alert.detected_at.slice(11, 19)}</span>
            </div>
            <div className="alert-desc">{alert.title}</div>
            
            {alert.status === 'ACTIVE' && (
              <div className="alert-metrics">
                <div className="alert-metric">
                  <span className="alert-metric-label">Current</span>
                  <span className="alert-metric-val">{alert.current_rate.toFixed(1)}%</span>
                </div>
                <div className="alert-metric">
                  <span className="alert-metric-label">Baseline</span>
                  <span className="alert-metric-val">{alert.baseline_rate.toFixed(1)}%</span>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: 'var(--space-2)', fontSize: 13, color: 'var(--accent-primary)', fontWeight: 500 }}>
              View Incident →
            </div>
          </div>
        );
      })}
    </div>
  );
}
