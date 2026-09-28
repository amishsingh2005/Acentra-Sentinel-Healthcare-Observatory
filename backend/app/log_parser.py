"""
Log Parser — converts raw log lines into structured LogEntry objects.
"""
import re
import uuid
from datetime import datetime
from app.models import LogEntry, LogLevel


LOG_PATTERN = re.compile(
    r"^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>DEBUG|INFO|WARN|WARNING|ERROR|CRITICAL)\s+"
    r"(?P<service>\S+)\s+"
    r"(?P<message>\S+)\s+"
    r"latency=(?P<latency>\d+)ms\s+"
    r"service=(?P<service_tag>\S+)"
)

SERVICE_DISPLAY = {
    "Claims-Adjudication": "Claims Adjudication",
    "Utilization-Management": "Utilization Management",
    "Pharmacy-Management": "Pharmacy Management",
    "FHIR-Interoperability": "FHIR Interoperability",
    "Provider-Management": "Provider Management",
    "Care-Management": "Care Management",
    "Member-Services": "Member Services",
}


def parse_log_line(raw: str) -> LogEntry | None:
    """Parse a raw log line into a LogEntry. Returns None if the line cannot be parsed."""
    raw = raw.strip()
    if not raw:
        return None

    match = LOG_PATTERN.match(raw)
    if not match:
        return None

    level_str = match.group("level").upper()
    if level_str == "WARNING":
        level_str = "WARN"

    try:
        level = LogLevel(level_str)
    except ValueError:
        level = LogLevel.INFO

    service_raw = match.group("service")

    return LogEntry(
        id=str(uuid.uuid4()),
        timestamp=match.group("timestamp"),
        level=level,
        service=service_raw,
        message=match.group("message"),
        latency=int(match.group("latency")),
        raw=raw,
    )
