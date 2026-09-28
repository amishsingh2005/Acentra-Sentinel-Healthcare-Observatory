# Acentra Sentinel: Technical Documentation

## 1. Executive Summary
**Acentra Sentinel** is a real-time healthcare operations intelligence platform. It acts as an early-warning system that continuously monitors high-volume telemetry data (like Claims Adjudication or Pharmacy Management logs) to detect operational anomalies before they escalate into systemic outages.

By utilizing dynamic baselining and statistical deviation engines, Sentinel filters out the "noise" of standard operations and only alerts on mathematical anomalies, drastically reducing alert fatigue for DevOps and SRE teams.

---

## 2. Core Features

### 🔍 Real-Time Anomaly Detection
Sentinel continuously consumes application logs in real-time. Instead of relying on static thresholds (e.g., "Alert if errors > 100"), it dynamically learns what normal behavior looks like at any given time.

### 📈 Statistical Baselining Engine
The system uses a mathematical model to establish a "Baseline". It calculates the Mean (μ) and Standard Deviation (σ) of the error rate over a historical period. If the current error rate breaches the dynamic threshold (typically μ + 3σ), it flags it as an anomaly.

### 🚦 Automated Severity Classification
When an anomaly is detected, the Severity Engine evaluates the magnitude of the deviation. It automatically categorizes the incident into `INFO`, `WARNING`, or `CRITICAL` states, ensuring operations teams prioritize the right issues.

### ⚡ Live WebSocket Dashboard
The frontend is a dark-themed, enterprise-grade React dashboard. It connects to the backend via WebSockets, allowing the UI to render new logs, update the Rolling Error Rate chart, and display incident alerts instantly without ever requiring a page refresh.

### 🔬 Incident Investigation Panel
When a critical alert is triggered, users can click into a dedicated Incident Panel. This acts as a post-mortem view that provides:
- The exact mathematical deviation (e.g., "Error rate spiked by 722%").
- An automated timeline mapping the origin and escalation of the incident.
- The raw, isolated logs that contributed to the failure.

### 🛠️ Interactive Simulation Engine
To demonstrate resilience, Sentinel includes built-in controls to synthetically inject failures into the pipeline (e.g., *Simulate FHIR Failure* or *UM Delay*). This instantly triggers the entire detection chain, proving the system's responsiveness.

---

## 3. System Architecture & Data Pipeline

Sentinel is built on a decoupled, stream-based architecture. The data flows sequentially through the following pipeline:

1. **SOURCE (Synthetic Generation)**: Background tasks simulate complex healthcare workloads, generating thousands of log lines representing real-world systems (No real PHI is used).
2. **INGEST (Log Monitor)**: A Python tail-reader continuously watches the log file. As new lines are appended, they are instantly streamed into memory.
3. **MEASURE (Sliding Window)**: Log parsers aggregate the data into a "Sliding Window" (e.g., the last 1,000 events) to calculate a live, rolling error rate.
4. **BASELINE (Statistics)**: The system calculates the historical Mean (μ) and Standard Deviation (σ) from older sliding windows.
5. **DETECT (Anomaly Engine)**: The current error rate is continuously compared against the dynamic threshold (`Threshold = μ + kσ`).
6. **ALERT (Severity Engine)**: Breaches are escalated into structured Incident objects.
7. **RESPOND (WebSockets & SNS)**: Incidents are broadcasted to the React dashboard via WebSockets and optionally pushed out to AWS Simple Notification Service (SNS) to page on-call engineers via SMS or Email.

---

## 4. Algorithmic Deep Dive: The Baseline Engine

Sentinel avoids hardcoded limits because traffic fluctuates (e.g., daytime vs. nighttime loads).

**How it calculates anomalies:**
* **Mean (μ)**: The average error rate over the baseline period (e.g., 1.8%).
* **Standard Deviation (σ)**: The typical variance in that error rate (e.g., 0.77%).
* **The Threshold**: Calculated as `μ + (k * σ)` where `k` is a sensitivity multiplier (usually 3).
* **Example**: `1.8 + (3 * 0.77) = 4.11%`. 
If the live error rate spikes to `14.8%`, the equation `14.8 > 4.11` evaluates to True, and an anomaly is instantly triggered.

---

## 5. Technology Stack

### Frontend
- **React (Vite)**: Chosen for its blazing-fast build times and component-based UI rendering.
- **TypeScript**: Ensures type safety across the complex WebSocket payloads and metric interfaces.
- **Recharts**: A highly performant React charting library used to render the live Rolling Error Rate line chart without freezing the DOM.
- **Custom CSS**: Built entirely with custom CSS variables (`index.css`) to enforce the strict, premium "Acentra Dark" enterprise theme without the bloat of heavy component libraries.

### Backend
- **Python 3.10+**: The industry standard for data processing and mathematical baselining.
- **FastAPI**: A modern, high-performance web framework for Python. Chosen specifically for its native asynchronous capabilities (`asyncio`) and first-class support for WebSockets.
- **Boto3 (AWS SDK)**: Integrated to handle outbound notifications to Amazon SNS for critical alerting.
