interface ErrorBoxProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export default function ErrorBox({
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorBoxProps) {
  return (
    <div className="error-box">
      <h3>✗ Error</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry} style={{ marginTop: 12, textDecoration: 'underline' }}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}
