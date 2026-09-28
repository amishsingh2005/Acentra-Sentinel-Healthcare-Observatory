// ──────────────────────────────────────────
// Acentra Sentinel — TypeScript Types
// ──────────────────────────────────────────

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type Severity = 'NORMAL' | 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
export type ServiceStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  latency: number;
  raw: string;
}

export interface Metrics {
  total_events: number;
  error_events: number;
  error_rate: number;
  events_per_min: number;
  baseline_mean: number;
  baseline_std: number;
  threshold: number;
  window_size: number;
  baseline_ready: boolean;
  active_alerts: number;
  services_monitored: number;
  timestamp: string;
}

export interface MetricsPoint {
  timestamp: string;
  error_rate: number;
  baseline_mean: number;
  threshold: number;
  time: string;
}

export interface ServiceItem {
  name: string;
  display_name: string;
  status: ServiceStatus;
  events_per_min: number;
  error_rate: number;
  avg_latency: number;
  last_incident: string | null;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  severity?: string;
}

export interface Alert {
  id: string;
  service: string;
  service_display: string;
  severity: Severity;
  title: string;
  description: string;
  current_rate: number;
  baseline_rate: number;
  threshold_rate: number;
  deviation_pct: number;
  detected_at: string;
  status: AlertStatus;
  related_logs: LogEntry[];
  timeline: TimelineEvent[];
  notification_status: string;
  estimated_impact: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface NotificationStatus {
  provider: string;
  mode: 'demo' | 'connected';
  connected: boolean;
  topic_arn?: string;
}

export type NavPage = 'overview' | 'services' | 'alerts' | 'logs';

export interface WSMessage {
  type: 'log' | 'metrics' | 'alert' | 'service_status' | 'system' | 'metrics_history' | 'alerts_list' | 'notification_status';
  payload: unknown;
}
