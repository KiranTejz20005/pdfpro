interface StatusAreaProps {
  message?: string
  show?: boolean
}

export default function StatusArea({ message = 'Processing...', show = true }: StatusAreaProps) {
  if (!show) return null

  return (
    <div className="status-area">
      <div className="spinner" aria-hidden />
      <div className="status-text">{message}</div>
    </div>
  )
}
