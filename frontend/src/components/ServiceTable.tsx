import type { ServiceItem } from '../types';

const MOCK_CONTEXT: Record<string, { path: string, rel: string }> = {
  'Claims-Adjudication': { path: 'EDI-837 / gRPC', rel: '99.99%' },
  'FHIR-Interoperability': { path: 'REST / OAuth 2.0', rel: '97.42%' },
  'Utilization-Management': { path: 'EDI-278 / Kafka', rel: '99.94%' },
  'Pharmacy-Management': { path: 'NCPDP SCRIPT v2017', rel: '99.98%' },
  'Provider-Management': { path: 'REST / GraphQL', rel: '99.99%' },
  'Care-Management': { path: 'HL7 v2.x / MLLP', rel: '100.0%' },
  'Member-Services': { path: 'REST / OAuth 2.0', rel: '99.95%' }
};

export function ServiceTable({ services }: { services: ServiceItem[] }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>SERVICE NAME</th>
            <th>PATH / PROTOCOL</th>
            <th>LATENCY</th>
            <th>STATUS</th>
            <th>24H RELIABILITY</th>
            <th style={{ textAlign: 'right' }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => {
            const ctx = MOCK_CONTEXT[s.name] || { path: 'Internal / gRPC', rel: '99.99%' };
            const isDegraded = s.status === 'warning' || s.status === 'critical';
            
            return (
              <tr key={s.name}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className={`status-dot ${s.status === 'critical' ? 'critical' : s.status === 'warning' ? 'warning' : 'healthy'}`} />
                  {s.display_name}
                </td>
                <td className="font-mono text-muted" style={{ fontSize: 12 }}>{ctx.path}</td>
                <td className="font-mono" style={{ color: isDegraded ? 'var(--status-warning)' : 'var(--status-healthy)', fontWeight: 500 }}>
                  {s.avg_latency.toFixed(0)}ms
                </td>
                <td>
                  <div className={`status-indicator`} style={{ 
                    borderColor: isDegraded ? 'var(--status-warning)' : 'var(--status-healthy)',
                    backgroundColor: isDegraded ? 'rgba(255,176,32,0.1)' : 'rgba(57,211,83,0.1)'
                  }}>
                    <span className={`status-dot ${s.status === 'critical' ? 'critical' : s.status === 'warning' ? 'warning' : 'healthy'}`} />
                    <span style={{ color: isDegraded ? 'var(--status-warning)' : 'var(--status-healthy)' }}>
                      {s.status === 'critical' ? 'Latency Degraded' : s.status === 'warning' ? 'Latency Degraded' : 'Healthy'}
                    </span>
                  </div>
                </td>
                <td className="font-mono text-muted" style={{ fontSize: 12 }}>
                  {ctx.rel}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <a href="#" className="table-action-link" style={{ 
                    color: isDegraded ? 'var(--status-warning)' : 'var(--accent-primary)',
                    fontWeight: isDegraded ? 600 : 400
                  }}>
                    {isDegraded ? 'Diagnose Bottleneck' : 'View Trace'}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
