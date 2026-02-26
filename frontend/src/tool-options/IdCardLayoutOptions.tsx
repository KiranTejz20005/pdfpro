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

  return (
    <div className="options-section">
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Print layout</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {LAYOUTS.map((l) => (
          <button
            key={l.value}
            type="button"
            className={`chip ${layout === l.value ? 'selected' : ''}`}
            onClick={() => setOptions((o) => ({ ...o, layout: l.value }))}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={options.cut_marks !== false}
            onChange={(e) => setOptions((o) => ({ ...o, cut_marks: e.target.checked }))}
          />
          Cut marks
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          DPI:
          <select
            value={Number(options.dpi) || 300}
            onChange={(e) => setOptions((o) => ({ ...o, dpi: parseInt(e.target.value, 10) }))}
            style={{ padding: '4px 8px', marginLeft: 4 }}
          >
            <option value={150}>150</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
          </select>
        </label>
      </div>
    </div>
  )
}
