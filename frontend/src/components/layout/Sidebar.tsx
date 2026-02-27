import { Link, useLocation } from 'react-router-dom'
import { CATEGORY_IDS, CATEGORY_LABELS } from '../../config/categories'

const CATEGORY_ICONS: Record<string, string> = {
  pdf: '📄',
  image: '🖼️',
  'id-cards': '🪪',
  ai: '🤖',
  convert: '🔄',
  utilities: '🛠️',
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
      background: '#0A0A0A',
      borderRight: '1px solid #262626',
      overflowY: 'auto',
      zIndex: 40,
    }}>
      <div style={{ padding: '24px 20px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>
            DocPrint Pro
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>PDF & ID Card Tools</p>
        </Link>
      </div>

      <nav style={{ padding: '0 12px' }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/') && location.pathname === '/' ? '#2563EB' : '#A1A1AA',
              background: isActive('/') && location.pathname === '/' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🏠</span>
            Dashboard
          </Link>
        </div>

        <div style={{ marginBottom: 8, paddingLeft: 12 }}>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Categories
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
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive(`/category/${id}`) ? '#2563EB' : '#A1A1AA',
                background: isActive(`/category/${id}`) ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive(`/category/${id}`)) {
                  e.currentTarget.style.background = '#121212'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(`/category/${id}`)) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{CATEGORY_ICONS[id]}</span>
              {CATEGORY_LABELS[id]}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
