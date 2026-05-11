import { useApp } from '../context/AppContext'
import { BADGES_CONFIG } from '../data/sampleData'

function getProgressHint(badge, stats) {
  const condition = badge.condition
  const match = condition.match(/(\w+)\s*(>=|>|===|==)\s*(\d+)/)
  if (!match) return null
  const [, key, , val] = match
  const current = stats[key] || 0
  const target = parseInt(val)
  if (current >= target) return null
  return { current, target, remaining: target - current }
}

const STAT_KEY_LABELS = {
  booksFinished: 'books finished / 读完的书',
  trailNotes: 'trail notes / 阅读足迹',
  vocabularyWords: 'vocabulary words / 词语',
  pagesRead: 'pages read / 已读页数',
  siblingRecommendations: 'sibling recommendations / 推荐',
  categoriesRead: 'categories / 类型',
}

export default function BadgesPage() {
  const { activeProfile, computeBadges, getReaderStats } = useApp()

  if (!activeProfile) return null

  const stats = getReaderStats(activeProfile.id)
  const earnedBadges = computeBadges(activeProfile.id)
  const earnedIds = new Set(earnedBadges.map(b => b.id))
  const lockedBadges = BADGES_CONFIG.filter(b => !earnedIds.has(b.id))

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>🏆 My Badges / 我的徽章</h1>
      </div>

      {/* Stats overview */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="section-title">📊 My Reading Stats / 我的阅读数据</div>
        <div className="grid-4">
          <MiniStat icon="📚" value={stats.booksFinished} label="Books Finished" labelZh="读完的书" />
          <MiniStat icon="📄" value={stats.totalPagesRead} label="Pages Read" labelZh="已读页数" />
          <MiniStat icon="📝" value={stats.trailNotes} label="Trail Notes" labelZh="阅读足迹" />
          <MiniStat icon="🔤" value={stats.vocabularyWords} label="New Words" labelZh="新词语" />
        </div>
      </div>

      {/* Earned badges */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="section-title">
          🌟 Earned Badges / 已获徽章
          <span style={{
            background: 'var(--theme-color)',
            color: 'white',
            borderRadius: '99px',
            padding: '0.1rem 0.55rem',
            fontSize: '0.75rem',
            marginLeft: '0.35rem',
          }}>
            {earnedBadges.length}
          </span>
        </div>

        {earnedBadges.length === 0 ? (
          <div className="empty-state" style={{
            padding: '2rem',
            background: 'var(--bg-warm)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--border)',
          }}>
            <div className="empty-icon">🏆</div>
            <h3>Keep reading to earn your first badge!</h3>
            <p>继续阅读来获得你的第一个徽章！</p>
          </div>
        ) : (
          <div className="grid-4">
            {earnedBadges.map(badge => (
              <div key={badge.id} className="badge-card earned" style={{ animation: 'popIn 0.4s ease' }}>
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--theme-dark)', fontWeight: 700 }}>
                  {badge.chineseName}
                </div>
                <div className="badge-desc">{badge.description}</div>
                <div style={{
                  background: 'var(--theme-color)',
                  color: 'white',
                  borderRadius: '99px',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  marginTop: '0.25rem',
                }}>
                  ✓ Earned! / 获得！
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked badges */}
      {lockedBadges.length > 0 && (
        <div>
          <div className="section-title">
            🔒 Badges to Unlock / 待解锁徽章
            <span style={{
              background: 'var(--border)',
              color: 'var(--text-soft)',
              borderRadius: '99px',
              padding: '0.1rem 0.55rem',
              fontSize: '0.75rem',
              marginLeft: '0.35rem',
            }}>
              {lockedBadges.length}
            </span>
          </div>

          <div className="grid-4">
            {lockedBadges.map(badge => {
              const hint = getProgressHint(badge, stats)
              const condition = badge.condition
              const match = condition.match(/(\w+)\s*(>=|>)\s*(\d+)/)
              const key = match?.[1]
              const keyLabel = key ? STAT_KEY_LABELS[key] : ''

              return (
                <div key={badge.id} className="badge-card locked">
                  <div className="badge-icon" style={{ filter: 'grayscale(1)' }}>{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', fontWeight: 700 }}>
                    {badge.chineseName}
                  </div>
                  <div className="badge-desc">{badge.description}</div>
                  {hint && (
                    <div style={{ width: '100%', marginTop: '0.5rem' }}>
                      {/* Progress bar */}
                      <div style={{
                        width: '100%',
                        height: '5px',
                        background: 'var(--border)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginBottom: '0.3rem',
                      }}>
                        <div style={{
                          width: `${Math.min(100, Math.round((hint.current / hint.target) * 100))}%`,
                          height: '100%',
                          background: 'var(--text-light)',
                          borderRadius: '3px',
                        }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                        {hint.current} / {hint.target} {keyLabel}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Encouraging message */}
      {earnedBadges.length > 0 && (
        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          padding: '1.5rem',
          background: 'var(--theme-light)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌟</div>
          <p style={{ fontWeight: 800, color: 'var(--theme-dark)' }}>
            You've earned {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}! You're amazing!
          </p>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            你获得了{earnedBadges.length}个徽章！你太棒了！
          </p>
        </div>
      )}
    </div>
  )
}

function MiniStat({ icon, value, label, labelZh }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '0.75rem',
      background: 'var(--bg-warm)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--theme-color)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginTop: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{labelZh}</div>
    </div>
  )
}
