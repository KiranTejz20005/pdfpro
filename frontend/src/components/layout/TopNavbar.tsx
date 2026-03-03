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
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 30,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
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
          borderRadius: '12px',
          background: backendStatus === 'online' ? '#E8F5E9' : '#FDECEC',
          border: `1px solid ${backendStatus === 'online' ? '#4CAF50' : '#E53935'}`,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: backendStatus === 'online' ? '#4CAF50' : '#E53935',
            animation: backendStatus === 'checking' ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: backendStatus === 'online' ? '#2E7D32' : '#E53935',
          }}>
            {backendStatus === 'checking' ? 'Checking...' : backendStatus === 'online' ? 'System Online' : 'System Offline'}
          </span>
        </div>

        {/* Notification Icon */}
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6B7280',
            transition: 'all 0.2s',
            fontSize: '1.1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E8F5E9'
            e.currentTarget.style.borderColor = '#4CAF50'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F9FAFB'
            e.currentTarget.style.borderColor = '#E5E7EB'
          }}
          aria-label="Notifications"
        >
          🔔
        </button>

        {/* Settings Icon */}
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6B7280',
            transition: 'all 0.2s',
            fontSize: '1.1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E8F5E9'
            e.currentTarget.style.borderColor = '#4CAF50'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F9FAFB'
            e.currentTarget.style.borderColor = '#E5E7EB'
          }}
          aria-label="Settings"
        >
          ⚙️
        </button>

        {/* Profile Avatar */}
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: '#4CAF50',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2E7D32'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#4CAF50'
          }}
          aria-label="Profile"
        >
          👤
        </button>
      </div>
    </header>
  )
}
