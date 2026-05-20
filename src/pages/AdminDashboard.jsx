import { useApp } from '../context/AppContext'
import { PROFILES } from '../data/sampleData'

const KID_PROFILES = PROFILES.filter(p => p.role === 'kid')

export default function AdminDashboard() {
  const {
    profiles, books, trailNotes,
    getBooksByReader, getTrailNotesByReader, getReaderStats,
    navigate,
  } = useApp()

  const kidProfiles = profiles.filter(p => p.role === 'kid')

  const recentActivity = [...trailNotes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : 'Unknown Book'
  }

  const getReaderName = (readerId) => {
    const profile = profiles.find(p => p.id === readerId)
    return profile ? `${profile.name} (${profile.chineseName})` : readerId
  }

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>💜 Mom's Dashboard / 妈妈的管理页</h1>
      </div>

      {/* Quick nav */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <QuickNavCard icon="📚" title="All Books" titleZh="所有书" desc={`${books.length} books total / 共${books.length}本书`} onClick={() => navigate('admin-books')} color="#3B82F6" />
        <QuickNavCard icon="✏️" title="Templates" titleZh="写作模板" desc="Format clues for kids / 写作格式提示" onClick={() => navigate('admin-templates')} color="#10B981" />
        <QuickNavCard icon="👥" title="Profiles" titleZh="孩子档案" desc="Edit children's profiles / 编辑孩子档案" onClick={() => navigate('admin-profiles')} color="#EC4899" />
        <QuickNavCard icon="🏆" title="Progress" titleZh="阅读进度" desc="Track all readers / 追踪所有读者" onClick={() => navigate('admin')} color="#F97316" />
      </div>

      {/* Kid overview cards */}
      <div className="section-title">👧👦 Reader Overview / 读者概览</div>
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {kidProfiles.map(kid => (
          <KidOverviewCard
            key={kid.id}
            profile={kid}
            stats={getReaderStats(kid.id)}
            currentBooks={getBooksByReader(kid.id).filter(b => b.status === 'started')}
            navigate={navigate}
          />
        ))}
      </div>

      {/* Summary table */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="section-title">📊 Reading Summary / 阅读汇总</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reader / 读者</th>
                <th>Books Total / 总书数</th>
                <th>Finished / 读完</th>
                <th>Reading / 阅读中</th>
                <th>Pages Read / 已读页数</th>
                <th>Trail Notes / 足迹</th>
                <th>Vocab / 词语</th>
              </tr>
            </thead>
            <tbody>
              {kidProfiles.map(kid => {
                const stats = getReaderStats(kid.id)
                return (
                  <tr key={kid.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{kid.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 800 }}>{kid.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{kid.chineseName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{stats.totalBooks}</td>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: '#065F46',
                        background: '#D1FAE5',
                        borderRadius: '99px',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.82rem',
                      }}>
                        {stats.booksFinished}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: '#92400E',
                        background: '#FEF3C7',
                        borderRadius: '99px',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.82rem',
                      }}>
                        {stats.booksStarted}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{stats.totalPagesRead}</td>
                    <td style={{ fontWeight: 700 }}>{stats.trailNotes}</td>
                    <td style={{ fontWeight: 700 }}>{stats.vocabularyWords}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="section-title">🕐 Recent Activity / 最近动态</div>
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No activity yet / 还没有动态</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentActivity.map(note => {
              const profile = profiles.find(p => p.id === note.readerId)
              return (
                <div key={note.id} className="card" style={{ padding: '0.85rem 1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{profile?.avatar || '📖'}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 800, color: profile?.themeColor }}>{profile?.name}</span>
                      <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}> wrote a trail note for / 写了阅读足迹 </span>
                      <span style={{ fontWeight: 700 }}>{getBookTitle(note.bookId)}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', flexShrink: 0 }}>{note.date}</div>
                  </div>
                  {note.favoritePart && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.3rem', paddingLeft: '1.7rem' }}>
                      ❤️ {note.favoritePart.slice(0, 100)}{note.favoritePart.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function QuickNavCard({ icon, title, titleZh, desc, onClick, color }) {
  return (
    <div
      className="card"
      style={{ padding: '1.25rem', cursor: 'pointer', borderLeft: `4px solid ${color}` }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          background: color + '20',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{title} / {titleZh}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{desc}</div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: '1.1rem' }}>→</span>
      </div>
    </div>
  )
}

function KidOverviewCard({ profile, stats, currentBooks, navigate }) {
  const goalMatch = profile.readingGoal.match(/\d+/)
  const goalCount = goalMatch ? parseInt(goalMatch[0]) : 10
  const progress = Math.min(100, Math.round((stats.booksFinished / goalCount) * 100))

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        borderTop: `4px solid ${profile.themeColor}`,
        cursor: 'pointer',
      }}
      onClick={() => navigate('books')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>{profile.avatar}</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>{profile.name}</div>
          <div style={{ fontWeight: 700, color: profile.themeColor }}>{profile.chineseName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{profile.gradeLevel}</div>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '0.5rem', marginBottom: '0.85rem' }}>
        <MiniStat color={profile.themeColor} value={stats.booksFinished} label="Done / 读完" />
        <MiniStat color={profile.themeColor} value={stats.totalPagesRead} label="Pages / 页" />
        <MiniStat color={profile.themeColor} value={stats.trailNotes} label="Notes / 足迹" />
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.3rem' }}>
          <span>📚 Goal / 目标: {stats.booksFinished}/{goalCount} books / 本书</span>
          <span>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: profile.themeColor,
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {currentBooks.length > 0 && (
        <div style={{ marginTop: '0.6rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.25rem' }}>
            Currently Reading / 正在读:
          </div>
          {currentBooks.map(b => (
            <div key={b.id} style={{ fontSize: '0.8rem', color: profile.themeColor, fontWeight: 700 }}>
              📖 {b.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniStat({ color, value, label }) {
  return (
    <div style={{
      textAlign: 'center',
      background: 'var(--bg-warm)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.4rem',
    }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)' }}>{label}</div>
    </div>
  )
}
