import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ToolLayout from '../components/tools/ToolLayout'
import { useToolConfig } from '../hooks/useToolConfig'
import { useRecentTools } from '../hooks/useRecentTools'
import { apiUrl } from '../config/api'
import type { ToolConfig } from '../config/toolsRegistry'
import type { ToolOptionsState } from '../components/tools/ToolLayout'
import { renderToolOptions } from '../tool-options/renderToolOptions'
import { validateBackendResponse } from '../utils/backendValidator'

function getDefaultOptions(toolId: string): ToolOptionsState {
  const defaults: Record<string, ToolOptionsState> = {
    'split-pdf': { mode: 'ranges', ranges: '1-' },
    'watermark-pdf': { text: 'Watermark', font_size: 48, color: '808080', opacity: 0.3, rotation: 0, position: 'center', tile: false },
    'rotate-pdf': { angle: 90, pages: '' },
    'add-page-numbers': { position: 'bottom-center', start_number: 1, fmt: 'number', font_size: 12, color: '000000', skip_first: false },
    'protect-pdf': { user_password: '', owner_password: '', allow_print: true, allow_copy: false, allow_edit: false },
    'unlock-pdf': { password: '' },
    'crop-pdf': { x1: 0, y1: 0, x2: 100, y2: 100, apply_to: 'all', unit: 'percent' },
    'organize-pdf': { new_order: '1,2,3' },
    'remove-pages': { pages: '1' },
    'sign-pdf': { page_number: 1, x: 50, y: 50, width: 0.25, height: 0.1, unit: 'percent' },
    'ocr-pdf': { languages: 'en', output_format: 'text' },
    'edit-pdf': { operations: '[]' },
    'scan-to-pdf': { enhance: true, page_size: 'a4', auto_rotate: true },
    'aadhar-cutter': { layout: 'standard', dpi: 300, cut_marks: true },
    'aadhar-advanced': { dpi: 300, layout: 'standard', cut_marks: true, border_style: 'none' },
    'pan-cutter': { layout: 'standard', dpi: 300, cut_marks: true },
    'voter-cutter': { layout: 'standard', dpi: 300, cut_marks: true, card_side: 'both' },
    'jan-aadhar-cutter': { layout: 'standard', dpi: 300, cut_marks: true },
    'ecard-cutter': { layout: 'standard', dpi: 300, cut_marks: true, card_type: 'auto' },
    'multi-id-cutter': { dpi: 300, cut_marks: true, cards_per_page: 4 },
  }
  return defaults[toolId] ?? {}
}

function buildFormData(config: ToolConfig, files: File[], options: ToolOptionsState): { url: string; body: FormData } {
  const body = new FormData()
  let url = config.apiEndpoint

  // Special cases: backend expects specific file keys (not "file"/"files")
  if (config.id === 'compare-pdf' && files.length >= 2) {
    body.append('file1', files[0])
    body.append('file2', files[1])
  } else if (config.id === 'sign-pdf' && files.length >= 2) {
    body.append('pdf_file', files[0])
    body.append('signature_file', files[1])
    Object.entries(options).forEach(([k, v]) => body.append(k, String(v)))
  } else {
    // Standard: single "file" or multiple "files"
    if (config.multiple) {
      files.forEach((f) => body.append('files', f))
    } else {
      if (files[0]) body.append('file', files[0])
    }

    if (config.id === 'compress-pdf') {
      const level = (options.level as string) || 'medium'
      url = `${config.apiEndpoint}?level=${level}`
    } else if (config.id === 'split-pdf') {
      body.append('mode', (options.mode as string) || 'ranges')
      if (options.ranges != null) body.append('ranges', String(options.ranges))
      if (options.every_n != null) body.append('every_n', String(options.every_n))
    } else {
      Object.entries(options).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          body.append(k, String(v))
        }
      })
      // Ensure watermark text is always sent
      if (config.id === 'watermark-pdf' && !body.has('text')) {
        body.append('text', 'Watermark')
      }
    }
  }

  return { url, body }
}

