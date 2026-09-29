import { useState } from 'react';
import { api } from '../services/api';

export function DemoControls() {
  const [loading, setLoading] = useState(false);
  const [activeSim, setActiveSim] = useState<string | null>(null);

  async function handleSimulate(type: string) {
    if (activeSim === type) {
      setLoading(true);
      await api.demo('stop');
      setActiveSim(null);
      setLoading(false);
      return;
    }
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

  const renderSimButton = (type: string, icon: string, defaultText: string, stopText: string) => {
    const isActive = activeSim === type;
    return (
      <button 
        className={isActive ? "btn btn-primary" : "btn btn-secondary"} 
        style={isActive ? { 
          background: 'linear-gradient(135deg, #E5484D 0%, #c92a2a 100%)', 
          borderColor: '#ff6b6b', 
          boxShadow: '0 4px 15px rgba(229, 72, 77, 0.3)',
          color: '#fff'
        } : {}}
        disabled={loading && !isActive} 
        onClick={() => handleSimulate(type)}
      >
        <span style={{ opacity: 0.8, marginRight: 6 }}>{isActive ? '🛑' : icon}</span> 
        {isActive ? stopText : defaultText}
      </button>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 16, marginRight: 8, opacity: 0.8 }}>🎛️</span> SIMULATION CONTROLS
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Inject synthetic incidents into the log stream to test operational resilience and pipeline failovers
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 12, fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="status-dot healthy"></span> Engine Ready
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        {renderSimButton('simulate_claims', '⚠️', 'Simulate Claims Incident', 'Stop Claims Incident')}
        {renderSimButton('simulate_um', '⏳', 'Simulate UM Delay', 'Stop UM Delay')}
        {renderSimButton('simulate_fhir', '💥', 'Simulate FHIR Failure', 'Stop FHIR Failure')}
        {renderSimButton('simulate_pharmacy', '📈', 'Simulate Pharmacy Spike', 'Stop Pharmacy Spike')}
        
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-secondary" disabled={loading} onClick={handleReset}>
            <span style={{ opacity: 0.8, marginRight: 6 }}>🔁</span> Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
}
