import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface SplitPdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

export default function SplitPdfOptions({ options, setOptions }: SplitPdfOptionsProps) {
  const mode = (options.mode as string) || 'ranges'
  const ranges = (options.ranges as string) || '1-'

  return (
    <div className="options-section">
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Split by</label>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={mode}
          onChange={(e) => setOptions((o) => ({ ...o, mode: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--color-border)' }}
        >
          <option value="ranges">Page ranges (e.g. 1-3, 5, 7-9)</option>
          <option value="every">Every N pages</option>
        </select>
        {mode === 'ranges' && (
          <input
            type="text"
            value={ranges}
            onChange={(e) => setOptions((o) => ({ ...o, ranges: e.target.value }))}
            placeholder="1-3, 5, 7-"
            style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--color-border)', minWidth: 180 }}
          />
        )}
        {mode === 'every' && (
          <input
            type="number"
            min={1}
            value={Number(options.every_n) || 1}
            onChange={(e) => setOptions((o) => ({ ...o, every_n: parseInt(e.target.value, 10) || 1 }))}
            style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--color-border)', width: 80 }}
          />
        )}
      </div>
    </div>
  )
}
