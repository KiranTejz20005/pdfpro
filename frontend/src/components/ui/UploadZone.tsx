import { useRef, useState } from 'react'

interface UploadZoneProps {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  formatsText?: string
}

export default function UploadZone({
  accept = '.pdf',
  multiple = false,
  onFiles,
  formatsText = 'PDF files',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    onFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    onFiles(multiple ? files : files.slice(0, 1))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  return (
    <>
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label="Upload files"
        style={{ 
          minHeight: 220,
          border: `2px dashed ${dragOver ? '#2563EB' : '#262626'}`,
          background: dragOver ? 'rgba(37, 99, 235, 0.05)' : '#121212',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.9 }}>☁️</div>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>Upload Your File</div>
        <span className="upload-zone-text" style={{ fontSize: '0.875rem', fontWeight: 400, color: '#A1A1AA', marginBottom: 16, display: 'block' }}>Drag and drop or click to browse</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          style={{
            padding: '10px 24px',
            background: '#2563EB',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: dragOver ? '0 0 20px rgba(37, 99, 235, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d4ed8'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2563EB'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          Select File
        </button>
        <span className="upload-zone-formats" style={{ marginTop: 12, display: 'block', fontSize: '0.75rem' }}>{formatsText}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-hidden
      />
    </>
  )
}
