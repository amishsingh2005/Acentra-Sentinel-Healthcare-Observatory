import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

export function LogViewer({ logs, autoScroll = true }: { logs: LogEntry[], autoScroll?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="log-viewer-container" ref={containerRef}>
      {logs.map((log) => (
        <div key={log.id} className="log-entry">
          <div className="log-ts">{log.timestamp.slice(11, 23)}</div>
          <div className={`log-level-${log.level.toLowerCase()}`}>{log.level}</div>
          <div className="log-service">{log.service}</div>
          <div className="log-msg">{log.message}</div>
          <div className="log-latency">latency={log.latency}ms</div>
        </div>
      ))}
      {logs.length === 0 && (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
          Waiting for logs...
        </div>
      )}
    </div>
  );
}
