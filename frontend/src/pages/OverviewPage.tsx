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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      
      {/* 1. Header (Compact) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            🛡️ ACENTRA SENTINEL <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, letterSpacing: 'normal' }}>Real-Time Operations Intelligence</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="status-indicator" style={{ padding: '4px 10px', fontSize: 11 }}>
            <span className={`status-dot ${systemDotClass}`} />
            {systemLabel}
          </div>
          <div className="status-indicator" style={{ padding: '4px 10px', fontSize: 11 }}>
            <span className="status-dot healthy" />
            {(eventsPerMin/60).toFixed(1)}M msg/sec
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics (Top Row) */}
      <div className="metric-grid" style={{ marginBottom: 16, flexShrink: 0, gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <MetricCard label="EVENTS / MIN" value={Math.round(eventsPerMin).toLocaleString()} badge="↗ +12.4%" badgeClass="healthy" rightText={`evt/sec: ${(eventsPerMin / 60).toFixed(2)}`} sub="rolling average" subClass="muted" />
        <MetricCard label="ERROR RATE" value={`${errorRate.toFixed(1)}%`} badge={errorRate > threshold ? 'Elevated' : 'Normal'} badgeClass={errorRate > threshold ? 'warning' : 'healthy'} rightText={`SLA: 5.0%`} sub={`baseline ${baselineMean.toFixed(1)}%`} subClass="healthy" />
        <MetricCard label="ACTIVE ALERTS" value={String(activeAlerts.length)} rightText="incidents active" badge={<div style={{ display: 'flex', gap: 4 }}>{activeAlerts.map((a, i) => (<span key={i} className={`status-dot ${a.severity.toLowerCase()}`} style={{ display: 'inline-block' }} />))}</div>} sub={`${metrics?.services_monitored ?? 7} services monitored`} subClass="muted" />
        <MetricCard label="WINDOW SIZE" value={String(metrics?.window_size ?? 100)} rightText="events depth" badge="Sliding Window" badgeClass="muted" sub="sliding window events" subClass="muted" />
      </div>

      {/* 3. Main Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 380px', gap: 16, flex: 1, minHeight: 0 }}>
        
        {/* LEFT COLUMN: Controls -> Timeline -> AWS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div style={{ flexShrink: 0 }}>
            <DemoControls />
          </div>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="section-title" style={{ padding: '16px 16px 0 16px' }}>INCIDENT TIMELINE</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {recentAlert ? (
                <div className="incident-timeline">
                  {recentAlert.timeline.map((ev, i) => {
                    const isCritical = ev.severity === 'CRITICAL' || ev.event.includes('Critical');
                    const isWarning = ev.severity === 'WARNING' || ev.event.includes('WARNING');
                    const dotClass = isCritical ? 'critical' : isWarning ? 'warning' : 'healthy';
                    const isLast = i === recentAlert.timeline.length - 1;
                    return (
                      <div key={i} className="timeline-row">
                        <div className="timeline-time-col">{ev.timestamp.slice(11,19)}</div>
                        <div className="timeline-track">
                          <div className={`timeline-node ${dotClass}`} />
                          {!isLast && <div className="timeline-line" />}
                        </div>
                        <div className={`timeline-content ${isCritical ? 'highlight-critical' : isWarning ? 'highlight-warning' : ''}`} style={{ fontSize: 11 }}>
                          {ev.event}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted" style={{ textAlign: 'center', marginTop: 40, fontSize: 12 }}>System operating normally.</div>
              )}
            </div>
          </div>
          <div className="card" style={{ flexShrink: 0, padding: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>AWS NOTIFICATIONS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase' }}>SNS Topic</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span className={`status-dot ${notifStatus?.sns_configured ? 'healthy' : 'warning'}`} />
                  {notifStatus?.sns_configured ? 'Connected' : 'Demo Mode'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase' }}>CloudWatch</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span className="status-dot warning" /> Demo Mode
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Error Rate -> Services -> Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div className="card" style={{ flexShrink: 0, padding: 16 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>ROLLING ERROR RATE</div>
            <div style={{ height: 220 }}>
              <ErrorRateChart data={metricsHistory} threshold={threshold} baselineMean={baselineMean} baselineReady={baselineReady} />
            </div>
          </div>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="section-title" style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>CLINICAL SERVICES TOPOLOGY</span>
              <span className="mini-badge healthy">LIVE MATRIX</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <ServiceTable services={services} />
            </div>
          </div>
          <div className="card" style={{ flexShrink: 0, padding: 16, overflowX: 'auto' }}>
            <div className="section-title" style={{ marginBottom: 12 }}>SYSTEM PIPELINE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 'max-content' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>1: Ingest</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 11 }}>Synthetic</div>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <div style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 11 }}>app.log</div>
                </div>
              </div>
              <div style={{ color: 'var(--border-subtle)' }}>→</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>2: Measure</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 11 }}>Parser</div>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <div style={{ padding: '4px 8px', background: 'linear-gradient(135deg, rgba(43, 178, 66, 0.1) 0%, transparent 100%)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '4px', fontSize: 11, fontWeight: 500 }}>Window</div>
                </div>
              </div>
              <div style={{ color: 'var(--border-subtle)' }}>→</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>3: Detect</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 11 }}>Baseline</div>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <div style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 11 }}>Deviation</div>
                </div>
              </div>
              <div style={{ color: 'var(--border-subtle)' }}>→</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>4: Respond</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ padding: '4px 8px', background: 'linear-gradient(135deg, rgba(229, 72, 77, 0.15) 0%, transparent 100%)', border: '1px solid var(--status-critical)', color: 'var(--status-critical)', borderRadius: '4px', fontSize: 11, fontWeight: 500 }}>Alert Engine</div>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <div style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: 11 }}>WS / SNS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Alerts -> Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div className="card" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: '45%' }}>
            <div className="section-title" style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>LIVE ALERTS</span>
              {activeAlerts.length > 0 && <span className="badge critical" style={{ fontSize: 10, padding: '2px 6px' }}><span className="status-dot critical" />{activeAlerts.length}</span>}
            </div>
            <div style={{ overflowY: 'auto' }}>
              <AlertFeed alerts={activeAlerts} onSelect={onAlertSelect} limit={10} />
            </div>
          </div>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="section-title" style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>LIVE LOG STREAM</span>
              <span className="mini-badge healthy">● STREAMING</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
               <LogViewer logs={logs.slice(-80)} autoScroll />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
