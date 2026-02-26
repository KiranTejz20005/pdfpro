import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, CATEGORY_IDS } from '../../config/categories'
import GlobalSearch from '../search/GlobalSearch'
import { useRecentTools } from '../../hooks/useRecentTools'

export default function NavBar() {
  const { recentIds } = useRecentTools()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        DocPrint Pro
      </Link>
      <button
        type="button"
        className="nav-mobile-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span className="nav-mobile-icon" />
      </button>
      <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        {CATEGORY_IDS.map((id) => (
          <Link key={id} to={`/category/${id}`} onClick={() => setMenuOpen(false)}>
            {CATEGORY_LABELS[id]}
          </Link>
        ))}
      </div>
      <div className={`nav-search-wrap ${menuOpen ? 'nav-search-open' : ''}`}>
        <GlobalSearch recentToolIds={recentIds} className="nav-search" />
      </div>
    </nav>
  )
}
