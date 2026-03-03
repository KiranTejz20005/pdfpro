import type { ToolConfig } from '../../config/toolsRegistry'
import { Button, UploadZone, FileList, StatusArea, ResultBox, ErrorBox } from '../ui'

export type ToolOptionsState = Record<string, string | number | boolean>

interface ToolLayoutProps {
  config: ToolConfig
  files: File[]
  onFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
  optionsSlot?: React.ReactNode
  onSubmit: () => void
  status: 'idle' | 'loading' | 'success' | 'error'
  statusMessage?: string
  resultDownloadUrl?: string | null
  resultFilename?: string
  resultTitle?: string
  onReset: () => void
  errorMessage?: string | null
  resultSlot?: React.ReactNode
  resultBlob?: Blob | null
  previewBlob?: Blob | null
}

function formatsText(accept: string, _multiple: boolean): string {
  if (accept === '.pdf') return 'PDF files'
  if (accept === 'image/*') return 'Image files (JPG, PNG, etc.)'
  if (accept.includes(',')) return accept.replace(/\./g, '').toUpperCase()
  return accept
}

export default function ToolLayout({
  config,
  files,
  onFiles,
  onRemoveFile,
  optionsSlot,
  onSubmit,
  status,
  statusMessage = 'Processing...',
  resultDownloadUrl,
  resultFilename,
  resultTitle = 'Success!',
  onReset,
  errorMessage,
  resultSlot,
  resultBlob,
  previewBlob,
}: ToolLayoutProps) {
  const canSubmit = files.length > 0 && status !== 'loading'
  const formats = formatsText(config.accept, config.multiple)

  const getPreviewType = (): 'pdf' | 'image' | 'none' => {
    if (!resultBlob && !previewBlob) return 'none'
    if (config.category === 'pdf' || config.category === 'convert' || config.id.includes('pdf')) return 'pdf'
    if (config.category === 'image' && !resultFilename?.endsWith('.zip')) return 'image'
    return 'none'
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 1400, margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: 10, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{config.title}</h1>
          <p className="card-description" style={{ marginBottom: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {config.description}
          </p>
        </div>

        <UploadZone
          accept={config.accept}
          multiple={config.multiple}
          onFiles={onFiles}
          formatsText={formats}
        />

        {files.length > 0 && (
          <>
            <FileList files={files} onRemove={onRemoveFile} />

            {optionsSlot && <div style={{ marginTop: 20 }}>{optionsSlot}</div>}

            <Button
              variant="primary"
              block
              disabled={!canSubmit}
              onClick={onSubmit}
              style={{ 
                marginTop: 24,
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                boxShadow: canSubmit ? '0 0 20px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {config.primaryActionLabel}
            </Button>
          </>
        )}

        <StatusArea show={status === 'loading'} message={statusMessage} />

        {status === 'idle' && previewBlob && (
          <div style={{ marginTop: 24, border: '2px solid var(--accent)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: 12, background: 'var(--accent)', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600 }}>
              Live Preview
            </div>
            <iframe
              src={URL.createObjectURL(previewBlob)}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title="Live Preview"
            />
          </div>
        )}

        {status === 'success' && (resultSlot || resultDownloadUrl) && (
          <ResultBox
            title={resultTitle}
            downloadUrl={resultSlot ? undefined : resultDownloadUrl ?? undefined}
            downloadFilename={resultFilename}
            onReset={onReset}
            resetLabel="Process another"
            previewBlob={resultBlob ?? undefined}
            previewType={getPreviewType()}
          >
            {resultSlot}
          </ResultBox>
        )}

        {status === 'error' && errorMessage && (
          <ErrorBox message={errorMessage} onRetry={onReset} retryLabel="Try again" />
        )}
      </div>
    </div>
  )
}
