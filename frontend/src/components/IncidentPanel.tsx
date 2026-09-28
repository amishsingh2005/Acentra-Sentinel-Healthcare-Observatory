import { useEffect } from 'react';
import type { Alert, TimelineEvent } from '../types';
import { api } from '../services/api';

interface IncidentPanelProps {
  alert: Alert;
  onClose: () => void;
  onUpdate: (alert: Alert) => void;
}

function formatDt(dt: string) {
  try {
    return new Date(dt).toLocaleString('en-US', { hour12: false });
  } catch {
    return dt;
  }
}

export function IncidentPanel({ alert, onClose, onUpdate }: IncidentPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleAcknowledge() {
    const updated = await api.acknowledgeAlert(alert.id);
    onUpdate(updated);
  }

  async function handleResolve() {
    const updated = await api.resolveAlert(alert.id);
    onUpdate(updated);
  }

  const isCritical = alert.severity === 'CRITICAL';
  const severityClass = isCritical ? 'critical' : alert.severity === 'WARNING' ? 'warning' : 'info';
  const deviationSign = alert.deviation_pct > 0 ? '+' : '';

  return (
    <div className="incident-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`incident-panel ${isCritical ? 'highlight-critical' : ''}`}>
        
        <div className="incident-panel-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
            <div className={`badge ${severityClass}`}>
              <span className={`status-dot ${severityClass}`} />
              {alert.severity} INCIDENT
            </div>
            <button className="btn btn-secondary" style={{ padding: '0 8px', height: 28 }} onClick={onClose}>✕</button>
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            {alert.service_display}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {alert.title}
          </div>
        </div>

        <div className="incident-panel-body">
          <div>
            <div className="panel-section-label">Metrics</div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', backgroundColor: 'var(--bg-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Current</div>
                <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: isCritical ? 'var(--status-critical)' : 'var(--text-primary)' }}>{alert.current_rate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Baseline</div>
                <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)' }}>{alert.baseline_rate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Threshold</div>
                <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)' }}>{alert.threshold_rate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Deviation</div>
                <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: isCritical ? 'var(--status-critical)' : 'var(--status-warning)' }}>{deviationSign}{alert.deviation_pct.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="two-col" style={{ gap: 'var(--space-4)' }}>
            <div>
              <div className="panel-section-label">Details</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                <span className="text-muted">Detected:</span> {formatDt(alert.detected_at)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                <span className="text-muted">Status:</span> <span className={`badge ${alert.status === 'ACTIVE' ? 'critical' : 'neutral'}`}>{alert.status}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <span className="text-muted">SNS Notification:</span> 
                <span className={`status-dot ${alert.notification_status.includes('sent') ? 'healthy' : 'warning'}`} style={{ display: 'inline-block', margin: '0 6px' }} /> 
                {alert.notification_status}
              </div>
            </div>
            
            {alert.estimated_impact && (
              <div>
                <div className="panel-section-label">Estimated Impact</div>
                <div className="impact-text">{alert.estimated_impact}</div>
              </div>
            )}
          </div>

          {alert.related_logs && alert.related_logs.length > 0 && (
            <div>
              <div className="panel-section-label">Related Logs</div>
              <div className="related-logs-box">
                {alert.related_logs.slice(-5).map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span className="text-muted">{log.timestamp.slice(11, 19)}</span>
                    <span style={{ color: log.level === 'ERROR' || log.level === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-warning)' }}>{log.level}</span>
                    <span className="text-secondary">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="panel-section-label">Recommended Investigation</div>
            <div className="impact-text">
              • Review validation timeout and downstream dependencies.<br/>
              • Check database connection pool saturation.<br/>
              • Coordinate with on-call engineer if error rate persists.
            </div>
          </div>

          <div>
            <div className="panel-section-label">Incident Timeline</div>
            <div className="incident-timeline">
              {alert.timeline.map((ev: TimelineEvent, i: number) => (
                <div key={i} className="timeline-event">
                  <div className={`timeline-dot ${ev.severity === 'CRITICAL' ? 'critical' : ev.severity === 'WARNING' ? 'warning' : 'healthy'}`} />
                  <div className="timeline-time">{ev.timestamp.slice(11, 19)}</div>
                  <div className="timeline-label">{ev.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="incident-panel-footer">
          {alert.status === 'ACTIVE' && (
            <button className="btn btn-secondary" onClick={handleAcknowledge}>Acknowledge</button>
          )}
          {alert.status !== 'RESOLVED' && (
            <button className="btn btn-primary" onClick={handleResolve}>Resolve Incident</button>
          )}
        </div>
      </div>
    </div>
  );
}
