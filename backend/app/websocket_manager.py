"""
WebSocket Manager — handles WebSocket connections and broadcasts messages.
"""
import json
import asyncio
from typing import Set
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected WebSocket clients."""
        if not self.active_connections:
            return

        data = json.dumps(message)
        dead = set()

        for websocket in list(self.active_connections):
            try:
                await websocket.send_text(data)
            except Exception as e:
                logger.warning(f"Failed to send to websocket: {e}")
                dead.add(websocket)

        for ws in dead:
            self.active_connections.discard(ws)

    async def broadcast_log(self, log_entry: dict):
        await self.broadcast({"type": "log", "payload": log_entry})

    async def broadcast_metrics(self, metrics: dict):
        await self.broadcast({"type": "metrics", "payload": metrics})

    async def broadcast_alert(self, alert: dict):
        await self.broadcast({"type": "alert", "payload": alert})

    async def broadcast_service_status(self, statuses: list):
        await self.broadcast({"type": "service_status", "payload": statuses})

    async def broadcast_system(self, message: str, status: str = "operational"):
        await self.broadcast({"type": "system", "payload": {"message": message, "status": status}})