export default function ToolPage() {
  const { toolId, config } = useToolConfig()
  const navigate = useNavigate()
  const { addRecent } = useRecentTools()

  const [files, setFiles] = useState<File[]>([])
  const [options, setOptions] = useState<ToolOptionsState>(() => (config ? getDefaultOptions(config.id) : {}))
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage] = useState('Processing...')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [resultJson, setResultJson] = useState<unknown>(null)
  const [resultFilename, setResultFilename] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (config) addRecent(config.id)
  }, [config?.id, addRecent])

  useEffect(() => {
    if (config) setOptions(getDefaultOptions(config.id))
  }, [config?.id])

  // Live preview for watermark
  const generatePreview = useCallback(async () => {
    if (config?.id !== 'watermark-pdf' || files.length === 0) return
    
    try {
      const { url, body } = buildFormData(config, files, options)
      const res = await fetch(apiUrl(url), { method: config.method, body })
      const validated = await validateBackendResponse(res)
      
      if (validated.type === 'blob' && validated.blob) {
        setPreviewBlob(validated.blob)
      }
    } catch (e) {
      console.error('Preview failed:', e)
    }
  }, [config, files, options])

  useEffect(() => {
    if (config?.id === 'watermark-pdf' && files.length > 0) {
      const timer = setTimeout(() => {
        generatePreview()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [config?.id, files, options, generatePreview])

  const reset = useCallback(() => {
    setFiles([])
    setOptions({})
    setStatus('idle')
    setResultBlob(null)
    setPreviewBlob(null)
    setResultJson(null)
    setResultFilename('')
    setErrorMessage(null)
  }, [])

  const submit = useCallback(async () => {
    if (!config || files.length === 0) return

    setStatus('loading')
    setErrorMessage(null)
    setResultBlob(null)
    setResultJson(null)

    try {
      const { url, body } = buildFormData(config, files, options)
      const res = await fetch(apiUrl(url), { method: config.method, body })

      const validated = await validateBackendResponse(res)

      if (validated.type === 'json') {
        setResultJson(validated.data)
        setStatus('success')
        return
      }

      if (validated.type === 'blob' && validated.blob) {
        const ct = validated.contentType || ''
        const expectedPdf = config.category === 'pdf' || config.category === 'convert' || config.id.includes('pdf')
        const expectedImage = config.category === 'image' || config.id.includes('image')
        
        if (expectedPdf && !ct.includes('pdf') && !ct.includes('zip')) {
          throw new Error('Backend returned unexpected output format')
        }
        if (expectedImage && !ct.includes('image') && !ct.includes('zip') && !ct.includes('pdf')) {
          throw new Error('Backend returned unexpected output format')
        }

        const contentDisp = res.headers.get('content-disposition')
        const filename = contentDisp?.match(/filename="?([^";]+)"?/)?.[1] ?? config.outputFilename ?? 'download'
        setResultBlob(validated.blob)
        setResultFilename(filename)
        setStatus('success')
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Network error')
      setStatus('error')
    }
  }, [config, files, options])

  if (!toolId || !config) {
    return (
      <div className="container">
        <p>Tool not found.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          Go home
        </button>
      </div>
    )
  }

  const resultDownloadUrl = resultBlob ? URL.createObjectURL(resultBlob) : null

  const optionsSlot = renderToolOptions(config.id, options, setOptions)

  const resultSlot =
    config.responseType === 'json' && resultJson ? (
      <PdfReaderResult data={resultJson} />
    ) : null

  return (
    <ToolLayout
      config={config}
      files={files}
      onFiles={setFiles}
      onRemoveFile={(i) => setFiles((prev) => prev.filter((_, j) => j !== i))}
      optionsSlot={optionsSlot}
      onSubmit={submit}
      status={status}
      statusMessage={statusMessage}
      resultDownloadUrl={resultDownloadUrl}
      resultFilename={resultFilename}
      onReset={reset}
      errorMessage={errorMessage}
      resultSlot={resultSlot}
      resultBlob={resultBlob}
      previewBlob={config?.id === 'watermark-pdf' && status === 'idle' ? previewBlob : undefined}
    />
  )
}

function PdfReaderResult({ data }: { data: unknown }) {
  const d = data as { page_count?: number; thumbnails?: Array<{ page: number; thumbnail_base64?: string }> }
  const count = d?.page_count ?? 0
  const thumbnails = d?.thumbnails ?? []

  return (
    <div style={{ textAlign: 'left', marginTop: 16 }}>
      <p style={{ marginBottom: 12 }}>Pages: {count}</p>
      {thumbnails.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {thumbnails.map((t) => (
            <img
              key={t.page}
              src={`data:image/png;base64,${t.thumbnail_base64 ?? ''}`}
              alt={`Page ${t.page}`}
              style={{ width: 120, height: 'auto', border: '1px solid var(--color-border)', borderRadius: 4 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
