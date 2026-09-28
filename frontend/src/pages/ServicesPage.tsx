import type { ServiceItem, MetricsPoint } from '../types';
import { ServiceTable } from '../components/ServiceTable';
import { DemoControls } from '../components/DemoControls';
import { ErrorRateChart } from '../components/ErrorRateChart';

interface ServicesPageProps {
  services: ServiceItem[];
  metricsHistory: MetricsPoint[];
  baselineMean: number;
  threshold: number;
  baselineReady: boolean;
}

export function ServicesPage({ services, metricsHistory, baselineMean, threshold, baselineReady }: ServicesPageProps) {
  const critCount = services.filter((s) => s.status === 'critical').length;
  const warnCount = services.filter((s) => s.status === 'warning').length;

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">SERVICES</h1>
        <p className="hero-subtitle">
          {services.length} services monitored ·{' '}
          {critCount > 0 && <span style={{ color: 'var(--status-critical)' }}>{critCount} critical · </span>}
          {warnCount > 0 && <span style={{ color: 'var(--status-warning)' }}>{warnCount} warning · </span>}
          {services.length - critCount - warnCount} healthy
        </p>
      </div>

      <div className="section-gap">
        <DemoControls />
      </div>

      <div className="section-gap">
        <div className="section-title">SERVICE STATUS</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <ServiceTable services={services} />
        </div>
      </div>

      <div className="section-gap">
        <div className="card">
          <div className="section-title">GLOBAL ERROR RATE</div>
          <ErrorRateChart
            data={metricsHistory}
            threshold={threshold}
            baselineMean={baselineMean}
            baselineReady={baselineReady}
          />
        </div>
      </div>
    </div>
  );
}
