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
  /** For PDF Reader: custom result content instead of download */
  resultSlot?: React.ReactNode
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
}: ToolLayoutProps) {
  const canSubmit = files.length > 0 && status !== 'loading'
  const formats = formatsText(config.accept, config.multiple)

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 720, margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
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

        {status === 'success' && (resultSlot || resultDownloadUrl) && (
          <ResultBox
            title={resultTitle}
            downloadUrl={resultSlot ? undefined : resultDownloadUrl ?? undefined}
            downloadFilename={resultFilename}
            onReset={onReset}
            resetLabel="Process another"
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
