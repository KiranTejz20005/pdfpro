import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface RotatePdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

export default function RotatePdfOptions({ options, setOptions }: RotatePdfOptionsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
          Rotation Angle
        </label>
        <select
          value={(options.angle as number) || 90}
          onChange={(e) => setOptions((prev) => ({ ...prev, angle: parseInt(e.target.value) }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: 'var(--card)',
          }}
        >
          <option value="90">90° Clockwise</option>
          <option value="180">180° (Upside Down)</option>
          <option value="270">270° (90° Counter-Clockwise)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
          Apply to Pages (optional)
        </label>
        <input
          type="text"
          value={(options.pages as string) ?? ''}
          onChange={(e) => setOptions((prev) => ({ ...prev, pages: e.target.value }))}
          placeholder="e.g., 1,3,5-8 or leave empty for all pages"
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
          Leave empty to rotate all pages
        </div>
      </div>
    </div>
  )
}
