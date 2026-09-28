"""
Synthetic Log Generator — continuously appends synthetic healthcare logs
to backend/data/application.log.

Run this as a background process alongside the FastAPI server.
"""
import random
import time
import os
from datetime import datetime
from pathlib import Path

LOG_FILE = Path(__file__).parent.parent / "data" / "application.log"

SERVICES = [
    ("Claims-Adjudication", "claims"),
    ("Utilization-Management", "um"),
    ("Pharmacy-Management", "pharmacy"),
    ("FHIR-Interoperability", "fhir"),
    ("Provider-Management", "provider"),
    ("Care-Management", "care"),
    ("Member-Services", "member"),
]

NORMAL_MESSAGES = [
    "request_completed",
    "authorization_completed",
    "claim_processed",
    "eligibility_verified",
    "formulary_check_completed",
    "prior_auth_approved",
    "member_lookup_success",
    "provider_verified",
    "fhir_resource_retrieved",
    "care_plan_updated",
    "batch_processed",
    "session_authenticated",
    "record_updated",
    "sync_completed",
]

ERROR_MESSAGES = [
    "validation_timeout",
    "connection_refused",
    "downstream_error",
    "timeout_exceeded",
    "auth_failure",
    "resource_not_found",
    "internal_error",
    "rate_limit_exceeded",
    "upstream_unavailable",
    "schema_validation_failed",
]

# Per-service state controlled by demo mode
_demo_mode = {"active": False, "service": None, "intensity": 0.0}


def set_demo_mode(active: bool, service: str = None, intensity: float = 0.8):
    _demo_mode["active"] = active
    _demo_mode["service"] = service
    _demo_mode["intensity"] = intensity


def generate_log_line(force_error: bool = False, service_override: str = None) -> str:
    service_name, service_tag = random.choice(SERVICES)
    if service_override:
        for s, t in SERVICES:
            if s == service_override:
                service_name, service_tag = s, t
                break

    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    if force_error:
        level = random.choice(["ERROR", "ERROR", "ERROR", "WARN"])
        message = random.choice(ERROR_MESSAGES)
        latency = random.randint(800, 3500)
    else:
        level = random.choices(
            ["INFO", "INFO", "INFO", "INFO", "WARN", "ERROR"],
            weights=[70, 70, 70, 70, 10, 3],
        )[0]
        if level == "ERROR":
            message = random.choice(ERROR_MESSAGES)
            latency = random.randint(600, 2000)
        elif level == "WARN":
            message = random.choice(ERROR_MESSAGES[:5])
            latency = random.randint(400, 800)
        else:
            message = random.choice(NORMAL_MESSAGES)
            latency = random.randint(50, 400)

    return f"{now} {level} {service_name} {message} latency={latency}ms service={service_tag}\n"


def run_generator():
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(LOG_FILE, "a") as f:
        while True:
            # Determine if demo mode affects this batch
            if _demo_mode["active"] and _demo_mode["service"]:
                intensity = _demo_mode["intensity"]
                force_error = random.random() < intensity
                line = generate_log_line(
                    force_error=force_error,
                    service_override=_demo_mode["service"],
                )
            else:
                line = generate_log_line()

            f.write(line)
            f.flush()

            # Generate 2-6 logs per second on average
            time.sleep(random.uniform(0.15, 0.45))


if __name__ == "__main__":
    run_generator()
