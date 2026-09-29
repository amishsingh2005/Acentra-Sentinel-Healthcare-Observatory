<div align="center">
  
  # 🛡️ Acentra Sentinel Healthcare Observatory
  
  **Real-Time Operations Intelligence & Automated Incident Detection**
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

<br />

A production-grade, real-time log anomaly detection system built specifically for healthcare operations. Sentinel continuously ingests high-volume telemetry data, calculates rolling baseline behavior, and automatically triggers alerts the moment critical systems (like Claims Adjudication or Pharmacy Management) deviate from normal operational thresholds.

---

## ✨ Core Features

* **Real-Time Anomaly Detection**: Ingests live application logs and calculates rolling error rates using dynamic sliding windows.
* **Automated Baselining**: Employs statistical deviation engines (Mean + Standard Deviation thresholds) to learn what "normal" looks like and only alert on mathematical anomalies.
* **Severity & Alert Engine**: Automatically classifies incidents as `INFO`, `WARNING`, or `CRITICAL` based on deviation magnitude.
* **Live WebSocket Dashboard**: A premium, dark-themed enterprise dashboard that renders incoming logs, metrics, and alerts instantly with zero page reloads.
* **Interactive Incident Panel**: Detailed incident post-mortem views with automated timeline generation, root cause highlighted logs, and operational impact summaries.
* **Simulation Controls**: Built-in interactive demo controls to synthetically inject simulated failures (e.g., FHIR Failures, UM Delays) into the pipeline for testing.
* **AWS SNS Integration**: Ready to route critical alerts out to PagerDuty, Email, or SMS via Amazon Simple Notification Service.

---

## 🏗️ Architecture Pipeline

The system is built on a decoupled, stream-based architecture:

1. **SOURCE**: Synthetic generators simulate complex healthcare workloads (Claims, FHIR, Pharmacy) without using any real PHI.
2. **INGEST**: Python tail-readers continuously consume new log lines as they are appended to the system log.
3. **MEASURE**: Log parsers aggregate data into a rolling sliding window to calculate real-time error rates.
4. **BASELINE**: The system calculates the historical mean (μ) and standard deviation (σ).
5. **DETECT**: Current metric states are compared against the dynamic threshold (μ + kσ).
6. **ALERT**: If a deviation breaches the threshold, the Severity Engine escalates it to an Incident.
7. **RESPOND**: The WebSocket manager broadcasts the incident to the React frontend, and optionally publishes to AWS SNS.

---

## 💻 Tech Stack

**Frontend**
- React 18 (Vite)
- TypeScript
- Recharts (Performance-optimized live charting)
- Custom Enterprise Dark Theme CSS

**Backend**
- Python 3.10+
- FastAPI
- WebSockets (Async IO)
- Boto3 (AWS Integration)

---

## 📬 Dual-Path Alert Routing (SMTP & AWS SNS)

Sentinel features a resilient dual-path notification engine designed to guarantee delivery of critical incident alerts to on-call engineers.

1. **Primary Transport (AWS SNS)**: Critical alerts are instantly published to an Amazon Simple Notification Service (SNS) topic. This allows fan-out routing to SMS, PagerDuty, webhooks, or enterprise email queues.
2. **Fallback Transport (SMTP)**: If the AWS connection fails or credentials expire, the system automatically fails over to a direct SMTP mailer (e.g., Gmail SMTP), ensuring the alert is delivered via standard email.
3. **Smart Rate Limiting**: To prevent alert fatigue during a massive outage, the engine suppresses duplicate alert notifications for a given service within a sliding window.

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt

# Configure your environment variables for notifications
# Create a .env file with the following keys:
#
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
# AWS_REGION=your_aws_region
# AWS_SNS_TOPIC_ARN=arn:aws:sns:region:account:topic
# 
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your_email@gmail.com
# SMTP_PASSWORD=your_app_password
# ALERT_EMAIL_TO=oncall@yourdomain.com

# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser to view the dashboard.

---

## 🎮 Running a Simulation

1. Open the dashboard at `http://localhost:3000`.
2. Allow a few seconds for the system to establish a "Normal" baseline (Rolling Error Rate ~1.8%).
3. Scroll to the **Simulation Controls** panel.
4. Click **⚡ Simulate Claims Incident**.
5. Watch the architecture pipeline react in real-time:
   - Live logs will immediately show injected errors.
   - The error rate chart will spike.
   - An anomaly will be detected and classified as **CRITICAL**.
   - An alert will be pushed to the Alert Feed.
6. Click the new alert to open the **Incident Panel** and investigate the timeline!
7. Click **🔄 Reset Demo** to clear the pipeline.

---

## 🔒 Security & Privacy

> **Note:** This repository is intended for demonstration and hackathon purposes. The synthetic data generator explicitly produces mocked, anonymized logs. **NO real Protected Health Information (PHI) or Personally Identifiable Information (PII) is included, generated, or processed by this application.**
