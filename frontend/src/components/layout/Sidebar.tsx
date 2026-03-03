import { Link, useLocation } from 'react-router-dom'
import { CATEGORY_IDS, CATEGORY_LABELS } from '../../config/categories'
import { FileText, Layers, CreditCard, Image } from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={20} />,
  image: <Image size={20} />,
  'id-cards': <CreditCard size={20} />,
  ai: <FileText size={20} />,
  convert: <Layers size={20} />,
  utilities: <FileText size={20} />,
}

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: 256,
      background: '#FFFFFF',
      borderRight: '1px solid #E5E7EB',
      overflowY: 'auto',
      zIndex: 40,
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #E5E7EB' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF50', marginBottom: 4 }}>
            DocPrint Pro
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.3 }}>Digital Document Services<br/>for Public Use</p>
        </Link>
      </div>

      <nav style={{ padding: '0 12px' }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/dashboard') ? '#2E7D32' : '#6B7280',
              background: isActive('/dashboard') ? '#E8F5E9' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={20} />
            Dashboard
          </Link>
        </div>

        <div style={{ marginBottom: 8, paddingLeft: 12 }}>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Service Categories
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CATEGORY_IDS.map((id) => (
            <Link
              key={id}
              to={`/category/${id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive(`/category/${id}`) ? '#2E7D32' : '#6B7280',
                background: isActive(`/category/${id}`) ? '#E8F5E9' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive(`/category/${id}`)) {
                  e.currentTarget.style.background = '#F9FAFB'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(`/category/${id}`)) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ color: isActive(`/category/${id}`) ? '#2E7D32' : '#4CAF50' }}>{CATEGORY_ICONS[id]}</span>
              {CATEGORY_LABELS[id]}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
