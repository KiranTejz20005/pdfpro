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
    <div className="result-box">
      <h3>✓ {title}</h3>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={downloadFilename}
          className="btn btn-success"
          style={{ display: 'inline-block', marginBottom: 16 }}
        >
          Download
        </a>
      )}
      {children}
      {onReset && (
        <button type="button" className="btn btn-ghost" onClick={onReset} style={{ textDecoration: 'underline', marginTop: 12 }}>
          {resetLabel}
        </button>
      )}
    </div>
  )
}
