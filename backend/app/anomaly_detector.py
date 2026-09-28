"""
Anomaly Detector — compares current error rate against baseline threshold.
"""
from app.baseline import BaselineEngine
from app.sliding_window import SlidingWindow


class AnomalyDetector:
    def __init__(self, baseline: BaselineEngine, window: SlidingWindow):
        self.baseline = baseline
        self.window = window

    def check(self) -> dict | None:
        """
        Returns an anomaly dict if the current error rate exceeds the threshold,
        otherwise returns None.
        """
        metrics = self.window.get_metrics()
        stats = self.baseline.get_stats()

        current_rate = metrics["error_rate"]
        threshold = stats["threshold"]
        mean = stats["mean"]

        if not stats["ready"]:
            return None

        if current_rate > threshold and metrics["total_events"] >= 10:
            absolute_deviation = current_rate - mean
            percentage_deviation = ((current_rate - mean) / mean * 100) if mean > 0 else 0

            return {
                "current_rate": current_rate,
                "baseline_mean": mean,
                "baseline_std": stats["std"],
                "threshold": threshold,
                "absolute_deviation": round(absolute_deviation, 2),
                "percentage_deviation": round(percentage_deviation, 1),
                "total_events": metrics["total_events"],
                "error_events": metrics["error_events"],
            }

        return None
