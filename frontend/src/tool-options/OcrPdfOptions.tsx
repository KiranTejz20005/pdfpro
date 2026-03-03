import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface OcrPdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

export default function OcrPdfOptions({ options, setOptions }: OcrPdfOptionsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
          Output Format
        </label>
        <select
          value={(options.output_format as string) || 'text'}
          onChange={(e) => setOptions((prev) => ({ ...prev, output_format: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: 'var(--card)',
          }}
        >
          <option value="text">Text File (.txt)</option>
          <option value="searchable_pdf">Searchable PDF</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
          Languages
        </label>
        <input
          type="text"
          value={(options.languages as string) ?? 'en'}
          onChange={(e) => setOptions((prev) => ({ ...prev, languages: e.target.value }))}
          placeholder="en"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: 'var(--text)',
            background: 'var(--card)',
          }}
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Supported: en, hi, te, ta, kn, ml, bn (comma-separated for multiple)
        </div>
      </div>
    </div>
  )
}
