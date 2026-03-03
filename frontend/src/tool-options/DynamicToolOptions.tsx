import { TOOL_FIELDS, type ToolField } from '../config/toolFields'
import type { ToolOptionsState } from '../components/tools/ToolLayout'

interface DynamicToolOptionsProps {
  toolId: string
  options: ToolOptionsState
  onChange: (options: ToolOptionsState) => void
}

export default function DynamicToolOptions({ toolId, options, onChange }: DynamicToolOptionsProps) {
  const fields = TOOL_FIELDS[toolId]
  
  if (!fields || fields.length === 0) {
    return null
  }

  const handleChange = (name: string, value: string | number | boolean) => {
    onChange({ ...options, [name]: value })
  }

  const renderField = (field: ToolField) => {
    const value = options[field.name] ?? field.defaultValue

    switch (field.type) {
      case 'number':
        return (
          <div key={field.name} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A' }}>
              {field.label}
            </label>
            <input
              type="number"
              value={value as number}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              onChange={(e) => handleChange(field.name, parseInt(e.target.value) || field.defaultValue as number)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </div>
        )

      case 'text':
        return (
          <div key={field.name} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A' }}>
              {field.label}
            </label>
            <input
              type="text"
              value={value as string}
              placeholder={field.placeholder}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.name} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A' }}>
              {field.label}
            </label>
            <select
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#fff'
              }}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'toggle':
        return (
          <div key={field.name} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A', cursor: 'pointer' }}>
              {field.label}
            </label>
          </div>
        )

      case 'slider':
        return (
          <div key={field.name} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500, color: '#1A1A1A' }}>
              {field.label}: {value}
            </label>
            <input
              type="range"
              value={value as number}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              onChange={(e) => handleChange(field.name, parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                background: '#E5E7EB',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {fields.map(renderField)}
    </div>
  )
}
