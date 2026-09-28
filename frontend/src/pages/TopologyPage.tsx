import type { ServiceItem } from '../types';

export function TopologyPage({ services }: { services: ServiceItem[] }) {
  const Box = ({ title, subtitle, children, style = {} }: any) => (
    <div style={{
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      padding: '12px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '100%',
      ...style
    }}>
      {title && <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontWeight: 700 }}>{title}</div>}
      {subtitle && <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{subtitle}</div>}
      {children}
    </div>
  );

  const InnerCard = ({ children, style = {} }: any) => (
    <div style={{
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '4px',
      padding: '6px 8px',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '6px',
      backgroundColor: 'rgba(0,0,0,0.4)',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ...style
    }}>
      {children}
    </div>
  );

  const RightArrow = () => (
    <svg style={{ position: 'absolute', top: '50%', right: -16, width: 16, height: 16, transform: 'translateY(-50%)', overflow: 'visible', zIndex: 10 }}>
      <path d="M 0 8 L 16 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
      <path d="M 12 4 L 16 8 L 12 12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const DownArrow = ({ gap = 16 }: { gap?: number }) => (
    <svg style={{ position: 'absolute', bottom: -gap, left: '50%', width: 16, height: gap, transform: 'translateX(-50%)', overflow: 'visible', zIndex: 10 }}>
      <path d={`M 8 0 L 8 ${gap}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
      <path d={`M 4 ${gap - 4} L 8 ${gap} L 12 ${gap - 4}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '100%', overflow: 'hidden' }}>
      <div className="hero" style={{ marginBottom: 'var(--space-4)' }}>
        <h1 className="hero-title" style={{ fontSize: '24px' }}>SYSTEM ARCHITECTURE</h1>
        <p className="hero-subtitle" style={{ fontSize: '13px' }}>Real-Time Healthcare Operations Intelligence — Data Pipeline & Detection Engine</p>
      </div>

      <div style={{ 
        backgroundColor: '#0a0a0a', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '24px',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ width: '100%', position: 'relative' }}>
          
          {/* TOP ROW: INGEST -> MEASURE */}
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>INGEST → MEASURE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '16px', marginBottom: '32px' }}>
            
            {/* 01 SOURCE */}
            <div style={{ position: 'relative' }}>
              <Box title="01 - SOURCE" subtitle="Synthetic Events">
                <InnerCard>Claims Adjudication</InnerCard>
                <InnerCard>Utilization Mgmt</InnerCard>
                <InnerCard>Pharmacy Mgmt</InnerCard>
                <InnerCard>FHIR Interop</InnerCard>
                <InnerCard>Provider Care</InnerCard>
                <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '10px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></div>
                  No PHI Data
                </div>
              </Box>
              <RightArrow />
            </div>

            {/* 02 LOG */}
            <div style={{ position: 'relative' }}>
              <Box title="02 - LOG" subtitle="application.log">
                <div style={{ 
                  fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.7)', 
                  backgroundColor: '#000', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
                  lineHeight: 1.4, marginBottom: '12px'
                }}>
                  INFO Claims req<br/>
                  INFO Pharmacy auth<br/>
                  <span style={{ color: 'var(--status-critical)' }}>ERR Claims timeout</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: 'auto' }}>Growing Log</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>append-only at bottom</div>
              </Box>
              <RightArrow />
            </div>

            {/* 03 INGEST */}
            <div style={{ position: 'relative' }}>
              <Box title="03 - INGEST" subtitle="Log Monitor">
                <InnerCard>• Tail Reader</InnerCard>
                <InnerCard>• Log Parser</InnerCard>
                <InnerCard>• Normalizer</InnerCard>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: 'auto', paddingTop: '8px', lineHeight: 1.3 }}>
                  Reads appended lines<br/>Maintains offset
                </div>
              </Box>
              <RightArrow />
            </div>

            {/* 04 METRIC */}
            <div style={{ position: 'relative' }}>
              <Box title="04 - METRIC" subtitle="Sliding Window">
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Latest 1,000 Events</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>148 errors</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Rolling Error Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>14.8%</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: 'auto', lineHeight: 1.2 }}>errors / total × 100<br/>newest in, oldest out</div>
              </Box>
            </div>

            {/* WEBSOCKET */}
            <div style={{ position: 'relative' }}>
              <Box title="WEBSOCKET" style={{ borderStyle: 'dashed' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  metric_update<br/>anomaly_detect<br/>incident_created<br/>service_status
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>server → client</div>
              </Box>
              <svg style={{ position: 'absolute', bottom: -32, left: '50%', width: 16, height: 32, transform: 'translateX(-50%)', overflow: 'visible', zIndex: 10 }}>
                <path d={`M 8 0 L 8 32`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                <path d={`M 4 28 L 8 32 L 12 28`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

          </div>

          {/* BOTTOM ROW: DETECT -> RESPOND */}
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>DETECT → RESPOND</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '16px', alignItems: 'start' }}>
            
            {/* 05 BASELINE */}
            <div style={{ position: 'relative', height: '100%' }}>
              <Box title="05 - BASELINE" subtitle="Baseline Engine">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}><span>Mean</span><span>μ</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}><span>Std Dev</span><span>σ</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '12px' }}><span>Threshold</span><span>μ + kσ</span></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                  <InnerCard style={{ padding: '6px' }}><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Baseline</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>1.8%</div></InnerCard>
                  <InnerCard style={{ padding: '6px' }}><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Threshold</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>4.1%</div></InnerCard>
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', marginTop: 'auto' }}>μ = 1.8% · σ = 0.77%</div>
              </Box>
              <RightArrow />
            </div>

            {/* 06 DETECT */}
            <div style={{ position: 'relative', height: '100%' }}>
              <Box title="06 - DETECT" subtitle="Anomaly Detect">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', marginBottom: '6px', fontWeight: 600 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Current</span><span style={{ color: '#fff' }}>14.8%</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Base</span><span style={{ color: '#fff' }}>1.8%</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Dev</span><span style={{ color: 'var(--status-critical)' }}>+722%</span>
                </div>
                <div style={{ margin: '12px 0' }}>
                  <InnerCard><div style={{ textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>(cur-base)/base × 100</div></InnerCard>
                </div>
                <div style={{ border: '1px solid rgba(229,72,77,0.4)', backgroundColor: 'rgba(229,72,77,0.1)', borderRadius: '4px', padding: '8px 4px', fontSize: '10px', fontWeight: 600, color: '#fff', textAlign: 'center', marginTop: 'auto', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--status-critical)' }}>•</span> ANOMALY 14.8% {`>`} 4.1
                </div>
              </Box>
              <RightArrow />
            </div>

            {/* 07 ALERT */}
            <div style={{ position: 'relative', height: '100%' }}>
              <Box title="07 - ALERT" subtitle="Severity">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px', fontWeight: 700, marginBottom: '16px' }}>
                  <div style={{ color: 'var(--status-healthy)' }}>• NORMAL</div>
                  <div style={{ color: 'var(--status-info)' }}>• INFO</div>
                  <div style={{ color: 'var(--status-warning)' }}>• WARNING</div>
                  <div style={{ color: 'var(--status-critical)' }}>• CRITICAL</div>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: 'auto' }}>Threshold-based</div>
                <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '8px', fontSize: '10px', fontWeight: 600, color: '#fff', textAlign: 'center', marginTop: '12px' }}>
                  ▶ Incident
                </div>
              </Box>
              <RightArrow />
            </div>

            {/* INCIDENT & NOTIFY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div style={{ position: 'relative' }}>
                <Box title="INCIDENT" subtitle="Incident">
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>→ Dashboard / SNS</div>
                </Box>
                <RightArrow />
                <DownArrow gap={16} />
              </div>
              
              <Box title="08B - NOTIFY" subtitle="AWS SNS">
                <InnerCard>Email</InnerCard>
                <InnerCard>Webhook</InnerCard>
                <InnerCard>SMS</InnerCard>
                <div style={{ fontSize: '9px', color: 'var(--status-critical)', marginTop: 'auto', paddingTop: '8px', fontWeight: 600 }}>• Published on critical</div>
              </Box>
            </div>

            {/* DASHBOARD & OPS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div style={{ position: 'relative' }}>
                <Box title="08A - STREAM" subtitle="Dashboard">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: 'auto' }}>
                    <InnerCard style={{ padding: '4px', fontSize: '9px' }}><span style={{ opacity: 0.5 }}>□</span> Error Rate</InnerCard>
                    <InnerCard style={{ padding: '4px', fontSize: '9px' }}><span style={{ opacity: 0.5 }}>□</span> Details</InnerCard>
                    <InnerCard style={{ padding: '4px', fontSize: '9px' }}><span style={{ opacity: 0.5 }}>□</span> Live Alerts</InnerCard>
                    <InnerCard style={{ padding: '4px', fontSize: '9px' }}><span style={{ opacity: 0.5 }}>□</span> Live Logs</InnerCard>
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '8px' }}>• No refresh</div>
                </Box>
                <DownArrow gap={16} />
              </div>
              
              <Box title="OUTPUT" subtitle="OPERATIONS">
                <InnerCard><span style={{ color: 'var(--status-info)' }}>•</span> Observe</InnerCard>
                <InnerCard><span style={{ color: 'var(--text-primary)' }}>•</span> Investigate</InnerCard>
                <InnerCard><span style={{ color: 'var(--status-warning)' }}>•</span> Respond</InnerCard>
              </Box>
            </div>

          </div>

          {/* BOTTOM DETECT CHAIN */}
          <div style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
             <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>DETECTION CHAIN</div>
             <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 500, flexWrap: 'wrap' }}>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Log</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Metric</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Baseline</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Deviation</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Anomaly</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Severity</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px' }}>Alert</InnerCard> <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>→</span>
               <InnerCard style={{ marginBottom: 0, padding: '4px 8px', color: 'var(--status-critical)' }}>Response</InnerCard>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
