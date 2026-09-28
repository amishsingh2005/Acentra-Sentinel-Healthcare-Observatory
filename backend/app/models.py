"""
Data models for Acentra Sentinel
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Severity(str, Enum):
    NORMAL = "NORMAL"
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class LogEntry(BaseModel):
    id: str
    timestamp: str
    level: LogLevel
    service: str
    message: str
    latency: int  # ms
    raw: str


class Metrics(BaseModel):
    total_events: int
    error_events: int
    error_rate: float
    events_per_min: float
    baseline_mean: float
    baseline_std: float
    threshold: float
    window_size: int


class ServiceStatus(BaseModel):
    name: str
    display_name: str
    status: str  # healthy, warning, critical, unknown
    events_per_min: float
    error_rate: float
    avg_latency: float
    last_incident: Optional[str] = None


class TimelineEvent(BaseModel):
    timestamp: str
    event: str
    severity: Optional[str] = None


class Alert(BaseModel):
    id: str
    service: str
    service_display: str
    severity: Severity
    title: str
    description: str
    current_rate: float
    baseline_rate: float
    threshold_rate: float
    deviation_pct: float
    detected_at: str
    status: AlertStatus = AlertStatus.ACTIVE
    related_logs: List[LogEntry] = []
    timeline: List[TimelineEvent] = []
    notification_status: str = "pending"
    estimated_impact: str = ""
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None


class WebSocketMessage(BaseModel):
    type: str  # log | metrics | anomaly | alert | service_status | system
    payload: dict


class DemoCommand(BaseModel):
    action: str  # simulate_claims | simulate_um | simulate_fhir | simulate_pharmacy | reset
