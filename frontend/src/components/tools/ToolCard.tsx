import { Link } from 'react-router-dom'
import type { ToolConfig } from '../../config/toolsRegistry'
import { FileText, Layers, Scissors, Archive, ScanText, Lock, Unlock, RotateCw, Stamp, Camera, Image, User, Crop, Maximize } from 'lucide-react'

interface ToolCardProps {
  tool: ToolConfig
  primary?: boolean
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'merge-pdf': <Layers size={22} color="var(--accent)" />,
  'split-pdf': <Scissors size={22} color="var(--accent)" />,
  'compress-pdf': <Archive size={22} color="var(--accent)" />,
  'ocr-pdf': <ScanText size={22} color="var(--accent)" />,
  'protect-pdf': <Lock size={22} color="var(--accent)" />,
  'unlock-pdf': <Unlock size={22} color="var(--accent)" />,
  'rotate-pdf': <RotateCw size={22} color="var(--accent)" />,
  'watermark-pdf': <Stamp size={22} color="var(--accent)" />,
  'scan-to-pdf': <Camera size={22} color="var(--accent)" />,
  'crop-pdf': <Crop size={22} color="var(--accent)" />,
}

const TOOL_DESCRIPTIONS: Record<string, string> = {
  'merge-pdf': 'Combine multiple PDFs into one file',
  'split-pdf': 'Extract pages from PDF',
  'compress-pdf': 'Reduce PDF file size',
  'ocr-pdf': 'Extract text from scanned PDF',
  'protect-pdf': 'Add password protection',
  'unlock-pdf': 'Remove password protection',
  'rotate-pdf': 'Rotate PDF pages',
  'watermark-pdf': 'Add watermark to PDF',
  'scan-to-pdf': 'Convert images to PDF',
  'crop-pdf': 'Crop PDF pages',
}

export default function ToolCard({ tool, primary = false }: ToolCardProps) {
  const icon = TOOL_ICONS[tool.id] || <FileText size={22} color="var(--accent)" />
  const previewText = TOOL_DESCRIPTIONS[tool.id] || tool.description

  return (
    <div className={`card ${primary ? 'card-primary' : ''}`} style={{ position: 'relative', overflow: 'hidden', padding: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px' }}>
      {/* Preview Box */}
      <div style={{ 
        height: 120, 
        background: '#F5F5F5', 
        borderRadius: '6px', 
        marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        border: '1px solid var(--border)'
      }}>
        {icon}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 12px' }}>
          {previewText}
        </div>
      </div>

      <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: 8, fontWeight: 600, color: 'var(--text)' }}>{tool.title}</h3>
      <p className="card-description" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>{tool.description}</p>
      
      <Link to={`/tools/${tool.id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', padding: '8px 16px', background: 'var(--primary)', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none' }}>
        Open tool
        <span style={{ fontSize: '1.1rem' }}>→</span>
      </Link>
    </div>
  )
}
