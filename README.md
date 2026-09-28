# Acentra Sentinel

**Real-Time Healthcare Operations Intelligence**

A production-grade log anomaly detection system built for the Acentra Health hackathon.

---

## Architecture

```
Synthetic Log Generator
        ↓
backend/data/application.log
        ↓
Python Log Monitor (tail-watches file)
        ↓
Log Parser → Sliding Window (100 events)
        ↓
Rolling Error Rate Calculator
        ↓
Baseline Engine (mean + 2σ threshold)
        ↓
Anomaly Detector
        ↓
Severity Engine (NORMAL/INFO/WARNING/CRITICAL)
        ↓
Alert Engine
        ↓
WebSocket (FastAPI /ws)
        ↓
React Dashboard (Recharts + live state)
        ↓
AWS SNS / Demo Notification
```

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt

# Copy env (optional — AWS SNS)
cp ../.env.example .env

# Run
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

See `.env.example`:

| Variable | Description |
|---|---|
| `AWS_SNS_TOPIC_ARN` | SNS topic for alerts (optional) |
| `AWS_DEFAULT_REGION` | AWS region (default: us-east-1) |
| `LOG_WINDOW_SIZE` | Sliding window size (default: 100) |
| `BASELINE_WARMUP` | Baseline warmup samples (default: 30) |

If AWS credentials are absent, the app runs in **Demo Mode** — all functionality works, notifications are logged only.

---

## Demo Flow

1. Open http://localhost:3000
2. Observe **● SYSTEM OPERATIONAL** and live logs
3. Watch the Rolling Error Rate chart build up baseline
4. Click **Simulate Claims Incident**
5. Logs begin showing ERROR entries from Claims-Adjudication
6. Rolling error rate spikes in the chart
7. Backend detects deviation from baseline
8. Severity engine assigns CRITICAL
9. WebSocket pushes alert to React
10. Live alert appears in the feed
11. Claims Adjudication changes to CRITICAL in Services table
12. Click the alert → Incident Panel opens
13. View: Current / Baseline / Threshold / Deviation
14. Review related logs and incident timeline
15. AWS SNS notification attempted (Demo Mode shown)
16. Acknowledge → Resolve

---

## Design

Strictly follows the **Vercel-inspired design language**:

- `#FAFAFA` canvas, `#FFFFFF` surfaces
- `#171717` primary text
- `#0072F5` interaction color
- Geist / Inter typography (400/500/600 only)
- 4px spacing system
- Shadow-as-border (no CSS borders)
- Status colors restricted to 6px indicator dots

---

## Services Monitored

- Claims Adjudication
- Utilization Management
- Pharmacy Management
- FHIR Interoperability
- Provider Management
- Care Management
- Member Services

---

> **Demo Environment · Synthetic Data · No PHI**
