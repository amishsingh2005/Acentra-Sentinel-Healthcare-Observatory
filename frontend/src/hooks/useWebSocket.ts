// ──────────────────────────────────────────
// useWebSocket — manages WS lifecycle
// ──────────────────────────────────────────
import { useEffect, useRef, useCallback, useState } from 'react';
import type { WSMessage } from '../types';

const WS_URL = 'ws://localhost:8000/ws';
const RECONNECT_DELAY = 3000;

export type MessageHandler = (msg: WSMessage) => void;

export function useWebSocket(onMessage: MessageHandler) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        setConnected(true);
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSMessage;
          onMessageRef.current(msg);
        } catch {
          // ignore malformed messages
        }
      };

      socket.onclose = () => {
        setConnected(false);
        ws.current = null;
        reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY);
      };

      socket.onerror = () => {
        socket.close();
      };

      ws.current = socket;
    } catch {
      reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  return { connected };
}
