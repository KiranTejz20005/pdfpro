interface StatusAreaProps {
  message?: string
  show?: boolean
}

export default function StatusArea({ message = 'Processing...', show = true }: StatusAreaProps) {
  if (!show) return null

  return (
    <div className="status-area" style={{ marginTop: 24, textAlign: 'center' }}>
      <div 
        className="spinner" 
        aria-hidden 
        style={{
          width: 48,
          height: 48,
          border: '4px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <div className="status-text" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 8, fontWeight: 500 }}>Your request is being processed.</div>
      <div className="status-text" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kindly wait. This may take a few moments.</div>
    </div>
  )
}
