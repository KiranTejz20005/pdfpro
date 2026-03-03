import { Link } from 'react-router-dom'
import { CATEGORY_LABELS } from '../config/categories'
import { FileText, Layers, CreditCard, Image, Shield, Zap, Lock, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiUrl } from '../config/api'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={48} />,
  convert: <Layers size={48} />,
  'id-cards': <CreditCard size={48} />,
  image: <Image size={48} />,
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  pdf: 'Merge, split, compress, protect and manipulate PDF files',
  convert: 'Convert PDFs to Word, Excel, PowerPoint and other formats',
  'id-cards': 'Process Aadhar, PAN, Voter ID and other government ID cards',
  image: 'Resize, crop, compress and process images',
}

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then((r) => (r.ok ? setBackendStatus('online') : setBackendStatus('offline')))
      .catch(() => setBackendStatus('offline'))
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)', color: '#fff', padding: '80px 0 60px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20, marginBottom: 24, fontSize: '0.875rem', fontWeight: 500 }}>
            <Shield size={16} />
            <span>Government of India Initiative</span>
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: 20, fontWeight: 700, lineHeight: 1.2 }}>
            Digital Document Services
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: 700, margin: '0 auto 40px', opacity: 0.95, lineHeight: 1.6 }}>
            Secure, fast, and reliable document processing platform for citizens
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/category/pdf" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '14px 32px', background: '#FF6F00', color: '#fff', border: 'none', borderRadius: 6, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                Get Started
              </button>
            </Link>
            <Link to="/category/id-cards" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                ID Card Tools
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 0', background: '#F5F7FA' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { icon: <Shield size={32} color="#2E7D32" />, title: 'Secure & Private', desc: 'All files processed locally with encryption' },
              { icon: <Zap size={32} color="#FF6F00" />, title: 'Lightning Fast', desc: 'Process documents in seconds' },
              { icon: <Lock size={32} color="#1565C0" />, title: 'No Registration', desc: 'Use all tools without signup' },
              { icon: <CheckCircle size={32} color="#2E7D32" />, title: 'Free Forever', desc: 'All services completely free' },
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#1a1a1a', fontWeight: 700 }}>Our Services</h2>
            <p style={{ fontSize: '1rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>Choose from our comprehensive suite of document processing tools</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {['pdf', 'convert', 'id-cards', 'image'].map((id) => (
              <Link key={id} to={`/category/${id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: 32, textAlign: 'center', background: '#fff', border: '2px solid #E0E0E0', borderRadius: 8, transition: 'all 0.3s', cursor: 'pointer', height: '100%' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF6F00'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  <div style={{ marginBottom: 20, color: '#1565C0' }}>{CATEGORY_ICONS[id]}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12, color: '#1a1a1a' }}>
                    {CATEGORY_LABELS[id as keyof typeof CATEGORY_LABELS]}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: 24, lineHeight: 1.5 }}>
                    {CATEGORY_DESCRIPTIONS[id]}
                  </p>
                  <div style={{ padding: '10px 24px', background: '#FF6F00', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, display: 'inline-block' }}>
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
            {[
              { num: '50+', label: 'Tools Available' },
              { num: '100%', label: 'Free to Use' },
              { num: '24/7', label: 'Always Available' },
              { num: '0', label: 'Data Stored' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ padding: '20px', textAlign: 'center', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 }}>
            {backendStatus === 'checking' && <span style={{ color: '#666' }}>🔄 Checking system status...</span>}
            {backendStatus === 'online' && (
              <span style={{ color: '#2E7D32', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2E7D32' }} />
                All Systems Operational
              </span>
            )}
            {backendStatus === 'offline' && (
              <span style={{ color: '#D32F2F', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D32F2F' }} />
                System Offline — Please start the server
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
