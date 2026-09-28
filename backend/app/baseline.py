"""
Baseline Engine — collects rolling error-rate observations
and calculates mean + std for anomaly detection thresholds.
"""
import statistics
from collections import deque
from threading import Lock


class BaselineEngine:
    def __init__(self, window: int = 200, warmup: int = 30):
        """
        window: how many error-rate samples to keep for baseline stats
        warmup: minimum samples before baseline is considered ready
        """
        self.window = window
        self.warmup = warmup
        self.samples: deque = deque(maxlen=window)
        self.lock = Lock()

    def add_sample(self, error_rate: float):
        """Add a new error-rate observation to the baseline."""
        with self.lock:
            self.samples.append(error_rate)

    def get_stats(self) -> dict:
        """Return baseline mean, std, threshold, and readiness."""
        with self.lock:
            data = list(self.samples)

        if len(data) < self.warmup:
            return {
                "mean": 0.0,
                "std": 0.0,
                "threshold": 5.0,  # default threshold during warmup
                "ready": False,
                "sample_count": len(data),
            }

        mean = statistics.mean(data)
        std = statistics.stdev(data) if len(data) > 1 else 0.0
        threshold = mean + 2 * std

        return {
            "mean": round(mean, 2),
            "std": round(std, 2),
            "threshold": round(threshold, 2),
            "ready": True,
            "sample_count": len(data),
        }

    def reset(self):
        with self.lock:
            self.samples.clear()
