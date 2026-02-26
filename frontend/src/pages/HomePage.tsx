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
      <section className="hero" style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: 12, color: 'var(--color-text)' }}>
          Every document and image tool in one place
        </h1>
        <p style={{ fontSize: 18, color: 'var(--color-text-muted)', maxWidth: 560, margin: '0 auto 24px' }}>
          Merge, convert, compress, and edit PDFs. Process ID cards. All tools are free and easy to use.
        </p>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <GlobalSearch recentToolIds={recentIds} />
        </div>
      </section>

      {/* Quick actions */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--color-text)' }}>Quick actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {quickTools.map((t) => (
            <Link key={t.id} to={`/tools/${t.id}`} className="chip">
              {t.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Category shortcuts */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--color-text)' }}>Categories</h2>
        <div className="tools-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {CATEGORY_IDS.map((id) => (
            <Link
              key={id}
              to={`/category/${id}`}
              className="card"
              style={{ padding: 20, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{CATEGORY_LABELS[id]}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>View all tools</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular tools */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--color-text)' }}>Popular tools</h2>
        <div className="tools-grid">
          {popularTools.map((t) => (
            <ToolCard key={t.id} tool={t} primary={['merge-pdf', 'compress-pdf', 'jpg-to-pdf'].includes(t.id)} />
          ))}
        </div>
      </section>

      {/* Recent tools */}
      {recentTools.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--color-text)' }}>Recently used</h2>
          <div className="tools-grid">
            {recentTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* Backend status */}
      <div
        style={{
          marginTop: 32,
          padding: '12px 24px',
          textAlign: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 14,
          color: 'var(--color-text-muted)',
        }}
      >
        {backendStatus === 'checking' && 'Checking backend...'}
        {backendStatus === 'online' && (
          <span style={{ color: 'var(--color-success)' }}>● Backend online</span>
        )}
        {backendStatus === 'offline' && (
          <span style={{ color: 'var(--color-error)' }}>● Backend offline — start the server</span>
        )}
      </div>
    </div>
  )
}
