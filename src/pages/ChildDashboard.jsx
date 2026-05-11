import { useApp } from '../context/AppContext'
import ProgressTrail from '../components/ProgressTrail'
import { MOOD_OPTIONS } from '../data/sampleData'

const GREETINGS = ['Good reading', 'Happy reading', 'Keep it up', 'Wonderful']
const GREETINGS_ZH = ['继续阅读', '快乐阅读', '加油', '太棒了']

function getMoodEmoji(mood) {
  const found = MOOD_OPTIONS.find(m => m.value === mood)
  return found ? found.emoji : '📖'
}

function StarRating({ rating }) {
  if (!rating) return null
  return (
    <span style={{ fontSize: '0.82rem' }}>
      {'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ChildDashboard() {
  const {
    activeProfile,
    getBooksByReader,
    getTrailNotesByReader,
    getReaderStats,
    computeBadges,
    navigate,
    books,
  } = useApp()

  if (!activeProfile) return null

  const stats = getReaderStats(activeProfile.id)
  const readerBooks = getBooksByReader(activeProfile.id)
  const readerNotes = getTrailNotesByReader(activeProfile.id)
  const earnedBadges = computeBadges(activeProfile.id)

  const currentlyReading = readerBooks.filter(b => b.status === 'started')
  const recentNotes = readerNotes.slice(0, 3)
  const topBadges = earnedBadges.slice(0, 3)

  const greetIdx = new Date().getDay() % GREETINGS.length

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : 'Unknown Book'
  }

  const goalBooks = activeProfile.readingGoal.match(/\d+/)
  const goalCount = goalBooks ? parseInt(goalBooks[0]) : 10
  const goalPercent = Math.min(100, Math.round((stats.booksFinished / goalCount) * 100))

  return (
    <div className="page-container animate-fadeIn">
      {/* Greeting */}
      <div className="page-header">
        <span style={{ fontSize: '2rem' }}>{activeProfile.avatar}</span>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>
            {GREETINGS[greetIdx]}, {activeProfile.name}!
          </h1>
          <p style={{ color: 'var(--text-soft)', fontWeight: 700 }}>
            你好，{activeProfile.chineseName}！{GREETINGS_ZH[greetIdx]}！
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            background: 'var(--theme-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.75rem 1.25rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--theme-dark)', marginBottom: '0.3rem' }}>
              📚 Reading Goal / 阅读目标
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--theme-color)' }}>
              {stats.booksFinished} / {goalCount}
            </div>
            {/* progress bar */}
            <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '3px', margin: '0.3rem auto 0' }}>
              <div style={{
                width: `${goalPercent}%`,
                height: '100%',
                background: 'var(--theme-color)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>{goalPercent}% done</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <StatCard icon="📚" value={stats.booksFinished} label="Books Finished" labelZh="读完的书" />
        <StatCard icon="📄" value={stats.totalPagesRead} label="Pages Read" labelZh="已读页数" />
        <StatCard icon="📝" value={stats.trailNotes} label="Trail Notes" labelZh="阅读足迹" />
        <StatCard icon="🔤" value={stats.vocabularyWords} label="New Words" labelZh="新词语" />
      </div>

      {/* This week / this month */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-soft)' }}>
                📅 This Week / 本周
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--theme-color)' }}>
                {stats.pagesThisWeek}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>pages / 页</div>
            </div>
            <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>📖</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-soft)' }}>
                🗓️ This Month / 本月
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--theme-color)' }}>
                {stats.pagesThisMonth}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>pages / 页</div>
            </div>
            <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>🗓️</div>
          </div>
        </div>
      </div>

      {/* Progress trail */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="section-title">🥾 My Reading Trail / 我的阅读小径</div>
        <ProgressTrail readerId={activeProfile.id} />
      </div>

      {/* Currently reading */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="section-title">📖 Currently Reading / 正在阅读</div>
        {currentlyReading.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="empty-state" style={{ padding: '1rem' }}>
              <div className="empty-icon">📚</div>
              <h3>No books in progress</h3>
              <p>Start a new book! / 开始一本新书！</p>
              <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => navigate('books')}>
                Go to My Books / 去书架
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {currentlyReading.map(book => (
              <div
                key={book.id}
                className="card"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => navigate('book-detail', book.id)}
              >
                <div style={{
                  width: '100%',
                  height: '80px',
                  background: `linear-gradient(135deg, var(--theme-color), var(--theme-dark))`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                }}>
                  📖
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  {book.title}
                </div>
                {book.chineseTitle && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: '0.35rem' }}>
                    {book.chineseTitle}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: '0.75rem' }}>
                  {book.author}
                </div>
                <span className="status-badge status-started">📖 Reading / 阅读中</span>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={(e) => { e.stopPropagation(); navigate('book-detail', book.id) }}
                >
                  Continue / 继续 →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent trail notes */}
      {recentNotes.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>📝 Recent Trail Notes / 最近的阅读足迹</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('trail-notes')}>
              View All / 查看全部 →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentNotes.map(note => (
              <div
                key={note.id}
                className="card"
                style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
                onClick={() => navigate('add-trail-note', note.bookId, note.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{getMoodEmoji(note.mood)}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{getBookTitle(note.bookId)}</span>
                    </div>
                    {note.favoritePart && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: 0 }} className="reflection-text">
                        ❤️ {note.favoritePart.slice(0, 100)}{note.favoritePart.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{note.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                      📄 p.{note.pageFrom}–{note.pageTo}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earned badges */}
      {topBadges.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>🏆 My Badges / 我的徽章</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('badges')}>
              View All / 查看全部 →
            </button>
          </div>
          <div className="grid-3">
            {topBadges.map(badge => (
              <div key={badge.id} className="badge-card earned">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.chineseName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouraging message */}
      <div style={{
        textAlign: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--theme-light), white)',
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--theme-color)',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🌟</div>
        <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--theme-dark)' }}>
          Every page you read makes you smarter and kinder!
        </p>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
          你读的每一页都让你更聪明、更善良！
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, labelZh }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{labelZh}</div>
    </div>
  )
}
