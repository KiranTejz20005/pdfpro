import React from 'react'

interface ResultBoxProps {
  title?: string
  downloadUrl?: string
  downloadFilename?: string
  onReset?: () => void
  resetLabel?: string
  children?: React.ReactNode
  previewBlob?: Blob
  previewType?: 'pdf' | 'image' | 'none'
}

export default function ResultBox({
  title = 'Success!',
  downloadUrl,
  downloadFilename = 'download',
  onReset,
  resetLabel = 'Try again',
  children,
  previewBlob,
  previewType = 'none',
}: ResultBoxProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (previewBlob) {
      const url = URL.createObjectURL(previewBlob)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [previewBlob])

  return (
    <div className="result-box" style={{ background: '#E8F5E9', border: '2px solid #2E7D32', borderRadius: '6px', padding: 24, marginTop: 24 }}>
      <div style={{ fontSize: '3rem', marginBottom: 12, textAlign: 'center' }}>✓</div>
      <h3 style={{ color: '#2E7D32', fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>Your document is ready for download.</h3>
      
      {/* Preview Section */}
      {previewUrl && previewType === 'pdf' && (
        <div style={{ marginBottom: 16, border: '1px solid #E0E0E0', borderRadius: '6px', overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ padding: 12, background: '#F5F7FA', borderBottom: '1px solid #E0E0E0', fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>
            📄 Preview
          </div>
          <iframe
            src={previewUrl}
            style={{ width: '100%', height: '500px', border: 'none' }}
            title="PDF Preview"
          />
        </div>
      )}

      {previewUrl && previewType === 'image' && (
        <div style={{ marginBottom: 16, border: '1px solid #E0E0E0', borderRadius: '6px', overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ padding: 12, background: '#F5F7FA', borderBottom: '1px solid #E0E0E0', fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>
            🖼️ Preview
          </div>
          <div style={{ padding: 16, textAlign: 'center' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      )}

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
            borderRadius: '6px',
            background: '#2E7D32',
            color: '#FFFFFF',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>⬇</span>
          Download Processed File
        </a>
      )}
      {children}
      <div style={{ marginTop: 16, padding: 12, background: '#FFF3E0', border: '1px solid #FF6F00', borderRadius: '6px', fontSize: '0.85rem', color: '#1A1A1A', textAlign: 'left' }}>
        <strong>⚠️ Note:</strong> Files will be automatically deleted after 10 minutes for security reasons.
      </div>
      {onReset && (
        <button 
          type="button" 
          className="btn btn-ghost" 
          onClick={onReset} 
          style={{ 
            textDecoration: 'underline', 
            marginTop: 12,
            color: '#1565C0',
            fontSize: '0.875rem',
            width: '100%',
            background: 'transparent',
          }}
        >
          {resetLabel}
        </button>
      )}
    </div>
  )
}
