import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MOOD_OPTIONS } from '../data/sampleData'

function getMoodEmoji(mood) {
  const found = MOOD_OPTIONS.find(m => m.value === mood)
  return found ? found.emoji : '📖'
}

export default function TrailNotesList() {
  const {
    activeProfile, books, trailNotes,
    getTrailNotesByReader, deleteTrailNote, navigate,
  } = useApp()

  const [bookFilter, setBookFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const isAdmin = activeProfile?.role === 'admin'

  const myNotes = isAdmin
    ? [...trailNotes].sort((a, b) => new Date(b.date) - new Date(a.date))
    : getTrailNotesByReader(activeProfile?.id)

  const myBooks = isAdmin
    ? books
    : books.filter(b => b.readerId === activeProfile?.id)

  const filtered = myNotes
    .filter(n => bookFilter === 'all' || n.bookId === bookFilter)
    .filter(n => !dateFrom || n.date >= dateFrom)
    .filter(n => !dateTo || n.date <= dateTo)

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : 'Unknown Book'
  }

  const getBookChineseTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book?.chineseTitle || ''
  }

  const handleDelete = (noteId) => {
    deleteTrailNote(noteId)
    setDeleteConfirm(null)
  }

  const totalPages = filtered.reduce((sum, n) => sum + (n.totalPagesRead || 0), 0)
  const totalWords = filtered.reduce((sum, n) => sum + (n.vocabularyWords?.length || 0), 0)

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>📝 Trail Notes / 阅读足迹</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            background: 'var(--theme-light)',
            color: 'var(--theme-dark)',
            borderRadius: '99px',
            padding: '0.25rem 0.85rem',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}>
            {filtered.length} notes / 个足迹
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '1.25rem' }}>📝</div>
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">Trail Notes / 阅读足迹</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '1.25rem' }}>📄</div>
          <div className="stat-value">{totalPages}</div>
          <div className="stat-label">Pages Read / 已读页数</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '1.25rem' }}>🔤</div>
          <div className="stat-value">{totalWords}</div>
          <div className="stat-label">Vocabulary Words / 词语</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '160px' }}>
            <label className="form-label">📚 Filter by Book / 按书筛选</label>
            <select className="form-select" value={bookFilter} onChange={e => setBookFilter(e.target.value)}>
              <option value="all">All Books / 全部书</option>
              {myBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">📅 From / 从</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">📅 To / 到</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          {(bookFilter !== 'all' || dateFrom || dateTo) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setBookFilter('all'); setDateFrom(''); setDateTo('') }}
            >
              ✕ Clear / 清除
            </button>
          )}
        </div>
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: '2.5rem' }}>
          <div className="empty-icon">📝</div>
          <h3>No trail notes yet / 还没有阅读足迹</h3>
          <p>Start reading and write your first trail note! / 开始阅读，写下你的第一个足迹！</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('books')}>
            Go to My Books / 去书架
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map(note => (
            <TrailNoteCard
              key={note.id}
              note={note}
              bookTitle={getBookTitle(note.bookId)}
              bookChineseTitle={getBookChineseTitle(note.bookId)}
              isAdmin={isAdmin}
              onEdit={() => navigate('add-trail-note', note.bookId, note.id)}
              onDelete={() => setDeleteConfirm(note.id)}
              onViewBook={() => navigate('book-detail', note.bookId)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box animate-scaleIn" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Delete Trail Note / 删除阅读足迹</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-soft)' }}>
                Are you sure you want to delete this trail note? This cannot be undone.<br />
                确定要删除这个阅读足迹吗？此操作无法撤消。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel / 取消</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete / 删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TrailNoteCard({ note, bookTitle, bookChineseTitle, isAdmin, onEdit, onDelete, onViewBook }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
          {/* Top row: mood + book + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.3rem' }}>{getMoodEmoji(note.mood)}</span>
            <button
              style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={(e) => { e.stopPropagation(); onViewBook() }}
            >
              {bookTitle}
            </button>
            {bookChineseTitle && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{bookChineseTitle}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
              📅 {note.date}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
              📄 p.{note.pageFrom}–{note.pageTo} ({note.totalPagesRead} pages)
            </span>
            {note.vocabularyWords?.length > 0 && (
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                🔤 {note.vocabularyWords.length} words
              </span>
            )}
          </div>

          {note.favoritePart && !expanded && (
            <p style={{
              fontSize: '0.83rem',
              color: 'var(--text-soft)',
              lineHeight: 1.5,
              borderLeft: '3px solid var(--theme-color)',
              paddingLeft: '0.6rem',
            }}>
              ❤️ {note.favoritePart.slice(0, 140)}{note.favoritePart.length > 140 ? '...' : ''}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>✏️ Edit</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>🗑️</button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {note.favoritePart && (
              <NoteField icon="❤️" label="Favorite Part / 最喜欢的部分" value={note.favoritePart} />
            )}
            {note.summary && (
              <NoteField icon="📋" label="What Happened / 发生了什么" value={note.summary} />
            )}
            {note.learned && (
              <NoteField icon="💡" label="What I Learned / 我学到了什么" value={note.learned} />
            )}
            {note.feeling && (
              <NoteField icon="💬" label="My Feeling / 我的感受" value={note.feeling} />
            )}
            {note.favoriteQuote && (
              <NoteField icon="💬" label="Favorite Quote / 最喜欢的一句话" value={note.favoriteQuote} italic />
            )}
            {note.question && (
              <NoteField icon="❓" label="My Question / 我的问题" value={note.question} />
            )}
            {note.connection && (
              <NoteField icon="🔗" label="My Connection / 我的联想" value={note.connection} />
            )}
            {note.recommendToSibling !== null && note.recommendToSibling !== undefined && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.25rem' }}>
                  💝 Sibling Recommendation / 推荐给兄弟姐妹
                </div>
                <div style={{ fontWeight: 700 }}>
                  {note.recommendToSibling ? '👍 Recommended / 推荐' : '👎 Not Recommended / 不推荐'}
                </div>
                {note.siblingRecommendationReason && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                    {note.siblingRecommendationReason}
                  </p>
                )}
              </div>
            )}
            {note.vocabularyWords?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.5rem' }}>
                  🔤 Vocabulary Words / 词语 ({note.vocabularyWords.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {note.vocabularyWords.map(w => (
                    <div
                      key={w.id}
                      className={`vocab-card${w.mastered ? ' mastered' : ''}`}
                      style={{ fontSize: '0.82rem' }}
                    >
                      <span style={{ fontWeight: 800 }}>{w.word}</span>
                      {' '}
                      <span className="tag" style={{ fontSize: '0.7rem' }}>{w.partOfSpeech}</span>
                      {' '}— {w.meaning}
                      {w.exampleSentence && (
                        <div style={{ marginTop: '0.2rem', color: 'var(--text-soft)', fontStyle: 'italic' }}>
                          "{w.exampleSentence}"
                        </div>
                      )}
                      {w.mastered && <span style={{ float: 'right', color: '#065F46', fontWeight: 700 }}>✅ Mastered</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '0.75rem' }}
            onClick={() => setExpanded(false)}
          >
            ▲ Show Less / 收起
          </button>
        </div>
      )}

      {!expanded && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}
          onClick={() => setExpanded(true)}
        >
          ▼ View Full Note / 查看全部
        </button>
      )}
    </div>
  )
}

function NoteField({ icon, label, value, italic }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.2rem' }}>
        {icon} {label}
      </div>
      <div className="reflection-text" style={{ fontStyle: italic ? 'italic' : 'normal', fontSize: '0.87rem' }}>
        {value}
      </div>
    </div>
  )
}
