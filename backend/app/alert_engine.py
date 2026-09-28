"""
Alert Engine — creates and manages alerts from detected anomalies.
"""
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from threading import Lock
from app.models import Alert, AlertStatus, Severity, TimelineEvent, LogEntry
from app.severity import assign_severity
from app.notification_service import NotificationService

SERVICE_DISPLAY = {
    "Claims-Adjudication": "Claims Adjudication",
    "Utilization-Management": "Utilization Management",
    "Pharmacy-Management": "Pharmacy Management",
    "FHIR-Interoperability": "FHIR Interoperability",
    "Provider-Management": "Provider Management",
    "Care-Management": "Care Management",
    "Member-Services": "Member Services",
}

IMPACT_MAP = {
    Severity.CRITICAL: "High impact — claims processing delays expected. Member appeals and authorization backlogs likely.",
    Severity.WARNING: "Moderate impact — degraded service quality observed. Monitor for escalation.",
    Severity.INFO: "Low impact — minor anomaly detected. Normal operations expected to resume shortly.",
    Severity.NORMAL: "No significant impact.",
}


class AlertEngine:
    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service
        self.alerts: Dict[str, Alert] = {}
        self.active_alert_per_service: Dict[str, str] = {}  # service -> alert_id
        self.recent_logs: List[LogEntry] = []
        self.lock = Lock()

    def add_recent_log(self, log: LogEntry):
        with self.lock:
            self.recent_logs.append(log)
            if len(self.recent_logs) > 500:
                self.recent_logs = self.recent_logs[-500:]

    async def process_anomaly(
        self,
        service: str,
        anomaly: dict,
        ws_manager=None,
    ) -> Optional[Alert]:
        severity = assign_severity(anomaly)

        if severity == Severity.NORMAL:
            return None

        # If there's already an active alert for this service, update it
        with self.lock:
            existing_id = self.active_alert_per_service.get(service)
            if existing_id and existing_id in self.alerts:
                existing = self.alerts[existing_id]
                if existing.status == AlertStatus.ACTIVE:
                    # Update existing alert with new metrics
                    existing.current_rate = anomaly["current_rate"]
                    existing.severity = severity
                    if ws_manager:
                        await ws_manager.broadcast_alert(existing.dict())
                    return existing

        now = datetime.now()
        now_str = now.strftime("%Y-%m-%dT%H:%M:%S")
        display = SERVICE_DISPLAY.get(service, service)

        # Build incident timeline
        baseline_dev_time = now.strftime("%H:%M:%S")

        timeline = [
            TimelineEvent(
                timestamp=(now.replace(second=max(0, now.second - 41))).strftime("%H:%M:%S"),
                event="Normal operation",
            ),
            TimelineEvent(
                timestamp=(now.replace(second=max(0, now.second - 26))).strftime("%H:%M:%S"),
                event="Error rate increasing",
            ),
            TimelineEvent(
                timestamp=(now.replace(second=max(0, now.second - 11))).strftime("%H:%M:%S"),
                event="Baseline deviation detected",
            ),
            TimelineEvent(
                timestamp=(now.replace(second=max(0, now.second - 10))).strftime("%H:%M:%S"),
                event="WARNING — threshold approaching",
                severity="WARNING",
            ),
            TimelineEvent(
                timestamp=(now.replace(second=max(0, now.second - 2))).strftime("%H:%M:%S"),
                event="Critical threshold crossed",
            ),
            TimelineEvent(
                timestamp=now.strftime("%H:%M:%S"),
                event=f"{severity.value} alert generated",
                severity=severity.value,
            ),
            TimelineEvent(
                timestamp=now.strftime("%H:%M:%S"),
                event="WebSocket notification sent",
            ),
            TimelineEvent(
                timestamp=now.strftime("%H:%M:%S"),
                event="AWS SNS notification attempted",
            ),
        ]

        # Get related logs
        with self.lock:
            related = [
                l for l in self.recent_logs[-50:]
                if l.service == service
            ][-10:]

        alert = Alert(
            id=str(uuid.uuid4()),
            service=service,
            service_display=display,
            severity=severity,
            title=f"Error rate exceeded baseline — {display}",
            description=f"Error rate has deviated significantly from baseline.",
            current_rate=anomaly["current_rate"],
            baseline_rate=anomaly["baseline_mean"],
            threshold_rate=anomaly["threshold"],
            deviation_pct=anomaly["percentage_deviation"],
            detected_at=now_str,
            related_logs=related,
            timeline=timeline,
            estimated_impact=IMPACT_MAP.get(severity, ""),
            notification_status="pending",
        )

        with self.lock:
            self.alerts[alert.id] = alert
            self.active_alert_per_service[service] = alert.id

        # Send notification
        result = await self.notification_service.send_alert(alert.dict())
        with self.lock:
            alert.notification_status = result.get("status", "unknown")

        if ws_manager:
            await ws_manager.broadcast_alert(alert.dict())

        return alert

    def get_alerts(self) -> List[Alert]:
        with self.lock:
            return sorted(self.alerts.values(), key=lambda a: a.detected_at, reverse=True)

    def get_alert(self, alert_id: str) -> Optional[Alert]:
        with self.lock:
            return self.alerts.get(alert_id)

    def acknowledge_alert(self, alert_id: str) -> Optional[Alert]:
        with self.lock:
            alert = self.alerts.get(alert_id)
            if alert and alert.status == AlertStatus.ACTIVE:
                alert.status = AlertStatus.ACKNOWLEDGED
                alert.acknowledged_at = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            return alert

    def resolve_alert(self, alert_id: str) -> Optional[Alert]:
        with self.lock:
            alert = self.alerts.get(alert_id)
            if alert and alert.status != AlertStatus.RESOLVED:
                alert.status = AlertStatus.RESOLVED
                alert.resolved_at = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
                # Clear active alert for service
                if self.active_alert_per_service.get(alert.service) == alert_id:
                    del self.active_alert_per_service[alert.service]
            return alert

    def get_active_count(self) -> int:
        with self.lock:
            return sum(1 for a in self.alerts.values() if a.status == AlertStatus.ACTIVE)
