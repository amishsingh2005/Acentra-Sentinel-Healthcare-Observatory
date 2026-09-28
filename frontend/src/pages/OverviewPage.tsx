import type { Metrics, MetricsPoint, Alert, ServiceItem, LogEntry, NotificationStatus } from '../types';
import { MetricCard } from '../components/MetricCard';
import { ErrorRateChart } from '../components/ErrorRateChart';
import { AlertFeed } from '../components/AlertFeed';
import { LogViewer } from '../components/LogViewer';
import { DemoControls } from '../components/DemoControls';
import { ServiceTable } from '../components/ServiceTable';

interface OverviewPageProps {
  metrics: Metrics | null;
  metricsHistory: MetricsPoint[];
  alerts: Alert[];
  services: ServiceItem[];
  logs: LogEntry[];
  systemStatus: string;
  notifStatus: NotificationStatus | null;
  onAlertSelect: (alert: Alert) => void;
}

export function OverviewPage({
  metrics,
  metricsHistory,
  alerts,
  services,
  logs,
  systemStatus,
  notifStatus,
  onAlertSelect,
}: OverviewPageProps) {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const errorRate = metrics?.error_rate ?? 0;
  const eventsPerMin = metrics?.events_per_min ?? 0;
  const baselineMean = metrics?.baseline_mean ?? 0;
  const threshold = metrics?.threshold ?? 0;
  const baselineReady = metrics?.baseline_ready ?? false;

  let systemDotClass = 'healthy';
  let systemLabel = 'SYSTEM OPERATIONAL';
  if (activeAlerts.some((a) => a.severity === 'CRITICAL')) {
    systemDotClass = 'critical';
    systemLabel = 'DEGRADED PERFORMANCE';
  } else if (activeAlerts.some((a) => a.severity === 'WARNING')) {
    systemDotClass = 'warning';
    systemLabel = 'DEGRADED PERFORMANCE';
  } else if (systemStatus === 'incident') {
    systemDotClass = 'warning';
    systemLabel = 'SIMULATION RUNNING';
  }

  const recentAlert = alerts[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* Background Giant 'A' Watermark */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -100,
        width: 1000,
        height: 1000,
        opacity: 0.04,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          {/* Thick solid geometric chevron / A shape matching Acentra brand */}
          <path d="M 20 100 L 60 15 L 100 100 L 75 100 L 60 65 L 45 100 Z" fill="#FFFFFF" />
          {/* Swoosh cutting across the bottom */}
          <path d="M -10 100 Q 30 65 80 100" stroke="#FFFFFF" strokeWidth="15" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* 1. Hero Section */}
      <div className="hero" style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px' }}>
          <h1 className="hero-title">
            <span className="text-primary">REAL-TIME HEALTHCARE</span><br/>
            <span className="text-primary">OPERATIONS</span><br/>
            <span className="text-accent">INTELLIGENCE</span>
          </h1>
          <p className="hero-subtitle">
            Monitor application behavior, detect abnormal activity, and surface operational incidents in real time.
            Continuous observational telemetry across EHR integrations, claims pipelines, and FHIR APIs.
          </p>
          
          <div className="hero-stats">
            <div className="status-indicator">
              <span className={`status-dot ${systemDotClass}`} />
              {systemLabel}
            </div>
            <div className="status-indicator">
              <span className="status-dot healthy" />
              {metrics?.services_monitored ?? 0} SERVICES MONITORED
            </div>
            <div className="status-indicator">
              <span className="status-dot healthy" />
              WEBSOCKET CONNECTED · {Math.max(1, (eventsPerMin/60)).toFixed(1)}M msg/sec
            </div>
            <div className="status-indicator">
              <span className="status-dot info" />
              HIPAA AUDIT LOGGING: ACTIVE
            </div>
          </div>
        </div>
        
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: 550, 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden', 
            border: '1px solid var(--border-subtle)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)' 
          }}>
            <img 
              src="/hero-image.png" 
              alt="Clinical Operations" 
              style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.85 }} 
            />
          </div>
        </div>
      </div>

      {/* 2. Simulation Controls */}
      <div className="section-gap">
        <DemoControls />
      </div>

      {/* 3. KPI Metrics */}
      <div className="metric-grid section-gap">
        <MetricCard
          label="EVENTS / MIN"
          value={Math.round(eventsPerMin).toLocaleString()}
          badge="↗ +12.4%"
          badgeClass="healthy"
          rightText={`evt/sec: ${(eventsPerMin / 60).toFixed(2)}`}
          sub="rolling average"
          subClass="muted"
        />
        <MetricCard
          label="ERROR RATE"
          value={`${errorRate.toFixed(1)}%`}
          badge={errorRate > threshold ? 'Elevated' : 'Normal'}
          badgeClass={errorRate > threshold ? 'warning' : 'healthy'}
          rightText={`SLA: 5.0%`}
          sub={`baseline ${baselineMean.toFixed(1)}%`}
          subClass="healthy"
        />
        <MetricCard
          label="ACTIVE ALERTS"
          value={String(activeAlerts.length)}
          rightText="incidents active"
          badge={
            <div style={{ display: 'flex', gap: 4 }}>
              {activeAlerts.map((a, i) => (
                <span key={i} className={`status-dot ${a.severity.toLowerCase()}`} style={{ display: 'inline-block' }} />
              ))}
            </div>
          }
          sub={`${metrics?.services_monitored ?? 7} services monitored`}
          subClass="muted"
        />
        <MetricCard
          label="WINDOW SIZE"
          value={String(metrics?.window_size ?? 100)}
          rightText="events depth"
          badge="Sliding Window"
          badgeClass="muted"
          sub="sliding window events"
          subClass="muted"
        />
      </div>

      {/* 4. Rolling Error Rate + Live Alerts */}
      <div className="two-col section-gap">
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div className="section-title">
            <span>ROLLING ERROR RATE</span>
            <span className="text-muted" style={{ fontSize: 11, fontWeight: 400, textTransform: 'none' }}>Sliding window · Latest 100 events</span>
          </div>
          <div style={{ height: 340 }}>
            <ErrorRateChart
              data={metricsHistory}
              threshold={threshold}
              baselineMean={baselineMean}
              baselineReady={baselineReady}
            />
          </div>
        </div>
        
        <div className="card">
          <div className="section-title">
            <span>LIVE ALERTS</span>
            {activeAlerts.length > 0 && (
              <span className="badge critical">
                <span className="status-dot critical" />
                {activeAlerts.length}
              </span>
            )}
          </div>
          <AlertFeed alerts={activeAlerts} onSelect={onAlertSelect} limit={5} />
        </div>
      </div>

      {/* 5. Service Health */}
      <div className="section-gap">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            CLINICAL SERVICES TOPOLOGY & HEALTH
            <span className="mini-badge healthy">LIVE MATRIX</span>
          </div>
          <div className="text-muted" style={{ fontSize: 11, fontWeight: 400, textTransform: 'none' }}>
            Auto-refresh: <span className="text-accent" style={{ fontWeight: 500 }}>1s</span> · <a href="#" className="table-action-link">Export Telemetry</a>
          </div>
        </div>
        <ServiceTable services={services} />
        <div className="text-muted" style={{ fontSize: 11, marginTop: 8 }}>
          Instantaneous round-trip latency, circuit breakers, and throughput health across critical patient pathways
        </div>
      </div>

      {/* 6. Live Logs */}
      <div className="section-gap">
        <div className="section-title">
          LIVE LOG STREAM
          <span className="mini-badge healthy">● STREAMING</span>
        </div>
        <LogViewer logs={logs.slice(-100)} autoScroll />
      </div>

      {/* 7. Incident Timeline */}
      <div className="section-gap">
        <div className="section-title">INCIDENT TIMELINE</div>
        <div className="card" style={{ padding: 'var(--space-5) var(--space-4)' }}>
          {recentAlert ? (
            <div className="incident-timeline">
              {recentAlert.timeline.map((ev, i) => {
                const isCritical = ev.severity === 'CRITICAL' || ev.event.includes('Critical');
                const isWarning = ev.severity === 'WARNING' || ev.event.includes('WARNING');
                const dotClass = isCritical ? 'critical' : isWarning ? 'warning' : 'healthy';
                const isLast = i === recentAlert.timeline.length - 1;
                
                return (
                  <div key={i} className="timeline-row">
                    <div className="timeline-time-col">{ev.timestamp}</div>
                    <div className="timeline-track">
                      <div className={`timeline-node ${dotClass}`} />
                      {!isLast && <div className="timeline-line" />}
                    </div>
                    <div className={`timeline-content ${isCritical ? 'highlight-critical' : isWarning ? 'highlight-warning' : ''}`}>
                      {ev.event}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              No recent incidents to display. System operating normally.
            </div>
          )}
        </div>
      </div>

      {/* 8. AWS Notification Status */}
      <div className="section-gap">
        <div className="section-title">AWS NOTIFICATIONS</div>
        <div className="card" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase' }}>SNS Topic</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className={`status-dot ${notifStatus?.sns_configured ? 'healthy' : 'warning'}`} />
              <span style={{ fontWeight: 500 }}>{notifStatus?.sns_configured ? 'Connected' : 'Demo Mode'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase' }}>CloudWatch</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="status-dot warning" />
              <span style={{ fontWeight: 500 }}>Demo Mode</span>
            </div>
          </div>
          {notifStatus?.last_notification && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginLeft: 'auto' }}>
              <span className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase' }}>Last Notification</span>
              <span className="font-mono text-secondary">{notifStatus.last_notification.slice(11, 19)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 9. System Pipeline */}
      <div className="section-gap" style={{ marginBottom: 120 }}>
        <div className="section-title">SYSTEM PIPELINE</div>
        <div className="card" style={{ padding: 'var(--space-5)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 'max-content' }}>
            
            {/* Phase 1: Source & Ingest */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Phase 1: Ingest</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 13 }}>Synthetic Workload</div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>application.log</div>
              </div>
            </div>

            <div style={{ color: 'var(--border-subtle)' }}>→</div>

            {/* Phase 2: Measure */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Phase 2: Measure</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 13 }}>Log Parser</div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 12px', background: 'linear-gradient(135deg, rgba(43, 178, 66, 0.1) 0%, transparent 100%)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '4px', fontSize: 13, fontWeight: 500 }}>Sliding Window</div>
              </div>
            </div>

            <div style={{ color: 'var(--border-subtle)' }}>→</div>

            {/* Phase 3: Detect */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Phase 3: Detect</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 13 }}>Baseline Engine</div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 13 }}>Deviation Analysis</div>
              </div>
            </div>

            <div style={{ color: 'var(--border-subtle)' }}>→</div>

            {/* Phase 4: Respond */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Phase 4: Respond</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ padding: '8px 12px', background: 'linear-gradient(135deg, rgba(229, 72, 77, 0.15) 0%, transparent 100%)', border: '1px solid var(--status-critical)', color: 'var(--status-critical)', borderRadius: '4px', fontSize: 13, fontWeight: 500 }}>Alert Engine</div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 13 }}>WebSockets / AWS SNS</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 10. Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) 0', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
        <div>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>ACENTRA HEALTH</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>SENTINEL ENGINE v4.19</span>
          <span style={{ margin: '0 8px' }}>·</span>
          Zero-Trust Architecture
          <span style={{ margin: '0 8px' }}>·</span>
          FedRAMP High & SOC2 Type II Certified
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Security Protocol</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>HIPAA Attestation</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Telemetry API Docs</a>
        </div>
      </div>

    </div>
  );
}
