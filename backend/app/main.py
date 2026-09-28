"""
Acentra Sentinel — FastAPI Backend
Real-Time Healthcare Operations Intelligence
"""
import asyncio
import logging
import threading
import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.websocket_manager import WebSocketManager
from app.notification_service import NotificationService
from app.alert_engine import AlertEngine
from app.log_monitor import LogMonitor
from app.log_generator import run_generator, set_demo_mode
from app.models import DemoCommand, AlertStatus

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────
# Application Setup
# ──────────────────────────────────────────

app = FastAPI(
    title="Acentra Sentinel",
    description="Real-Time Healthcare Operations Intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────
# Singletons
# ──────────────────────────────────────────

ws_manager = WebSocketManager()
notification_service = NotificationService()
alert_engine = AlertEngine(notification_service)
log_monitor = LogMonitor(ws_manager, alert_engine, window_size=100)

# Demo state
_demo_active = {"service": None, "duration": 0, "started_at": None}
_demo_timer: Optional[asyncio.Task] = None


# ──────────────────────────────────────────
# Startup / Shutdown
# ──────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("Acentra Sentinel starting up...")

    # Ensure log file exists
    log_path = Path(__file__).parent.parent / "data" / "application.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    if not log_path.exists():
        log_path.touch()

    # Start log generator in background thread
    gen_thread = threading.Thread(target=run_generator, daemon=True)
    gen_thread.start()
    logger.info("Log generator started.")

    # Start log monitor
    await log_monitor.start()
    logger.info("Log monitor started.")

    await ws_manager.broadcast_system("Acentra Sentinel initialized", "operational")


@app.on_event("shutdown")
async def shutdown():
    await log_monitor.stop()
    logger.info("Acentra Sentinel shutting down.")


# ──────────────────────────────────────────
# WebSocket Endpoint
# ──────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial state on connection
        metrics = log_monitor.global_window.get_metrics()
        stats = log_monitor.baseline.get_stats()
        initial_metrics = {
            **metrics,
            "baseline_mean": stats["mean"],
            "baseline_std": stats["std"],
            "threshold": stats["threshold"],
            "baseline_ready": stats["ready"],
            "active_alerts": alert_engine.get_active_count(),
            "services_monitored": 7,
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        }
        await websocket.send_json({"type": "metrics", "payload": initial_metrics})

        # Send metrics history
        history = log_monitor.get_metrics_history()
        await websocket.send_json({"type": "metrics_history", "payload": history})

        # Send current alerts
        alerts = [a.dict() for a in alert_engine.get_alerts()]
        await websocket.send_json({"type": "alerts_list", "payload": alerts})

        # Send notification status
        await websocket.send_json({
            "type": "notification_status",
            "payload": notification_service.get_status(),
        })

        # Keep connection alive
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# ──────────────────────────────────────────
# REST API
# ──────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "acentra-sentinel", "timestamp": datetime.now().isoformat()}


@app.get("/api/metrics")
async def get_metrics():
    metrics = log_monitor.global_window.get_metrics()
    stats = log_monitor.baseline.get_stats()
    return {
        **metrics,
        "baseline_mean": stats["mean"],
        "baseline_std": stats["std"],
        "threshold": stats["threshold"],
        "baseline_ready": stats["ready"],
        "active_alerts": alert_engine.get_active_count(),
        "services_monitored": 7,
    }


@app.get("/api/metrics/history")
async def get_metrics_history():
    return log_monitor.get_metrics_history()


@app.get("/api/alerts")
async def get_alerts():
    return [a.dict() for a in alert_engine.get_alerts()]


@app.get("/api/alerts/{alert_id}")
async def get_alert(alert_id: str):
    alert = alert_engine.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert.dict()


@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    alert = alert_engine.acknowledge_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await ws_manager.broadcast_alert(alert.dict())
    return alert.dict()


@app.post("/api/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    alert = alert_engine.resolve_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await ws_manager.broadcast_alert(alert.dict())
    return alert.dict()


@app.get("/api/services")
async def get_services():
    return log_monitor._get_service_statuses()


@app.get("/api/notifications/status")
async def get_notification_status():
    return notification_service.get_status()


# ──────────────────────────────────────────
# Demo Control Endpoint
# ──────────────────────────────────────────

DEMO_CONFIGS = {
    "simulate_claims": {
        "service": "Claims-Adjudication",
        "intensity": 0.85,
        "duration": 45,
    },
    "simulate_um": {
        "service": "Utilization-Management",
        "intensity": 0.70,
        "duration": 40,
    },
    "simulate_fhir": {
        "service": "FHIR-Interoperability",
        "intensity": 0.75,
        "duration": 35,
    },
    "simulate_pharmacy": {
        "service": "Pharmacy-Management",
        "intensity": 0.80,
        "duration": 40,
    },
}


@app.post("/api/demo")
async def demo_command(cmd: DemoCommand):
    global _demo_timer

    if cmd.action == "reset":
        set_demo_mode(False)
        log_monitor.reset_all()
        # Resolve all active alerts
        for alert in alert_engine.get_alerts():
            if alert.status == AlertStatus.ACTIVE:
                alert_engine.resolve_alert(alert.id)
        _demo_active["service"] = None
        await ws_manager.broadcast_system("Demo reset — system restored to normal", "operational")
        return {"status": "reset", "message": "Demo reset complete"}

    if cmd.action == "stop":
        set_demo_mode(False)
        _demo_active["service"] = None
        if _demo_timer and not _demo_timer.done():
            _demo_timer.cancel()
        await ws_manager.broadcast_system("Incident injection stopped. System recovering.", "operational")
        return {"status": "stopped", "message": "Error injection halted."}

    config = DEMO_CONFIGS.get(cmd.action)
    if not config:
        raise HTTPException(status_code=400, detail=f"Unknown demo action: {cmd.action}")

    # Cancel any existing demo timer
    if _demo_timer and not _demo_timer.done():
        _demo_timer.cancel()

    # Activate demo mode in the generator
    set_demo_mode(True, config["service"], config["intensity"])
    _demo_active["service"] = config["service"]
    _demo_active["started_at"] = datetime.now().isoformat()

    # Schedule auto-reset after duration
    async def auto_reset():
        await asyncio.sleep(config["duration"])
        set_demo_mode(False)
        logger.info(f"Demo mode auto-reset after {config['duration']}s")

    _demo_timer = asyncio.create_task(auto_reset())

    await ws_manager.broadcast_system(
        f"Demo incident started — {config['service']} under simulated load",
        "incident",
    )

    return {
        "status": "started",
        "service": config["service"],
        "intensity": config["intensity"],
        "duration_seconds": config["duration"],
        "message": f"Injecting errors into {config['service']} at {int(config['intensity']*100)}% error rate for {config['duration']}s",
    }


@app.get("/api/demo/status")
async def demo_status():
    return {
        "active": _demo_active["service"] is not None,
        "service": _demo_active["service"],
        "started_at": _demo_active.get("started_at"),
    }
