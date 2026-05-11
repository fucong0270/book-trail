import { useApp } from '../context/AppContext'

function setTheme(profile) {
  const root = document.documentElement
  root.style.setProperty('--theme-color', profile.themeColor)
  root.style.setProperty('--theme-light', profile.themeColorLight)
  root.style.setProperty('--theme-dark', profile.themeColorDark)
}

const ROLE_LABELS = {
  kid: { en: 'Reader', zh: '小读者' },
  admin: { en: 'Family Admin', zh: '家长' },
}



export default function Welcome() {
  const { profiles, setActiveProfileId, navigate } = useApp()

  const handleSelect = (profile) => {
    setTheme(profile)
    setActiveProfileId(profile.id)
    navigate(profile.role === 'admin' ? 'admin' : 'dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #FFFBF5 0%, #FFF0E8 50%, #F0F4FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1.25rem',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '560px' }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #F97316)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.4rem',
          letterSpacing: '-0.01em',
        }}>
          📚 Book Trail
        </h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.2rem' }}>
          Your Family Reading Adventure
        </p>
        <p style={{ fontSize: '0.95rem', color: '#A8A29E', fontWeight: 600 }}>
          家庭阅读小径 · 开始你的阅读旅程
        </p>
      </div>

      {/* Profile cards */}
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <p style={{
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-soft)',
          marginBottom: '1.25rem',
        }}>
          Who's reading today? / 今天谁来读书？
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          justifyItems: 'center',
        }}>
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-light)',
        fontWeight: 600,
      }}>
        🌟 Reading together, growing together / 一起阅读，一起成长 🌟
      </div>
    </div>
  )
}

function ProfileCard({ profile, onSelect }) {
  const isAdmin = profile.role === 'admin'
  const role = ROLE_LABELS[profile.role] || ROLE_LABELS.kid

  return (
    <div
      className="card"
      onClick={() => onSelect(profile)}
      style={{
        width: '100%',
        maxWidth: '190px',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        cursor: 'pointer',
        border: `2.5px solid ${profile.themeColor}20`,
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'
        e.currentTarget.style.boxShadow = `0 12px 32px ${profile.themeColor}30`
        e.currentTarget.style.borderColor = profile.themeColor
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.borderColor = `${profile.themeColor}20`
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
        background: `linear-gradient(90deg, ${profile.themeColor}, ${profile.themeColorLight})`,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }} />
      <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>{profile.avatar}</div>
      <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text-main)' }}>{profile.name}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: profile.themeColor, marginBottom: '0.4rem' }}>{profile.chineseName}</div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: profile.themeColorLight, color: profile.themeColorDark,
        borderRadius: '99px', padding: '0.2rem 0.65rem',
        fontSize: '0.73rem', fontWeight: 800, marginBottom: '0.6rem',
      }}>
        {isAdmin ? '👑' : '📖'} {role.en} / {role.zh}
      </div>
      {profile.gradeLevel && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', fontWeight: 600, marginBottom: '0.4rem' }}>
          {profile.gradeLevel}
        </div>
      )}
      <div style={{ fontSize: '0.73rem', color: 'var(--text-light)', fontWeight: 600, lineHeight: 1.4, marginTop: '0.25rem' }}>
        {profile.readingGoal.split('/')[0].trim()}
      </div>
      <div style={{
        marginTop: '0.85rem', background: profile.themeColor, color: 'white',
        borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem',
        fontSize: '0.8rem', fontWeight: 800,
      }}>
        Start Reading / 开始 →
      </div>
    </div>
  )
}
