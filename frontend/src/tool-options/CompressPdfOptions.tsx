import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface CompressPdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

const LEVELS = [
  { value: 'low', label: 'Low', desc: 'Faster, larger file' },
  { value: 'medium', label: 'Medium', desc: 'Balanced' },
  { value: 'high', label: 'High', desc: 'Smallest file' },
] as const

export default function CompressPdfOptions({ options, setOptions }: CompressPdfOptionsProps) {
  const level = (options.level as string) || 'medium'

  return (
    <div className="options-section" style={{ background: '#0A0A0A', padding: 24, borderRadius: '0.75rem', border: '1px solid #262626', marginTop: 20 }}>
      <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>Compression Level</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setOptions((o) => ({ ...o, level: l.value }))}
            style={{
              padding: '16px 14px',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.5rem',
              border: level === l.value ? '2px solid #2563EB' : '2px solid #262626',
              background: level === l.value ? 'rgba(37, 99, 235, 0.1)' : '#121212',
              color: level === l.value ? '#2563EB' : '#A1A1AA',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={(e) => {
              if (level !== l.value) {
                e.currentTarget.style.borderColor = '#2563EB'
                e.currentTarget.style.color = '#ffffff'
              }
            }}
            onMouseLeave={(e) => {
              if (level !== l.value) {
                e.currentTarget.style.borderColor = '#262626'
                e.currentTarget.style.color = '#A1A1AA'
              }
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{l.label}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{l.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
