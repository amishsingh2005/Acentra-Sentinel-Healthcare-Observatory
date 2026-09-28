import type { Alert } from '../types';
import { AlertFeed } from '../components/AlertFeed';

interface AlertsPageProps {
  alerts: Alert[];
  onAlertSelect: (alert: Alert) => void;
}

export function AlertsPage({ alerts, onAlertSelect }: AlertsPageProps) {
  const active = alerts.filter((a) => a.status === 'ACTIVE');
  const acknowledged = alerts.filter((a) => a.status === 'ACKNOWLEDGED');
  const resolved = alerts.filter((a) => a.status === 'RESOLVED');

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">ALERTS</h1>
        <p className="hero-subtitle">
          {active.length} active · {acknowledged.length} acknowledged · {resolved.length} resolved
        </p>
      </div>

      {active.length > 0 && (
        <div className="section-gap">
          <div className="section-title">
            ACTIVE ALERTS
            <span className="badge critical">
              <span className="status-dot critical" />
              {active.length}
            </span>
          </div>
          <AlertFeed alerts={active} onSelect={onAlertSelect} />
        </div>
      )}

      {acknowledged.length > 0 && (
        <div className="section-gap">
          <div className="section-title">ACKNOWLEDGED</div>
          <AlertFeed alerts={acknowledged} onSelect={onAlertSelect} />
        </div>
      )}

      {resolved.length > 0 && (
        <div className="section-gap">
          <div className="section-title">RESOLVED</div>
          <AlertFeed alerts={resolved} onSelect={onAlertSelect} />
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No active alerts</div>
          <div className="text-secondary">System is operating within normal parameters</div>
        </div>
      )}
    </div>
  );
}
