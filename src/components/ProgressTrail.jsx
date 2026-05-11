import { useApp } from '../context/AppContext'

const ENCOURAGEMENT = [
  { min: 0, msg: "Every journey starts with a single step! 每段旅程从第一步开始！", icon: "🌱" },
  { min: 1, msg: "Great start! Keep exploring! 开始了，继续探索！", icon: "🌿" },
  { min: 3, msg: "You're on a roll! 你势不可挡！", icon: "🌳" },
  { min: 5, msg: "Wow, halfway to an amazing adventure! 厉害，继续前进！", icon: "⭐" },
  { min: 8, msg: "You're a reading champion! 你是阅读冠军！", icon: "🏆" },
  { min: 12, msg: "Incredible reader! Your trail is legendary! 超级厉害的读者！", icon: "🌟" },
]

function getMessage(count) {
  for (let i = ENCOURAGEMENT.length - 1; i >= 0; i--) {
    if (count >= ENCOURAGEMENT[i].min) return ENCOURAGEMENT[i]
  }
  return ENCOURAGEMENT[0]
}

export default function ProgressTrail({ readerId }) {
  const { getBooksByReader, getReaderStats } = useApp()
  const books = getBooksByReader(readerId)
  const stats = getReaderStats(readerId)

  const displayBooks = books.slice(0, 20)
  const finishedCount = books.filter(b => b.status === 'finished').length
  const msg = getMessage(finishedCount)

  const getStoneClass = (status) => {
    if (status === 'finished') return 'done'
    if (status === 'started') return 'current'
    return 'empty'
  }

  const getStoneContent = (status) => {
    if (status === 'finished') return '✓'
    if (status === 'started') return '📖'
    return '·'
  }

  // Pad to at least 10 stones for visual effect
  const totalSlots = Math.max(displayBooks.length + 2, 10)
  const stones = [
    ...displayBooks.map(b => ({ id: b.id, status: b.status, title: b.title })),
    ...Array.from({ length: Math.max(0, totalSlots - displayBooks.length) }, (_, i) => ({
      id: `empty-${i}`,
      status: 'not_started',
      title: '',
    }))
  ]

  return (
    <div style={{ width: '100%' }}>
      <div className="trail-container">
        {stones.map((stone, idx) => (
          <div key={stone.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div className="trail-step">
              <div
                className={`trail-stone ${getStoneClass(stone.status)}`}
                title={stone.title || ''}
              >
                {getStoneContent(stone.status)}
              </div>
              {stone.title && (
                <div style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-light)',
                  maxWidth: '48px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {stone.status !== 'not_started' ? stone.title.slice(0, 8) : ''}
                </div>
              )}
            </div>
            {idx < stones.length - 1 && (
              <div className={`trail-connector ${stone.status === 'finished' ? 'done' : 'empty'}`} />
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          color: 'var(--text-soft)',
          fontWeight: 700,
        }}>
          <span style={{ fontSize: '1.25rem' }}>{msg.icon}</span>
          <span>{msg.msg}</span>
        </div>
        {stats.totalPagesRead > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--theme-light)',
            color: 'var(--theme-dark)',
            borderRadius: '99px',
            padding: '0.3rem 0.85rem',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}>
            📄 {stats.totalPagesRead} pages read / 已读页数
          </div>
        )}
      </div>
    </div>
  )
}
