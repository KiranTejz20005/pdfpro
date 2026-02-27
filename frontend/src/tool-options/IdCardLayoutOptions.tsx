import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface IdCardLayoutOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

const LAYOUTS = [
  { value: 'standard', label: 'Standard (4 per page)' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'individual', label: 'Individual' },
] as const

export default function IdCardLayoutOptions({ options, setOptions }: IdCardLayoutOptionsProps) {
  const layout = (options.layout as string) || 'standard'
  const dpi = Number(options.dpi) || 300

  return (
    <div className="options-section" style={{ background: '#0A0A0A', padding: 24, borderRadius: '0.75rem', border: '1px solid #262626', marginTop: 20 }}>
      <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>Print Layout</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {LAYOUTS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setOptions((o) => ({ ...o, layout: l.value }))}
            style={{
              padding: '14px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.5rem',
              border: layout === l.value ? '2px solid #2563EB' : '2px solid #262626',
              background: layout === l.value ? 'rgba(37, 99, 235, 0.1)' : '#121212',
              color: layout === l.value ? '#2563EB' : '#A1A1AA',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (layout !== l.value) {
                e.currentTarget.style.borderColor = '#2563EB'
                e.currentTarget.style.color = '#ffffff'
              }
            }}
            onMouseLeave={(e) => {
              if (layout !== l.value) {
                e.currentTarget.style.borderColor = '#262626'
                e.currentTarget.style.color = '#A1A1AA'
              }
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>DPI Quality</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[150, 200, 300].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setOptions((o) => ({ ...o, dpi: d }))}
            style={{
              padding: '14px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.5rem',
              border: dpi === d ? '2px solid #2563EB' : '2px solid #262626',
              background: dpi === d ? 'rgba(37, 99, 235, 0.1)' : '#121212',
              color: dpi === d ? '#2563EB' : '#A1A1AA',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (dpi !== d) {
                e.currentTarget.style.borderColor = '#2563EB'
                e.currentTarget.style.color = '#ffffff'
              }
            }}
            onMouseLeave={(e) => {
              if (dpi !== d) {
                e.currentTarget.style.borderColor = '#262626'
                e.currentTarget.style.color = '#A1A1AA'
              }
            }}
          >
            {d} DPI
          </button>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', cursor: 'pointer', color: '#A1A1AA' }}>
        <input
          type="checkbox"
          checked={options.cut_marks !== false}
          onChange={(e) => setOptions((o) => ({ ...o, cut_marks: e.target.checked }))}
          style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563EB' }}
        />
        Add cut marks for easy trimming
      </label>
    </div>
  )
}
