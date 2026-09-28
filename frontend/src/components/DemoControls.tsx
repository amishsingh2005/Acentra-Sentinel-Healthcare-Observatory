import { useState } from 'react';
import { api } from '../services/api';

export function DemoControls() {
  const [loading, setLoading] = useState(false);
  const [activeSim, setActiveSim] = useState<string | null>(null);

  async function handleSimulate(type: string) {
    setLoading(true);
    await api.demo(type);
    setActiveSim(type);
    setLoading(false);
  }

  async function handleReset() {
    setLoading(true);
    await api.demo('reset');
    setActiveSim(null);
    setLoading(false);
  }

  const getBtnClass = (type: string) => {
    return activeSim === type ? "btn btn-primary" : "btn btn-secondary";
  };

  return (
    <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 16, marginRight: 8, opacity: 0.8 }}>⚙️</span> SIMULATION CONTROLS
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Inject synthetic incidents into the log stream to test operational resilience and pipeline failovers
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 12, fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="status-dot healthy"></span> Engine Ready
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          <span className="text-muted">Target: Synthetic-Kube-Cluster</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={getBtnClass('simulate_claims')} disabled={loading} onClick={() => handleSimulate('simulate_claims')}>
          <span style={{ opacity: 0.8, marginRight: 6 }}>⚡</span> Simulate Claims Incident
        </button>
        <button className={getBtnClass('simulate_um')} disabled={loading} onClick={() => handleSimulate('simulate_um')}>
          <span style={{ opacity: 0.8, marginRight: 6 }}>⏱️</span> Simulate UM Delay
        </button>
        <button className={getBtnClass('simulate_fhir')} disabled={loading} onClick={() => handleSimulate('simulate_fhir')}>
          <span style={{ opacity: 0.8, marginRight: 6 }}>🔌</span> Simulate FHIR Failure
        </button>
        <button className={getBtnClass('simulate_pharmacy')} disabled={loading} onClick={() => handleSimulate('simulate_pharmacy')}>
          <span style={{ opacity: 0.8, marginRight: 6 }}>💊</span> Simulate Pharmacy Spike
        </button>
        
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-secondary" disabled={loading} onClick={handleReset}>
            <span style={{ opacity: 0.8, marginRight: 6 }}>🔄</span> Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
}
