"""
Log Monitor — tail-watches application.log, parses new lines,
feeds the sliding window, checks baseline, runs anomaly detection.
"""
import asyncio
import os
import time
import logging
from pathlib import Path
from collections import defaultdict, deque
from datetime import datetime
from typing import Dict, List, Optional

from app.log_parser import parse_log_line
from app.sliding_window import SlidingWindow
from app.baseline import BaselineEngine
from app.anomaly_detector import AnomalyDetector
from app.alert_engine import AlertEngine
from app.models import LogEntry, ServiceStatus
from app.websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)

LOG_FILE = Path(__file__).parent.parent / "data" / "application.log"

# Per-service sliding windows and service metrics
class ServiceMetrics:
    def __init__(self):
        self.window = SlidingWindow(size=50)
        self.latencies: deque = deque(maxlen=100)
        self.last_incident: Optional[str] = None
        self.status: str = "healthy"

SERVICE_DISPLAY = {
    "Claims-Adjudication": "Claims Adjudication",
    "Utilization-Management": "Utilization Management",
    "Pharmacy-Management": "Pharmacy Management",
    "FHIR-Interoperability": "FHIR Interoperability",
    "Provider-Management": "Provider Management",
    "Care-Management": "Care Management",
    "Member-Services": "Member Services",
}

ALL_SERVICES = list(SERVICE_DISPLAY.keys())


