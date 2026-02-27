import { useState, useEffect } from 'react'
import GlobalSearch from '../search/GlobalSearch'
import { useRecentTools } from '../../hooks/useRecentTools'
import { apiUrl } from '../../config/api'

export default function TopNavbar() {
  const { recentIds } = useRecentTools()
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then((r) => (r.ok ? setBackendStatus('online') : setBackendStatus('offline')))
      .catch(() => setBackendStatus('offline'))
  }, [])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 256,
      right: 0,
      height: 64,
      background: '#0A0A0A',
      borderBottom: '1px solid #262626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 30,
    }}>
      <div style={{ flex: 1, maxWidth: 480 }}>
        <GlobalSearch recentToolIds={recentIds} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Backend Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: '0.5rem',
          background: backendStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${backendStatus === 'online' ? '#10b981' : '#ef4444'}`,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: backendStatus === 'online' ? '#10b981' : '#ef4444',
          }} />
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: backendStatus === 'online' ? '#10b981' : '#ef4444',
          }}>
            {backendStatus === 'checking' ? 'Checking...' : backendStatus === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Notification Icon */}
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: '0.5rem',
            background: 'transparent',
            border: '1px solid #262626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#A1A1AA',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#121212'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#A1A1AA'
          }}
          aria-label="Notifications"
        >
          <span style={{ fontSize: '1.25rem' }}>🔔</span>
        </button>

        {/* Settings Icon */}
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: '0.5rem',
            background: 'transparent',
            border: '1px solid #262626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#A1A1AA',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#121212'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#A1A1AA'
          }}
          aria-label="Settings"
        >
          <span style={{ fontSize: '1.25rem' }}>⚙️</span>
        </button>

        {/* Profile Avatar */}
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: '0.5rem',
            background: '#2563EB',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.25rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d4ed8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2563EB'
          }}
          aria-label="Profile"
        >
          👤
        </button>
      </div>
    </header>
  )
}
