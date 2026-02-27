interface FileListProps {
  files: File[]
  onRemove?: (index: number) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="file-list-container" style={{ marginTop: 20 }}>
      <div className="file-list-count" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12, color: '#2563EB' }}>
        {files.length} file{files.length !== 1 ? 's' : ''} selected
      </div>
      <ul className="file-list">
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`} className="file-item" style={{ background: '#121212', border: '1px solid #262626', borderRadius: '0.5rem' }}>
            <div>
              <span className="file-item-name" style={{ color: '#ffffff' }}>{file.name}</span>
              <span className="file-item-size" style={{ color: '#A1A1AA' }}>{formatSize(file.size)}</span>
            </div>
            {onRemove && (
              <button
                type="button"
                className="file-item-remove"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${file.name}`}
                style={{ background: '#ef4444', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '0.25rem' }}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