class LogMonitor:
    def __init__(
        self,
        ws_manager: WebSocketManager,
        alert_engine: AlertEngine,
        window_size: int = 100,
    ):
        self.ws_manager = ws_manager
        self.alert_engine = alert_engine

        # Global window
        self.global_window = SlidingWindow(size=window_size)
        self.baseline = BaselineEngine(window=200, warmup=30)
        self.detector = AnomalyDetector(self.baseline, self.global_window)

        # Per-service windows
        self.service_metrics: Dict[str, ServiceMetrics] = {
            svc: ServiceMetrics() for svc in ALL_SERVICES
        }

        # Anomaly cooldown: prevent alerting the same service too often
        self.last_anomaly_time: Dict[str, float] = {}
        self.anomaly_cooldown = 30  # seconds

        # Recent logs for broadcast
        self.recent_logs: List[LogEntry] = []

        # Metrics history for chart
        self.metrics_history: List[dict] = []
        self.max_history = 120  # keep last 2 minutes of 1s samples

        self._file_pos = 0
        self._running = False

    async def start(self):
        self._running = True
        logger.info(f"Log monitor starting. Watching: {LOG_FILE}")

        # Seek to end of existing file so we only process new lines
        if LOG_FILE.exists():
            self._file_pos = LOG_FILE.stat().st_size

        asyncio.create_task(self._watch_loop())
        asyncio.create_task(self._metrics_broadcast_loop())

    async def stop(self):
        self._running = False

    async def _watch_loop(self):
        while self._running:
            await self._read_new_lines()
            await asyncio.sleep(0.2)

    async def _read_new_lines(self):
        if not LOG_FILE.exists():
            return

        try:
            current_size = LOG_FILE.stat().st_size
        except OSError:
            return

        if current_size < self._file_pos:
            # File was truncated/rotated
            self._file_pos = 0

        if current_size <= self._file_pos:
            return

        try:
            with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
                f.seek(self._file_pos)
                new_content = f.read(current_size - self._file_pos)
                self._file_pos = f.tell()
        except Exception as e:
            logger.error(f"Error reading log file: {e}")
            return

        lines = new_content.splitlines()

        for raw_line in lines:
            entry = parse_log_line(raw_line)
            if entry is None:
                continue

            # Add to alert engine's recent log list
            self.alert_engine.add_recent_log(entry)

            # Update global sliding window
            is_error = entry.level.value in ("ERROR", "CRITICAL")
            self.global_window.add_event(is_error)

            # Update per-service metrics
            svc_metrics = self.service_metrics.get(entry.service)
            if svc_metrics:
                svc_metrics.window.add_event(is_error)
                svc_metrics.latencies.append(entry.latency)

            # Keep recent logs for broadcast
            self.recent_logs.append(entry)
            if len(self.recent_logs) > 200:
                self.recent_logs = self.recent_logs[-200:]

            # Broadcast log to frontend
            await self.ws_manager.broadcast_log(entry.dict())

        # After processing new lines, sample baseline and check for anomalies
        metrics = self.global_window.get_metrics()
        if metrics["total_events"] > 0:
            self.baseline.add_sample(metrics["error_rate"])
            await self._check_anomalies()

    async def _check_anomalies(self):
        """Check per-service windows for anomalies."""
        for service, svc_m in self.service_metrics.items():
            svc_data = svc_m.window.get_metrics()
            if svc_data["total_events"] < 5:
                continue

            # Per-service baseline (simplified: use global baseline for now)
            global_stats = self.baseline.get_stats()
            if not global_stats["ready"]:
                continue

            current_rate = svc_data["error_rate"]
            threshold = global_stats["threshold"]
            mean = global_stats["mean"]

            if current_rate > threshold and svc_data["total_events"] >= 5:
                # Check cooldown
                now = time.time()
                last = self.last_anomaly_time.get(service, 0)
                is_active = self.alert_engine.active_alert_per_service.get(service) is not None

                if not is_active and now - last < self.anomaly_cooldown:
                    continue
                if is_active and now - last < 1.0:
                    continue

                self.last_anomaly_time[service] = now
                svc_m.status = "critical" if current_rate > threshold * 1.5 else "warning"
                svc_m.last_incident = datetime.now().strftime("%H:%M:%S")

                pct_dev = ((current_rate - mean) / mean * 100) if mean > 0 else 0
                anomaly = {
                    "current_rate": current_rate,
                    "baseline_mean": mean,
                    "baseline_std": global_stats["std"],
                    "threshold": threshold,
                    "absolute_deviation": round(current_rate - mean, 2),
                    "percentage_deviation": round(pct_dev, 1),
                    "total_events": svc_data["total_events"],
                    "error_events": svc_data["error_events"],
                }

                await self.alert_engine.process_anomaly(
                    service=service,
                    anomaly=anomaly,
                    ws_manager=self.ws_manager,
                )
            else:
                if svc_m.status not in ("healthy",):
                    svc_m.status = "healthy"

    async def _metrics_broadcast_loop(self):
        """Broadcast aggregated metrics to all clients every second."""
        while self._running:
            await asyncio.sleep(1.0)
            await self._broadcast_metrics()

    async def _broadcast_metrics(self):
        metrics = self.global_window.get_metrics()
        stats = self.baseline.get_stats()

        payload = {
            **metrics,
            "baseline_mean": stats["mean"],
            "baseline_std": stats["std"],
            "threshold": stats["threshold"],
            "baseline_ready": stats["ready"],
            "active_alerts": self.alert_engine.get_active_count(),
            "services_monitored": len(ALL_SERVICES),
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        }

        # Append to history
        self.metrics_history.append(payload)
        if len(self.metrics_history) > self.max_history:
            self.metrics_history = self.metrics_history[-self.max_history:]

        await self.ws_manager.broadcast_metrics(payload)

        # Also broadcast service statuses
        statuses = self._get_service_statuses()
        await self.ws_manager.broadcast_service_status(statuses)

    def _get_service_statuses(self) -> List[dict]:
        statuses = []
        for svc, svc_m in self.service_metrics.items():
            data = svc_m.window.get_metrics()
            avg_latency = (
                sum(svc_m.latencies) / len(svc_m.latencies)
                if svc_m.latencies
                else 0
            )
            statuses.append({
                "name": svc,
                "display_name": SERVICE_DISPLAY.get(svc, svc),
                "status": svc_m.status,
                "events_per_min": data["events_per_min"],
                "error_rate": data["error_rate"],
                "avg_latency": round(avg_latency),
                "last_incident": svc_m.last_incident,
            })
        return statuses

    def get_metrics_history(self) -> List[dict]:
        return list(self.metrics_history)

    def reset_service(self, service: str):
        """Reset a service's metrics and status."""
        if service in self.service_metrics:
            svc_m = self.service_metrics[service]
            svc_m.window.reset()
            svc_m.latencies.clear()
            svc_m.status = "healthy"
            svc_m.last_incident = None
            self.last_anomaly_time.pop(service, None)

    def reset_all(self):
        for svc in self.service_metrics:
            self.reset_service(svc)
        self.global_window.reset()
        self.baseline.reset()
        self.last_anomaly_time.clear()
