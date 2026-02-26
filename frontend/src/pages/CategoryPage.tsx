import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import ToolCard from '../components/tools/ToolCard'
import Chip from '../components/ui/Chip'
import { getToolsByCategory } from '../config/toolsRegistry'
import { CATEGORY_LABELS, PDF_SUBCATEGORIES } from '../config/categories'
import type { CategoryId, PdfSubcategoryId } from '../config/categories'

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const [subcategory, setSubcategory] = useState<PdfSubcategoryId>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const id = categoryId as CategoryId | undefined
  const tools = useMemo(() => (id ? getToolsByCategory(id) : []), [id])

  const filteredTools = useMemo(() => {
    let list = tools
    if (id === 'pdf' && subcategory !== 'all') {
      list = list.filter((t) => t.subcategory === subcategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    return list
  }, [tools, id, subcategory, searchQuery])

  if (!id || !(id in CATEGORY_LABELS)) {
    return (
      <div className="container">
        <p>Category not found.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          Go home
        </button>
      </div>
    )
  }

  const isPdf = id === 'pdf'

  const isIdCards = id === 'id-cards'

  return (
    <div className="container">
      <h1 style={{ marginBottom: 8, fontSize: '1.75rem' }}>{CATEGORY_LABELS[id]}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: isIdCards ? 12 : 24 }}>
        {tools.length} tool{tools.length !== 1 ? 's' : ''} in this category
      </p>
      {isIdCards && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, maxWidth: 560, marginBottom: 24, lineHeight: 1.5 }}>
          Crop government ID cards from official PDFs for printing. All tools support standard, wallet, and individual print layouts with optional cut marks. Batch process multiple cards where supported.
        </p>
      )}

      {isPdf && (
        <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PDF_SUBCATEGORIES.map((sub) => (
            <Chip
              key={sub.id}
              selected={subcategory === sub.id}
              onClick={() => setSubcategory(sub.id)}
            >
              {sub.label}
            </Chip>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <input
          type="search"
          placeholder="Search in this category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="global-search-input"
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className="tools-grid">
        {filteredTools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 24 }}>No tools match your filters.</p>
      )}
    </div>
  )
}
