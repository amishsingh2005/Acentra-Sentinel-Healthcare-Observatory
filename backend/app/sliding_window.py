"""
Sliding Window for rolling error rate calculation.
Maintains the latest N events and computes metrics.
"""
from collections import deque
from threading import Lock
from typing import List, Tuple
from datetime import datetime


class SlidingWindow:
    def __init__(self, size: int = 100):
        self.size = size
        self.events: deque = deque(maxlen=size)
        self.lock = Lock()
        self._events_per_min_buffer: deque = deque(maxlen=60)  # 60 one-second samples
        self._last_count_time = datetime.now()
        self._events_since_last = 0

    def add_event(self, is_error: bool, timestamp: str = None):
        with self.lock:
            self.events.append(1 if is_error else 0)
            self._events_since_last += 1

    def get_metrics(self) -> dict:
        with self.lock:
            events_list = list(self.events)
            total = len(events_list)
            errors = sum(events_list)
            error_rate = (errors / total * 100) if total > 0 else 0.0

            # Calculate events per minute using the recent buffer
            now = datetime.now()
            elapsed = (now - self._last_count_time).total_seconds()
            if elapsed >= 1.0:
                # Compute rate and reset
                rate = self._events_since_last / elapsed * 60
                self._events_per_min_buffer.append(rate)
                self._events_since_last = 0
                self._last_count_time = now

            if self._events_per_min_buffer:
                events_per_min = sum(self._events_per_min_buffer) / len(self._events_per_min_buffer)
            else:
                events_per_min = 0.0

            return {
                "total_events": total,
                "error_events": errors,
                "error_rate": round(error_rate, 2),
                "events_per_min": round(events_per_min, 0),
                "window_size": self.size,
            }

    def reset(self):
        with self.lock:
            self.events.clear()
            self._events_per_min_buffer.clear()
            self._events_since_last = 0
