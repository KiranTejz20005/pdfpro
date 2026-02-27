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
          border: '4px solid #262626',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <div className="status-text" style={{ color: '#A1A1AA', fontSize: '0.95rem' }}>{message}</div>
    </div>
  )
}
