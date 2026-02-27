interface ResultBoxProps {
  title?: string
  downloadUrl?: string
  downloadFilename?: string
  onReset?: () => void
  resetLabel?: string
  children?: React.ReactNode
}

export default function ResultBox({
  title = 'Success!',
  downloadUrl,
  downloadFilename = 'download',
  onReset,
  resetLabel = 'Try again',
  children,
}: ResultBoxProps) {
  return (
    <div className="result-box" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '0.75rem', padding: 24, marginTop: 24 }}>
      <div style={{ fontSize: '3rem', marginBottom: 12, textAlign: 'center' }}>✓</div>
      <h3 style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>{title}</h3>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={downloadFilename}
          className="btn btn-success"
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            marginBottom: 16,
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: 500,
            borderRadius: '0.5rem',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>⬇</span>
          Download
        </a>
      )}
      {children}
      {onReset && (
        <button 
          type="button" 
          className="btn btn-ghost" 
          onClick={onReset} 
          style={{ 
            textDecoration: 'underline', 
            marginTop: 12,
            color: '#2563EB',
            fontSize: '0.875rem',
            width: '100%',
          }}
        >
          {resetLabel}
        </button>
      )}
    </div>
  )
}
