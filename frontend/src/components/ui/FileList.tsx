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
    <div className="file-list-container">
      <div className="file-list-count">
        {files.length} file{files.length !== 1 ? 's' : ''} selected
      </div>
      <ul className="file-list">
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`} className="file-item">
            <div>
              <span className="file-item-name">{file.name}</span>
              <span className="file-item-size">{formatSize(file.size)}</span>
            </div>
            {onRemove && (
              <button
                type="button"
                className="file-item-remove"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${file.name}`}
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
