import { useState } from 'react'
import { useApp } from '../context/AppContext'

const KID_LINKS = [
  { page: 'dashboard', label: 'Dashboard', chinese: '首页', icon: '🏠' },
  { page: 'books', label: 'My Bookshelf', chinese: '我的书架', icon: '📚' },
  { page: 'trail-notes', label: 'Trail Notes', chinese: '阅读足迹', icon: '📝' },
  { page: 'vocabulary', label: 'Vocabulary', chinese: '词语', icon: '🔤' },
  { page: 'badges', label: 'Badges', chinese: '徽章', icon: '🏆' },
]

const ADMIN_LINKS = [
  { page: 'admin', label: 'Overview', chinese: '总览', icon: '📊' },
  { page: 'admin-books', label: 'All Books', chinese: '所有书', icon: '📚' },
  { page: 'admin-templates', label: 'Templates', chinese: '写作模板', icon: '✏️' },
  { page: 'admin-profiles', label: 'Profiles', chinese: '档案', icon: '👥' },
]

export default function Navigation() {
  const { activeProfile, currentPage, navigate } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!activeProfile) return null

  const isAdmin = activeProfile.role === 'admin'
  const links = isAdmin ? ADMIN_LINKS : KID_LINKS

  const handleNav = (page) => {
    navigate(page)
    setMenuOpen(false)
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>📚</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15, gap: 0 }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.04em' }}>Book</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.04em' }}>Trail</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex' }}>
          {links.map(link => (
            <button
              key={link.page}
              className={`nav-link${currentPage === link.page ? ' active' : ''}`}
              onClick={() => handleNav(link.page)}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Profile button */}
          <button className="nav-profile" onClick={() => navigate('welcome')}>
            <span style={{ fontSize: '1.2rem' }}>{activeProfile.avatar}</span>
            <span style={{ whiteSpace: 'nowrap' }}>{activeProfile.name} / {activeProfile.chineseName}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>▾</span>
          </button>

          {/* Hamburger */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: 'none' }}
            id="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {links.map(link => (
            <button
              key={link.page}
              className={`nav-link${currentPage === link.page ? ' active' : ''}`}
              style={{ justifyContent: 'flex-start' }}
              onClick={() => handleNav(link.page)}
            >
              <span>{link.icon}</span>
              <span>{link.label} / {link.chinese}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          #hamburger-btn { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  )
}
