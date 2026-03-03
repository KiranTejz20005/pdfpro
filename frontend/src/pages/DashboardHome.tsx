import { Link } from 'react-router-dom'
import { CATEGORY_LABELS } from '../config/categories'
import { FileText, Layers, CreditCard, Image } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiUrl } from '../config/api'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={20} color="#2E7D32" />,
  convert: <Layers size={20} color="#2E7D32" />,
  'id-cards': <CreditCard size={20} color="#2E7D32" />,
  image: <Image size={20} color="#2E7D32" />,
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  pdf: 'Merge, split, compress, protect and manipulate PDF files',
  convert: 'Convert PDFs to Word, Excel, PowerPoint and other formats',
  'id-cards': 'Process Aadhar, PAN, Voter ID and other government ID cards',
  image: 'Resize, crop, compress and process images',
}

export default function DashboardHome() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then((r) => (r.ok ? setBackendStatus('online') : setBackendStatus('offline')))
      .catch(() => setBackendStatus('offline'))
  }, [])

  return (
    <div className="main-wrapper">
      <div className="container">
      {/* Hero */}
      <section className="hero-section fade-in" style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '2.75rem', marginBottom: 16, color: '#1A1A1A', fontWeight: 700, lineHeight: 1.2 }}>
          Digital Document Services
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.125rem', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Government-approved document processing platform for PDF, images, and ID cards
        </p>
      </section>

      {/* Category Cards */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 24, color: '#1A1A1A', fontWeight: 600 }}>Service Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {['pdf', 'convert', 'id-cards', 'image'].map((id) => (
            <Link
              key={id}
              to={`/category/${id}`}
              style={{ textDecoration: 'none' }}
              className="fade-in"
            >
              <div
                className="soft-card"
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div className="icon-circle" style={{ margin: '0 auto 20px' }}>{CATEGORY_ICONS[id]}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12, color: '#1A1A1A' }}>
                  {CATEGORY_LABELS[id as keyof typeof CATEGORY_LABELS]}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>
                  {CATEGORY_DESCRIPTIONS[id]}
                </p>
                <button
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  View Tools →
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Backend status */}
      <div className="fade-in"
        style={{
          marginTop: 40,
          padding: '14px 20px',
          textAlign: 'center',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          fontSize: '0.875rem',
          color: '#6B7280',
        }}
      >
        {backendStatus === 'checking' && '🔄 Checking backend...'}
        {backendStatus === 'online' && (
          <span style={{ color: '#4CAF50', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }} />
            System Online
          </span>
        )}
        {backendStatus === 'offline' && (
          <span style={{ color: '#E53935', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53935', display: 'inline-block' }} />
            System Offline — Start the server
          </span>
        )}
      </div>
    </div>
    </div>
  )
}
