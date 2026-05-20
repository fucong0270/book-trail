import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MOOD_OPTIONS } from '../data/sampleData'

const CATEGORY_COLORS = {
  'Historical Fiction': '#3B82F6',
  'Realistic Fiction': '#10B981',
  'Science Fantasy': '#8B5CF6',
  'Adventure': '#F97316',
  'Humor': '#EAB308',
  'Mystery': '#6366F1',
  'Sports': '#EC4899',
  'Biography': '#14B8A6',
  'Fantasy': '#A855F7',
  'Classic': '#78716C',
  'Animal Stories': '#84CC16',
  'Family': '#F43F5E',
  'Survival': '#D97706',
  'Spy Thriller': '#374151',
  'STEM': '#0EA5E9',
  'Picture Book': '#FB923C',
  'Early Reader': '#34D399',
  'Graphic Novel': '#F472B6',
  'Poetry': '#C084FC',
  'Non-Fiction': '#60A5FA',
}

function getMoodEmoji(mood) {
  const found = MOOD_OPTIONS.find(m => m.value === mood)
  return found ? found.emoji : '📖'
}

export default function BookDetail() {
  const {
    books, profiles, selectedBookId, navigate,
    updateBook, getTrailNotesByBook, activeProfile,
    setShowCelebration,
  } = useApp()

  const book = books.find(b => b.id === selectedBookId)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [rating, setRating] = useState(book?.rating || null)
  const [hoverRating, setHoverRating] = useState(0)
  const [hoverFinishRating, setHoverFinishRating] = useState(0)
  const [recommendSibling, setRecommendSibling] = useState(null)
  const [recommendWho, setRecommendWho] = useState([])
  const [recommendReason, setRecommendReason] = useState('')

  if (!book) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Book not found / 找不到这本书</h3>
          <button className="btn btn-primary" onClick={() => navigate('books')}>Back to Books / 返回书架</button>
        </div>
      </div>
    )
  }

  const trailNotes = getTrailNotesByBook(book.id)
  const color = CATEGORY_COLORS[book.category] || 'var(--theme-color)'

  const handleStartReading = () => {
    updateBook(book.id, { status: 'started', startDate: new Date().toISOString().split('T')[0] })
  }

  const handleMarkFinished = () => {
    updateBook(book.id, {
      status: 'finished',
      finishDate: new Date().toISOString().split('T')[0],
      rating,
      recommendToSibling: recommendSibling,
      recommendWho,
      siblingRecommendationReason: recommendReason,
    })
    setConfirmFinish(false)
    setShowCelebration(book.id)
  }

  const toggleRecommendWho = (profileId) => {
    setRecommendWho(prev =>
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    )
  }

  const handleRatingChange = (n) => {
    const newRating = n === rating ? null : n
    setRating(newRating)
    if (book.status === 'finished') {
      updateBook(book.id, { rating: newRating })
    }
  }

  const isAdmin = activeProfile?.role === 'admin'

  return (
    <>
    <div className="page-container animate-fadeIn">
      {/* Back button */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate('books')}>
        ← Back / 返回
      </button>

      {/* Book header card */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          padding: '2rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          {/* Cover block */}
          <div style={{
            width: '90px',
            height: '120px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            📚
          </div>

          <div style={{ color: 'white', flex: 1 }}>
            <h1 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '0.25rem' }}>{book.title}</h1>
            {book.chineseTitle && (
              <div style={{ fontSize: '1rem', opacity: 0.85, marginBottom: '0.4rem' }}>{book.chineseTitle}</div>
            )}
            <div style={{ opacity: 0.85, marginBottom: '0.6rem', fontWeight: 600 }}>✍️ {book.author}</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {book.category && (
                <span style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  borderRadius: '99px',
                  padding: '0.2rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}>
                  {book.category}
                </span>
              )}
              {book.level && (
                <span style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  borderRadius: '99px',
                  padding: '0.2rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}>
                  {book.level}
                </span>
              )}
              {book.lexile && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '99px',
                  padding: '0.2rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}>
                  {book.lexile}
                </span>
              )}
              <span className={`status-badge status-${book.status}`} style={{ background: 'rgba(255,255,255,0.9)' }}>
                {book.status === 'finished' ? '✅ Finished / 读完了' : book.status === 'started' ? '📖 Reading / 阅读中' : '📋 Not Started / 未开始'}
              </span>
            </div>
          </div>
        </div>

        {/* Source */}
        {book.source && (
          <div style={{ padding: '0.6rem 1.5rem', background: 'var(--bg-warm)', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', fontWeight: 600 }}>
              📌 Source / 来源: {book.source}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {book.status === 'not_started' && (
          <button className="btn btn-primary btn-lg" onClick={handleStartReading}>
            📖 Start Reading / 开始阅读
          </button>
        )}
        {book.status === 'started' && (
          <button className="btn btn-primary btn-lg" onClick={() => setConfirmFinish(true)}>
            🎉 Mark as Finished / 标记完成
          </button>
        )}
        {book.status !== 'not_started' && (
          <button className="btn btn-secondary" onClick={() => navigate('add-trail-note', book.id)}>
            📝 Add Trail Note / 写阅读足迹
          </button>
        )}
      </div>

      {/* Rating */}
      {book.status === 'finished' && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="section-title">⭐ My Rating / 我的评分</div>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                className="star"
                style={{
                  color: n <= (hoverRating || rating || 0) ? '#FBBF24' : '#D1D5DB',
                  fontSize: '2rem',
                }}
                onClick={() => handleRatingChange(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          {rating && (
            <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
              {['', '😕 Not my favorite / 不喜欢', '😐 It was okay / 还可以', '😊 Pretty good / 很好', '😃 Really great! / 非常好！', '🤩 Amazing! / 太棒了！'][rating]}
            </div>
          )}
        </div>
      )}

      {/* Dates */}
      {(book.startDate || book.finishDate) && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {book.startDate && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)' }}>📅 Started / 开始</div>
                <div style={{ fontWeight: 800 }}>{book.startDate}</div>
              </div>
            )}
            {book.finishDate && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)' }}>🏁 Finished / 完成</div>
                <div style={{ fontWeight: 800 }}>{book.finishDate}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Favorite quote */}
      {book.favoriteQuote && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="section-title">💬 Favorite Quote / 最喜欢的一句话</div>
          <div className="reflection-text" style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>
            {book.favoriteQuote}
          </div>
        </div>
      )}

      {/* Family recommendation */}
      {book.recommendToSibling !== null && book.recommendToSibling !== undefined && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="section-title">💝 Family Recommendation / 推荐给家人</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>{book.recommendToSibling ? '👍' : '👎'}</span>
            <span style={{ fontWeight: 700, color: book.recommendToSibling ? '#065F46' : '#92400E' }}>
              {book.recommendToSibling ? 'Yes, I recommend this book! / 推荐！' : "Maybe not for everyone / 不一定适合"}
            </span>
          </div>
          {book.recommendWho && book.recommendWho.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {book.recommendWho.map(id => {
                const p = profiles.find(pr => pr.id === id)
                return p ? (
                  <span key={id} style={{
                    background: 'var(--bg-warm)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '99px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}>
                    {p.avatar} {p.name} / {p.chineseName}
                  </span>
                ) : null
              })}
            </div>
          )}
          {book.siblingRecommendationReason && (
            <div className="reflection-text">{book.siblingRecommendationReason}</div>
          )}
        </div>
      )}

      {/* Description */}
      {book.description && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="section-title">📖 About This Book / 关于这本书</div>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', lineHeight: 1.7 }}>{book.description}</p>
        </div>
      )}

      {/* Trail Notes section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            📝 Trail Notes / 阅读足迹
            {trailNotes.length > 0 && (
              <span style={{
                background: 'var(--theme-light)',
                color: 'var(--theme-color)',
                borderRadius: '99px',
                padding: '0.1rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginLeft: '0.35rem',
              }}>
                {trailNotes.length}
              </span>
            )}
          </div>
          {book.status !== 'not_started' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('add-trail-note', book.id)}
            >
              + Add Note / 添加足迹
            </button>
          )}
        </div>

        {trailNotes.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', background: 'var(--bg-warm)', borderRadius: 'var(--radius-lg)' }}>
            <div className="empty-icon">📝</div>
            <h3>No trail notes yet / 还没有阅读足迹</h3>
            <p>Write about what you're reading! / 记录你的阅读想法！</p>
            {book.status !== 'not_started' && (
              <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => navigate('add-trail-note', book.id)}>
                + First Note / 写第一个足迹
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {trailNotes.map(note => (
              <TrailNoteCard key={note.id} note={note} onClick={() => navigate('add-trail-note', book.id, note.id)} />
            ))}
          </div>
        )}
      </div>

    </div>

    {confirmFinish && (
      <FinishModal
        book={book}
        rating={rating}
        setRating={setRating}
        hoverRating={hoverFinishRating}
        setHoverRating={setHoverFinishRating}
        recommendSibling={recommendSibling}
        setRecommendSibling={setRecommendSibling}
        recommendWho={recommendWho}
        setRecommendWho={setRecommendWho}
        toggleRecommendWho={toggleRecommendWho}
        recommendReason={recommendReason}
        setRecommendReason={setRecommendReason}
        profiles={profiles}
        activeProfileId={activeProfile?.id}
        onClose={() => setConfirmFinish(false)}
        onConfirm={handleMarkFinished}
      />
    )}
    </>
  )
}

function TrailNoteCard({ note, onClick }) {
  return (
    <div
      className="card"
      style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{getMoodEmoji(note.mood)}</span>
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
              📄 p.{note.pageFrom} – {note.pageTo}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
              ({note.totalPagesRead} pages / 页)
            </span>
          </div>

          {(note.notes || note.favoritePart) && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: '0.3rem', lineHeight: 1.5 }}>
              ✏️ {(note.notes || note.favoritePart).slice(0, 120)}{(note.notes || note.favoritePart).length > 120 ? '…' : ''}
            </p>
          )}

          {note.vocabularyWords && note.vocabularyWords.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {note.vocabularyWords.slice(0, 3).map(w => (
                <span key={w.id} className="tag" style={{ fontSize: '0.72rem' }}>🔤 {w.word}</span>
              ))}
              {note.vocabularyWords.length > 3 && (
                <span className="tag" style={{ fontSize: '0.72rem' }}>+{note.vocabularyWords.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)' }}>{note.date}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>✏️ Edit / 编辑</div>
        </div>
      </div>
    </div>
  )
}

function FinishModal({
  book, rating, setRating, hoverRating, setHoverRating,
  recommendSibling, setRecommendSibling,
  recommendWho, setRecommendWho, toggleRecommendWho,
  recommendReason, setRecommendReason,
  profiles, activeProfileId, onClose, onConfirm,
}) {
  const familyMembers = profiles.filter(p => p.id !== activeProfileId)
  const allSelected = familyMembers.length > 0 && familyMembers.every(p => recommendWho.includes(p.id))
  const toggleAll = () => {
    if (allSelected) setRecommendWho([])
    else setRecommendWho(familyMembers.map(p => p.id))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box animate-scaleIn"
        style={{ maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>🎉 You finished a book!</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
              太棒了！你读完了一本书！
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{book.title}</div>
            {book.chineseTitle && (
              <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{book.chineseTitle}</div>
            )}
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">⭐ My Rating / 我的评分</label>
            <div className="star-rating" style={{ gap: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  className="star"
                  style={{ color: n <= (hoverRating || rating || 0) ? '#FBBF24' : '#D1D5DB', fontSize: '2.2rem' }}
                  onClick={() => setRating(n === rating ? null : n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            {rating && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
                {['', '😕 Not my favorite / 不喜欢', '😐 It was okay / 还可以', '😊 Pretty good! / 很好！', '😃 Really great! / 非常好！', '🤩 Amazing!! / 太棒了！'][rating]}
              </div>
            )}
          </div>

          {/* Family recommendation */}
          <div className="form-group">
            <label className="form-label">💝 Family Recommendation / 推荐给家人吗？</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { v: true, l: '👍 Yes! / 推荐！' },
                { v: false, l: '👎 Not really / 不太推荐' },
                { v: null, l: '🤔 Not sure / 不确定' },
              ].map(opt => (
                <button
                  key={String(opt.v)}
                  type="button"
                  className={`btn btn-sm ${recommendSibling === opt.v ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setRecommendSibling(opt.v)}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Who to recommend to */}
          {recommendSibling === true && familyMembers.length > 0 && (
            <div className="form-group">
              <label className="form-label">👥 Recommend to... / 推荐给谁？</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${allSelected ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={toggleAll}
                  style={{ fontWeight: 800 }}
                >
                  🌟 ALL / 所有人
                </button>
                {familyMembers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`btn btn-sm ${recommendWho.includes(p.id) ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => toggleRecommendWho(p.id)}
                  >
                    {p.avatar} {p.name} / {p.chineseName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommendSibling === true && (
            <div className="form-group">
              <label className="form-label">💌 Why? / 为什么推荐？</label>
              <textarea
                className="form-textarea"
                value={recommendReason}
                onChange={e => setRecommendReason(e.target.value)}
                placeholder="Tell them why they should read it! / 告诉他们为什么应该读这本书！"
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Not Yet / 还没</button>
          <button className="btn btn-primary btn-lg" onClick={onConfirm}>
            🎉 Yes, Finished! / 读完了！
          </button>
        </div>
      </div>
    </div>
  )
}
