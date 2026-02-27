import { Link } from 'react-router-dom'
import GlobalSearch from '../components/search/GlobalSearch'
import ToolCard from '../components/tools/ToolCard'
import { useRecentTools } from '../hooks/useRecentTools'
import { getToolById, type ToolConfig } from '../config/toolsRegistry'
import { CATEGORY_IDS, CATEGORY_LABELS } from '../config/categories'
import { apiUrl } from '../config/api'
import { useState, useEffect } from 'react'

const QUICK_ACTION_IDS = ['merge-pdf', 'compress-pdf', 'jpg-to-pdf', 'word-to-pdf', 'aadhar-cutter']
const POPULAR_IDS = ['merge-pdf', 'compress-pdf', 'pdf-to-word', 'word-to-pdf', 'jpg-to-pdf', 'split-pdf', 'protect-pdf', 'aadhar-cutter', 'ocr-pdf', 'scan-to-pdf']

export default function HomePage() {
  const { recentIds } = useRecentTools()
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then((r) => (r.ok ? setBackendStatus('online') : setBackendStatus('offline')))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const quickTools = QUICK_ACTION_IDS.map((id) => getToolById(id)).filter((t): t is ToolConfig => t != null)
  const popularTools = POPULAR_IDS.map((id) => getToolById(id)).filter((t): t is ToolConfig => t != null)
  const recentTools = recentIds.map((id) => getToolById(id)).filter((t): t is ToolConfig => t != null)

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero" style={{ marginBottom: 48, textAlign: 'center', padding: '60px 0 40px' }}>
        <h1 style={{ fontSize: '2.75rem', marginBottom: 16, color: 'var(--color-text)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          Every document and image tool in one place
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Merge, convert, compress, and edit PDFs. Process ID cards. All tools are free and easy to use.
        </p>
      </section>

      {/* Quick actions */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 20, color: 'var(--color-text)', fontWeight: 600, letterSpacing: '-0.01em' }}>Quick Actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {quickTools.map((t) => (
            <Link key={t.id} to={`/tools/${t.id}`} className="chip" style={{ padding: '10px 18px', fontSize: '0.9rem', fontWeight: 500 }}>
              {t.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Category shortcuts */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 20, color: 'var(--color-text)', fontWeight: 600, letterSpacing: '-0.01em' }}>Categories</h2>
        <div className="tools-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {CATEGORY_IDS.map((id) => (
            <Link
              key={id}
              to={`/category/${id}`}
              className="card"
              style={{ padding: 28, textAlign: 'center', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📁</div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '1.05rem', color: 'var(--color-text)' }}>{CATEGORY_LABELS[id]}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>View all tools</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular tools */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 20, color: 'var(--color-text)', fontWeight: 600, letterSpacing: '-0.01em' }}>Popular Tools</h2>
        <div className="tools-grid" style={{ gap: 16 }}>
          {popularTools.map((t) => (
            <ToolCard key={t.id} tool={t} primary={['merge-pdf', 'compress-pdf', 'jpg-to-pdf'].includes(t.id)} />
          ))}
        </div>
      </section>

      {/* Recent tools */}
      {recentTools.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 20, color: 'var(--color-text)', fontWeight: 600, letterSpacing: '-0.01em' }}>Recently Used</h2>
          <div className="tools-grid" style={{ gap: 16 }}>
            {recentTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* Backend status */}
      <div
        style={{
          marginTop: 40,
          padding: '14px 20px',
          textAlign: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}
      >
        {backendStatus === 'checking' && '🔄 Checking backend...'}
        {backendStatus === 'online' && (
          <span style={{ color: 'var(--color-success)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
            Backend Online
          </span>
        )}
        {backendStatus === 'offline' && (
          <span style={{ color: 'var(--color-error)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', display: 'inline-block' }} />
            Backend Offline — Start the server
          </span>
        )}
      </div>
    </div>
  )
}
