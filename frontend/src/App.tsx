// ──────────────────────────────────────────
// App.tsx — root component, WS state manager
// ──────────────────────────────────────────
import { useState, useCallback, useRef } from 'react';
import type {
  Metrics, MetricsPoint, Alert, ServiceItem, LogEntry,
  NavPage, NotificationStatus, WSMessage,
} from './types';
import { useWebSocket } from './hooks/useWebSocket';
import { Header } from './components/Header';
import { IncidentPanel } from './components/IncidentPanel';
import { OverviewPage } from './pages/OverviewPage';
import { ServicesPage } from './pages/ServicesPage';
import { AlertsPage } from './pages/AlertsPage';
import { LogsPage } from './pages/LogsPage';
import { TopologyPage } from './pages/TopologyPage';
import { IncidentsPage } from './pages/IncidentsPage';

const MAX_LOGS = 500;
const MAX_HISTORY = 120;

function toTimeLabel(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts.slice(11, 19);
  }
}

export default function App() {
  const [page, setPage] = useState<NavPage>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<MetricsPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notifStatus, setNotifStatus] = useState<NotificationStatus | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [systemStatus, setSystemStatus] = useState('operational');

  // Use ref to avoid stale closures in the WS handler
  const alertsRef = useRef<Alert[]>([]);

  const handleMessage = useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case 'metrics': {
        const m = msg.payload as Metrics;
        setMetrics(m);
        setMetricsHistory((prev) => {
          const point: MetricsPoint = {
            timestamp: m.timestamp,
            error_rate: m.error_rate,
            baseline_mean: m.baseline_mean,
            threshold: m.threshold,
            time: toTimeLabel(m.timestamp),
          };
          const next = [...prev, point];
          return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
        });
        break;
      }

      case 'metrics_history': {
        const history = msg.payload as Metrics[];
        const points: MetricsPoint[] = history.map((m) => ({
          timestamp: m.timestamp,
          error_rate: m.error_rate,
          baseline_mean: m.baseline_mean,
          threshold: m.threshold,
          time: toTimeLabel(m.timestamp),
        }));
        setMetricsHistory(points);
        break;
      }

      case 'log': {
        const log = msg.payload as LogEntry;
        setLogs((prev) => {
          const next = [...prev, log];
          return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
        });
        break;
      }

      case 'alert': {
        const newAlert = msg.payload as Alert;
        setAlerts((prev) => {
          const idx = prev.findIndex((a) => a.id === newAlert.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = newAlert;
            alertsRef.current = updated;
            return updated;
          }
          const updated = [newAlert, ...prev];
          alertsRef.current = updated;
          return updated;
        });
        // Update selected alert if it matches
        setSelectedAlert((prev) => (prev?.id === newAlert.id ? newAlert : prev));
        break;
      }

      case 'alerts_list': {
        const list = msg.payload as Alert[];
        const sorted = [...list].sort((a, b) => b.detected_at.localeCompare(a.detected_at));
        setAlerts(sorted);
        alertsRef.current = sorted;
        break;
      }

      case 'service_status': {
        const svcs = msg.payload as ServiceItem[];
        setServices(svcs);
        break;
      }

      case 'notification_status': {
        setNotifStatus(msg.payload as NotificationStatus);
        break;
      }

      case 'system': {
        const sys = msg.payload as { message: string; status: string };
        setSystemStatus(sys.status);
        break;
      }
    }
  }, []);

  const { connected } = useWebSocket(handleMessage);

  function handleAlertUpdate(updated: Alert) {
    setAlerts((prev) => {
      const idx = prev.findIndex((a) => a.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    setSelectedAlert(updated);
  }

  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="app-wrapper">
      {/* Background Watermark Logo */}
      <div 
        style={{
          position: 'fixed',
          top: '-15vh',
          left: '-20vw',
          width: '120vw',
          height: '130vh',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.8
        }}
      >
        <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          <path d="M 14 20 L 22 6 L 34 32" stroke="#06272A" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
          <path d="M 6 32 Q 20 22 34 32" stroke="#06272A" strokeWidth="8" strokeLinecap="square" fill="none" />
        </svg>
      </div>

      <Header
        page={page}
        onNav={setPage}
        connected={connected}
        notifStatus={notifStatus}
        systemStatus={systemStatus}
      />

      <main className="main" id="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {page === 'overview' && (
          <OverviewPage
            metrics={metrics}
            metricsHistory={metricsHistory}
            alerts={alerts}
            services={services}
            logs={logs}
            systemStatus={systemStatus}
            notifStatus={notifStatus}
            onAlertSelect={setSelectedAlert}
          />
        )}
        {page === 'services' && (
          <ServicesPage
            services={services}
            metricsHistory={metricsHistory}
            baselineMean={metrics?.baseline_mean ?? 0}
            threshold={metrics?.threshold ?? 0}
            baselineReady={metrics?.baseline_ready ?? false}
          />
        )}
        {page === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            onAlertSelect={setSelectedAlert}
          />
        )}
        {page === 'logs' && (
          <LogsPage logs={logs} />
        )}
        {page === 'incidents' && (
          <IncidentsPage alerts={alerts} />
        )}
        {page === 'topology' && (
          <TopologyPage services={services} />
        )}
      </main>

      {selectedAlert && (
        <IncidentPanel
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={handleAlertUpdate}
        />
      )}
    </div>
  );
}
