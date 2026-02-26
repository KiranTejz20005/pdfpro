import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface UnlockPdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

export default function UnlockPdfOptions({ options, setOptions }: UnlockPdfOptionsProps) {
  return (
    <div className="options-section">
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>PDF password</label>
      <input
        type="password"
        value={(options.password as string) ?? ''}
        onChange={(e) => setOptions((o) => ({ ...o, password: e.target.value }))}
        placeholder="Enter password to unlock"
        style={{ width: '100%', maxWidth: 280, padding: '8px 12px', borderRadius: 4, border: '1px solid var(--color-border)' }}
      />
    </div>
  )
}
