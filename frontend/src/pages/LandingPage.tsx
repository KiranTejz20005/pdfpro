import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      background: 'linear-gradient(135deg, #FDE3B3 0%, #FFFFFF 45%, #C8E6C9 100%)'
    }}>
      {/* Pill Navbar */}
      <nav style={{
        background: '#ffffff',
        borderRadius: '999px',
        padding: '14px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
        maxWidth: '1200px',
        margin: '0 auto 60px auto',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '1.3rem', color: '#1A1A1A' }}>
          PDFPro
        </div>
        <div style={{ display: 'flex', gap: 28, fontWeight: 500, color: '#555', flexWrap: 'wrap' }}>
          <a href="#features" style={{ textDecoration: 'none', color: '#555', transition: '0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2E7D32'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#555'}>
            Features
          </a>
          <a href="#services" style={{ textDecoration: 'none', color: '#555', transition: '0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2E7D32'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#555'}>
            Services
          </a>
          <a href="#about" style={{ textDecoration: 'none', color: '#555', transition: '0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2E7D32'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#555'}>
            About
          </a>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{
            background: 'transparent',
            border: '1px solid #E0E0E0',
            padding: '8px 18px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: 500,
            color: '#555'
          }}>
            Login
          </button>
          <button style={{
            background: '#1A1A1A',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}>
            Join
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'clamp(38px, 7vw, 64px)',
          fontWeight: 700,
          lineHeight: 1.05,
          color: '#1A1A1A',
          marginBottom: 20
        }}>
          Process Documents with Confidence
        </h1>
        <p style={{
          marginTop: 20,
          fontSize: '18px',
          color: '#6B7280',
          maxWidth: '650px',
          margin: '20px auto 0'
        }}>
          Secure, fast, and reliable document processing platform for all your PDF, image, and ID card needs.
        </p>

        {/* CTA Buttons */}
        <div style={{
          marginTop: 35,
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}>
          <button style={{
            background: 'white',
            border: '1px solid #D1D5DB',
            padding: '14px 28px',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '15px',
            color: '#1A1A1A',
            transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            Learn More
          </button>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#4CAF50',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: '0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2E7D32'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#4CAF50'}>
              Get Started
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>

      {/* City Illustration */}
      <div style={{
        marginTop: '80px',
        opacity: 0.35
      }}>
        <svg viewBox="0 0 1200 220" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
          {/* Background Hills */}
          <path d="M 0 180 Q 200 150 400 170 T 800 160 T 1200 175 L 1200 220 L 0 220 Z" fill="#F5F5F5" />
          
          {/* Ground Line */}
          <line x1="0" y1="200" x2="1200" y2="200" stroke="#D1D5DB" strokeWidth="2"/>
          
          {/* Building 1 */}
          <rect x="50" y="120" width="80" height="80" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="65" y="140" width="10" height="12" fill="#4CAF50"/>
          <rect x="85" y="140" width="10" height="12" fill="#4CAF50"/>
          <rect x="105" y="140" width="10" height="12" fill="#4CAF50"/>
          <rect x="75" y="165" width="10" height="12" fill="#4CAF50"/>
          <rect x="95" y="165" width="10" height="12" fill="#4CAF50"/>
          
          {/* Building 2 */}
          <rect x="160" y="90" width="100" height="110" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="180" y="110" width="12" height="15" fill="#4CAF50"/>
          <rect x="205" y="110" width="12" height="15" fill="#4CAF50"/>
          <rect x="230" y="110" width="12" height="15" fill="#4CAF50"/>
          <rect x="180" y="140" width="12" height="15" fill="#4CAF50"/>
          <rect x="205" y="140" width="12" height="15" fill="#4CAF50"/>
          <rect x="230" y="140" width="12" height="15" fill="#4CAF50"/>
          <rect x="180" y="170" width="12" height="15" fill="#4CAF50"/>
          <rect x="230" y="170" width="12" height="15" fill="#4CAF50"/>
          
          {/* Building 3 */}
          <rect x="290" y="140" width="70" height="60" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="305" y="155" width="10" height="12" fill="#4CAF50"/>
          <rect x="325" y="155" width="10" height="12" fill="#4CAF50"/>
          <rect x="345" y="155" width="10" height="12" fill="#4CAF50"/>
          
          {/* Tree 1 */}
          <circle cx="390" cy="175" r="15" fill="#4CAF50"/>
          <rect x="386" y="175" width="8" height="25" fill="#8D6E63"/>
          
          {/* Building 4 */}
          <rect x="430" y="100" width="90" height="100" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="450" y="120" width="12" height="15" fill="#4CAF50"/>
          <rect x="475" y="120" width="12" height="15" fill="#4CAF50"/>
          <rect x="450" y="150" width="12" height="15" fill="#4CAF50"/>
          <rect x="475" y="150" width="12" height="15" fill="#4CAF50"/>
          <rect x="450" y="175" width="12" height="15" fill="#4CAF50"/>
          
          {/* Building 5 */}
          <rect x="550" y="130" width="75" height="70" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="570" y="150" width="10" height="12" fill="#4CAF50"/>
          <rect x="590" y="150" width="10" height="12" fill="#4CAF50"/>
          <rect x="580" y="175" width="10" height="12" fill="#4CAF50"/>
          
          {/* Tree 2 */}
          <circle cx="650" cy="175" r="18" fill="#4CAF50"/>
          <rect x="645" y="175" width="10" height="25" fill="#8D6E63"/>
          
          {/* Building 6 */}
          <rect x="690" y="85" width="95" height="115" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="710" y="105" width="12" height="15" fill="#4CAF50"/>
          <rect x="735" y="105" width="12" height="15" fill="#4CAF50"/>
          <rect x="760" y="105" width="12" height="15" fill="#4CAF50"/>
          <rect x="710" y="135" width="12" height="15" fill="#4CAF50"/>
          <rect x="735" y="135" width="12" height="15" fill="#4CAF50"/>
          <rect x="760" y="135" width="12" height="15" fill="#4CAF50"/>
          <rect x="710" y="165" width="12" height="15" fill="#4CAF50"/>
          <rect x="735" y="165" width="12" height="15" fill="#4CAF50"/>
          
          {/* Building 7 */}
          <rect x="810" y="120" width="80" height="80" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="830" y="140" width="10" height="12" fill="#4CAF50"/>
          <rect x="850" y="140" width="10" height="12" fill="#4CAF50"/>
          <rect x="870" y="140" width="10" height="12" fill="#4CAF50"/>
          <rect x="840" y="165" width="10" height="12" fill="#4CAF50"/>
          <rect x="860" y="165" width="10" height="12" fill="#4CAF50"/>
          
          {/* Balloon with animation */}
          <g style={{ animation: 'float 3s ease-in-out infinite' }}>
            <circle cx="920" cy="50" r="14" fill="#4CAF50"/>
            <line x1="920" y1="64" x2="920" y2="140" stroke="#D1D5DB" strokeWidth="1"/>
          </g>
          
          {/* Building 8 */}
          <rect x="950" y="110" width="85" height="90" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="970" y="130" width="12" height="15" fill="#4CAF50"/>
          <rect x="995" y="130" width="12" height="15" fill="#4CAF50"/>
          <rect x="970" y="160" width="12" height="15" fill="#4CAF50"/>
          <rect x="995" y="160" width="12" height="15" fill="#4CAF50"/>
          
          {/* Tree 3 */}
          <circle cx="1060" cy="175" r="16" fill="#4CAF50"/>
          <rect x="1055" y="175" width="10" height="25" fill="#8D6E63"/>
          
          {/* Building 9 */}
          <rect x="1090" y="135" width="70" height="65" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
          <rect x="1105" y="155" width="10" height="12" fill="#4CAF50"/>
          <rect x="1125" y="155" width="10" height="12" fill="#4CAF50"/>
          <rect x="1145" y="155" width="10" height="12" fill="#4CAF50"/>
          
          {/* People stick figures */}
          <g>
            <circle cx="240" cy="195" r="3" fill="#9E9E9E"/>
            <line x1="240" y1="198" x2="240" y2="208" stroke="#9E9E9E" strokeWidth="1.5"/>
            <line x1="240" y1="202" x2="235" y2="206" stroke="#9E9E9E" strokeWidth="1.5"/>
            <line x1="240" y1="202" x2="245" y2="206" stroke="#9E9E9E" strokeWidth="1.5"/>
          </g>
          <g>
            <circle cx="580" cy="195" r="3" fill="#9E9E9E"/>
            <line x1="580" y1="198" x2="580" y2="208" stroke="#9E9E9E" strokeWidth="1.5"/>
            <line x1="580" y1="202" x2="575" y2="206" stroke="#9E9E9E" strokeWidth="1.5"/>
            <line x1="580" y1="202" x2="585" y2="206" stroke="#9E9E9E" strokeWidth="1.5"/>
          </g>
          <g>
            <circle cx="870" cy="195" r="3" fill="#9E9E9E"/>
            <line x1="870" y1="198" x2="870" y2="208" stroke="#9E9E9E" strokeWidth="1.5"/>
            <line x1="870" y1="202" x2="865" y2="206" stroke="#9E9E9E" strokeWidth="1.5"/>
            <line x1="870" y1="202" x2="875" y2="206" stroke="#9E9E9E" strokeWidth="1.5"/>
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      {/* Features Section */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '120px auto 0',
        padding: '80px 40px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>Powerful Features</h2>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Everything you need to process documents efficiently</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          {[
            { title: 'Secure Processing', desc: 'End-to-end encryption ensures your documents remain private and secure' },
            { title: 'Lightning Fast', desc: 'Process documents in seconds with our optimized infrastructure' },
            { title: 'No Registration', desc: 'Start using immediately without creating an account' },
            { title: 'Free Forever', desc: 'All tools are completely free with no hidden charges' },
            { title: 'Batch Processing', desc: 'Handle multiple files at once to save time' },
            { title: '24/7 Available', desc: 'Access our tools anytime, anywhere, on any device' }
          ].map((f, i) => (
            <div key={i} style={{ padding: 24 }}>
              <div style={{ width: 48, height: 48, background: '#E8F5E9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: '24px' }}>✓</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{
        maxWidth: '1200px',
        margin: '60px auto 0',
        padding: '80px 40px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>Our Services</h2>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Comprehensive document processing solutions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {[
            { title: 'PDF Tools', desc: 'Merge, split, compress, rotate, and protect PDFs', count: '25+ Tools' },
            { title: 'Convert Files', desc: 'Convert between PDF, Word, Excel, PowerPoint, and images', count: '10+ Formats' },
            { title: 'ID Card Processing', desc: 'Extract and process Aadhar, PAN, Voter ID cards', count: '7+ Cards' },
            { title: 'Image Tools', desc: 'Resize, crop, compress, and enhance images', count: '40+ Tools' },
            { title: 'OCR & Scanning', desc: 'Extract text from scanned documents and images', count: 'AI Powered' },
            { title: 'Batch Operations', desc: 'Process multiple files simultaneously', count: 'Unlimited' }
          ].map((s, i) => (
            <div key={i} style={{ padding: 28, border: '2px solid #E5E7EB', borderRadius: '16px', transition: 'all 0.3s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4CAF50'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>{s.desc}</p>
              <span style={{ display: 'inline-block', padding: '6px 12px', background: '#E8F5E9', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#2E7D32' }}>{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        maxWidth: '1200px',
        margin: '60px auto 120px',
        padding: '80px 40px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: '42px', fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>About DocPrint Pro</h2>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '700px', margin: '0 auto' }}>Your trusted partner for document processing</p>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Our Mission</h3>
            <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.8 }}>
              DocPrint Pro is dedicated to providing free, secure, and efficient document processing tools for everyone. We believe in making professional-grade document tools accessible to all citizens without any barriers.
            </p>
          </div>
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Why Choose Us</h3>
            <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.8 }}>
              With over 80+ tools covering PDFs, images, conversions, and government ID card processing, we offer the most comprehensive document processing platform. All operations are performed securely with no data retention, ensuring your privacy is always protected.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginTop: 48 }}>
            {[
              { num: '80+', label: 'Tools Available' },
              { num: '100%', label: 'Free to Use' },
              { num: '0', label: 'Data Stored' },
              { num: '24/7', label: 'Always Online' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 20, background: '#F9FAFB', borderRadius: '12px' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#4CAF50', marginBottom: 8 }}>{stat.num}</div>
                <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
