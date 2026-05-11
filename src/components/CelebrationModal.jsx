import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF922B', '#CC5DE8', '#20C997', '#F06595',
  '#74C0FC', '#FFA94D', '#A9E34B', '#E599F7',
]

function ConfettiPiece({ color, left, delay, duration, size, shape }) {
  return (
    <div
      className="confetti-piece"
      style={{
        left: `${left}%`,
        top: '-20px',
        backgroundColor: color,
        width: size,
        height: shape === 'circle' ? size : size * 0.6,
        borderRadius: shape === 'circle' ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

const MESSAGES_EN = [
  "Amazing! You finished a book! 🎉",
  "You're a reading superstar! ⭐",
  "Another adventure completed! 🗺️",
  "Incredible reading! Keep it up! 📚",
]

const MESSAGES_ZH = [
  "太棒了！你读完了一本书！🎉",
  "你是阅读小超人！⭐",
  "又完成了一段阅读旅程！🗺️",
  "太厉害了！继续加油！📚",
]

export default function CelebrationModal({ bookId, onClose }) {
  const { books, navigate, setShowCelebration } = useApp()
  const [pieces, setPieces] = useState([])

  const book = books.find(b => b.id === bookId)

  useEffect(() => {
    const generated = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      size: 8 + Math.random() * 8,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }))
    setPieces(generated)
  }, [])

  const msgIdx = Math.floor(Math.random() * MESSAGES_EN.length)

  const handleAddNote = () => {
    setShowCelebration(null)
    navigate('add-trail-note', bookId)
  }

  const handleClose = () => {
    setShowCelebration(null)
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      style={{
        background: 'rgba(0,0,0,0.7)',
        zIndex: 2000,
      }}
    >
      {/* Confetti */}
      {pieces.map(p => (
        <ConfettiPiece key={p.id} {...p} />
      ))}

      <div
        className="modal-box animate-scaleIn"
        style={{
          textAlign: 'center',
          padding: '2.5rem 2rem',
          maxWidth: '460px',
          background: 'linear-gradient(135deg, #FFFBF5, #FFF0F8)',
          border: '3px solid var(--theme-color)',
          position: 'relative',
          zIndex: 2001,
        }}
      >
        <div style={{ fontSize: '4rem', animation: 'popIn 0.5s ease' }}>⭐</div>
        <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🎉🎊🎉</div>

        <h2 style={{
          fontSize: '1.6rem',
          color: 'var(--theme-color)',
          margin: '0.5rem 0',
        }}>
          Book Finished!<br />
          <span style={{ fontSize: '1.2rem' }}>读完啦！</span>
        </h2>

        {book && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem',
            margin: '1rem 0',
            border: '2px solid var(--theme-light)',
          }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              📚 {book.title}
            </div>
            {book.chineseTitle && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                {book.chineseTitle}
              </div>
            )}
          </div>
        )}

        <p style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: '0.5rem 0',
        }}>
          {MESSAGES_EN[msgIdx]}
        </p>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-soft)',
          margin: '0.25rem 0 1.25rem',
        }}>
          {MESSAGES_ZH[msgIdx]}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button className="btn btn-primary btn-lg" onClick={handleAddNote}>
            📝 Add a Trail Note / 写阅读足迹
          </button>
          <button className="btn btn-ghost" onClick={handleClose}>
            Close / 关闭
          </button>
        </div>
      </div>
    </div>
  )
}
