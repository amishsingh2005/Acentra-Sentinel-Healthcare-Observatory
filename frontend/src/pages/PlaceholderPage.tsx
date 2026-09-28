export function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
      <div style={{ 
        width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(57, 211, 83, 0.05)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)',
        border: '1px solid rgba(57, 211, 83, 0.2)', boxShadow: '0 0 30px rgba(57, 211, 83, 0.1)'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="15"></line>
          <line x1="15" y1="9" x2="9" y2="15"></line>
        </svg>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
}
