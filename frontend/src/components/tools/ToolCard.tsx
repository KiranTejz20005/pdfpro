import { Link } from 'react-router-dom'
import type { ToolConfig } from '../../config/toolsRegistry'

interface ToolCardProps {
  tool: ToolConfig
  primary?: boolean
}

export default function ToolCard({ tool, primary = false }: ToolCardProps) {
  return (
    <div className={`card ${primary ? 'card-primary' : ''}`} style={{ position: 'relative', overflow: 'hidden', padding: 20 }}>
      <div style={{ marginBottom: 14, fontSize: '2rem', lineHeight: 1 }}>📄</div>
      <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: 8, fontWeight: 600, color: 'var(--color-text)' }}>{tool.title}</h3>
      <p className="card-description" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>{tool.description}</p>
      <Link to={`/tools/${tool.id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', padding: '8px 16px' }}>
        Open tool
        <span style={{ fontSize: '1.1rem' }}>→</span>
      </Link>
    </div>
  )
}
