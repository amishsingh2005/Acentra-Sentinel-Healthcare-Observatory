// ──────────────────────────────────────────
// API Service Layer
// ──────────────────────────────────────────
const BASE = 'http://localhost:8000';

export const api = {
  async demo(action: string) {
    const res = await fetch(`${BASE}/api/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    return res.json();
  },

  async acknowledgeAlert(id: string) {
    const res = await fetch(`${BASE}/api/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
    return res.json();
  },

  async resolveAlert(id: string) {
    const res = await fetch(`${BASE}/api/alerts/${id}/resolve`, {
      method: 'POST',
    });
    return res.json();
  },

  async getMetrics() {
    const res = await fetch(`${BASE}/api/metrics`);
    return res.json();
  },

  async getAlerts() {
    const res = await fetch(`${BASE}/api/alerts`);
    return res.json();
  },
};
