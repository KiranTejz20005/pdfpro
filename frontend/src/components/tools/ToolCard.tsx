import { Link } from 'react-router-dom'
import type { ToolConfig } from '../../config/toolsRegistry'

interface ToolCardProps {
  tool: ToolConfig
  primary?: boolean
}

export default function ToolCard({ tool, primary = false }: ToolCardProps) {
  return (
    <div className={`card ${primary ? 'card-primary' : ''}`}>
      <h3 className="card-title">{tool.title}</h3>
      <p className="card-description">{tool.description}</p>
      <Link to={`/tools/${tool.id}`} className="btn btn-primary" style={{ display: 'inline-block' }}>
        Open tool →
      </Link>
    </div>
  )
}
