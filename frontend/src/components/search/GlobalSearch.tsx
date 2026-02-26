import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchTools } from '../../config/toolsRegistry'
import type { ToolConfig } from '../../config/toolsRegistry'
import { CATEGORY_LABELS } from '../../config/categories'
import type { CategoryId } from '../../config/categories'
import { getToolById } from '../../config/toolsRegistry'

interface GlobalSearchProps {
  recentToolIds?: string[]
  onClose?: () => void
  className?: string
}

export default function GlobalSearch({ recentToolIds = [], onClose, className = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolConfig[]>([])
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim()) {
      setResults(searchTools(query))
    } else {
      setResults([])
    }
  }, [query])

  const recentTools = recentToolIds
    .map((id) => getToolById(id))
    .filter((t): t is ToolConfig => t != null)
  const showRecent = focused && !query.trim() && recentTools.length > 0
  const showResults = focused && (results.length > 0 || (query.trim().length > 0 && results.length === 0))

  const handleSelect = (toolId: string) => {
    setQuery('')
    setFocused(false)
    onClose?.()
    navigate(`/tools/${toolId}`)
  }

  return (
    <div className={`global-search ${className}`} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search tools..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        aria-label="Search tools"
        className="global-search-input"
      />
      {(showRecent || showResults) && (
        <div
          className="global-search-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {showRecent && !query.trim() && (
            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--color-text-caption)' }}>
              Recently used
            </div>
          )}
          {showRecent && !query.trim() && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentTools.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(t.id)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && (
            <>
              <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--color-text-caption)' }}>
                {results.length > 0 ? 'Tools' : 'No tools found'}
              </div>
              {results.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {results.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(t.id)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {t.description} · {CATEGORY_LABELS[t.category as CategoryId]}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
