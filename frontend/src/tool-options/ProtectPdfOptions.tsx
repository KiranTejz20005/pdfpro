import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface ProtectPdfOptionsProps {
  options: ToolOptionsState
  setOptions: React.Dispatch<React.SetStateAction<ToolOptionsState>>
}

export default function ProtectPdfOptions({ options, setOptions }: ProtectPdfOptionsProps) {
  return (
    <div className="options-section">
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>User password (required)</label>
      <input
        type="password"
        value={(options.user_password as string) ?? ''}
        onChange={(e) => setOptions((o) => ({ ...o, user_password: e.target.value }))}
        placeholder="Password to open PDF"
        style={{ width: '100%', maxWidth: 280, padding: '8px 12px', borderRadius: 4, border: '1px solid var(--color-border)' }}
      />
    </div>
  )
}
