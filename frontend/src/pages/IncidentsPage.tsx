import type { Alert } from '../types';

interface IncidentsPageProps {
  alerts: Alert[];
}

export function IncidentsPage({ alerts }: IncidentsPageProps) {
  // Only show resolved incidents for historical analytics
  const resolved = alerts.filter(a => a.status === 'RESOLVED');

  // Mock data if none exist yet
  const mockIncidents = [
    { id: 'mock-1', date: '2026-09-27', service: 'Claims Adjudication', mttr: '14m 22s', rootCause: 'Database connection pool exhaustion', impact: 'High - 1.2k claims delayed' },
    { id: 'mock-2', date: '2026-09-25', service: 'Pharmacy Management', mttr: '4m 05s', rootCause: 'Third-party API rate limit exceeded', impact: 'Low - Retries succeeded' },
    { id: 'mock-3', date: '2026-09-21', service: 'FHIR Interoperability', mttr: '32m 10s', rootCause: 'Kubernetes node memory pressure', impact: 'Medium - Read latency spiked' },
  ];

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <div className="hero" style={{ marginBottom: 'var(--space-4)' }}>
        <h1 className="hero-title">INCIDENT ANALYTICS</h1>
        <p className="hero-subtitle">Historical post-mortems, root cause tracking, and Mean Time to Resolution (MTTR) analytics.</p>
      </div>

      <div className="metric-grid" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <div className="metric-card-label">Avg MTTR (30 Days)</div>
          <div className="metric-card-value" style={{ color: 'var(--accent-primary)' }}>12m 45s</div>
          <div className="metric-card-footer">
            <span className="metric-card-sub healthy">↓ 15% vs last month</span>
          </div>
        </div>
        <div className="card">
          <div className="metric-card-label">Uptime SLA</div>
          <div className="metric-card-value">99.98%</div>
          <div className="metric-card-footer">
            <span className="metric-card-sub muted">Target: 99.95%</span>
          </div>
        </div>
        <div className="card">
          <div className="metric-card-label">Total Incidents</div>
          <div className="metric-card-value">{resolved.length + 3}</div>
          <div className="metric-card-footer">
            <span className="metric-card-sub muted">Last 30 days</span>
          </div>
        </div>
        <div className="card">
          <div className="metric-card-label">Automation Rate</div>
          <div className="metric-card-value">84%</div>
          <div className="metric-card-footer">
            <span className="metric-card-sub healthy">Auto-resolved</span>
          </div>
        </div>
      </div>

      <div className="section-gap">
        <div className="section-title">HISTORICAL POST-MORTEMS</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date Resolved</th>
                <th>Affected Service</th>
                <th>Root Cause Analysis</th>
                <th>Impact</th>
                <th>MTTR</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map(alert => (
                <tr key={alert.id}>
                  <td className="font-mono text-muted">{alert.resolved_at || alert.detected_at}</td>
                  <td><span className="badge critical">{alert.service_display}</span></td>
                  <td className="text-secondary">{alert.description}</td>
                  <td className="text-secondary">{alert.estimated_impact}</td>
                  <td className="font-mono text-primary">~2m 10s</td>
                  <td><a className="table-action-link">View Report</a></td>
                </tr>
              ))}
              {mockIncidents.map(inc => (
                <tr key={inc.id}>
                  <td className="font-mono text-muted">{inc.date}</td>
                  <td><span className="badge neutral">{inc.service}</span></td>
                  <td className="text-secondary">{inc.rootCause}</td>
                  <td className="text-secondary">{inc.impact}</td>
                  <td className="font-mono text-primary">{inc.mttr}</td>
                  <td><a className="table-action-link">View Report</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
