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
    <div className="options-section">
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Compression level</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            className={`chip ${level === l.value ? 'selected' : ''}`}
            onClick={() => setOptions((o) => ({ ...o, level: l.value }))}
          >
            <div>{l.label}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{l.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
