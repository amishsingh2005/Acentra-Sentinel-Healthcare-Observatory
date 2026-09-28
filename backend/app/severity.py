"""
Severity Engine — assigns severity level based on anomaly metrics.
"""
from app.models import Severity


def assign_severity(anomaly: dict) -> Severity:
    """
    Assigns a severity level based on the current error rate and deviation.
    """
    current_rate = anomaly.get("current_rate", 0)
    pct_deviation = anomaly.get("percentage_deviation", 0)
    threshold = anomaly.get("threshold", 0)

    if current_rate >= threshold * 2 or pct_deviation >= 400:
        return Severity.CRITICAL
    elif current_rate >= threshold * 1.5 or pct_deviation >= 200:
        return Severity.WARNING
    elif current_rate >= threshold or pct_deviation >= 50:
        return Severity.INFO
    else:
        return Severity.NORMAL
