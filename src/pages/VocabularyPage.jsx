import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { PARTS_OF_SPEECH } from '../data/sampleData'

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First / 最新' },
  { value: 'date-asc', label: 'Oldest First / 最早' },
  { value: 'alpha', label: 'A–Z / 字母顺序' },
]

export default function VocabularyPage() {
  const { activeProfile, getAllVocabularyByReader, books, updateTrailNote, trailNotes } = useApp()

  const [posFilter, setPosFilter] = useState('all')
  const [masteredFilter, setMasteredFilter] = useState('all')
  const [bookFilter, setBookFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [search, setSearch] = useState('')

  const myBooks = books.filter(b => b.readerId === activeProfile?.id)
  const allVocab = getAllVocabularyByReader(activeProfile?.id || '')

  const filtered = useMemo(() => {
    let list = [...allVocab]

    if (posFilter !== 'all') list = list.filter(w => w.partOfSpeech === posFilter)
    if (masteredFilter === 'mastered') list = list.filter(w => w.mastered)
    if (masteredFilter === 'not-mastered') list = list.filter(w => !w.mastered)
    if (bookFilter !== 'all') list = list.filter(w => w.bookId === bookFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(w =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'alpha') return a.word.localeCompare(b.word)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      return new Date(b.date) - new Date(a.date)
    })

    return list
  }, [allVocab, posFilter, masteredFilter, bookFilter, sortBy, search])

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : 'Unknown'
  }

  const masteredCount = allVocab.filter(w => w.mastered).length

  const handleToggleMastered = (word) => {
    const note = trailNotes.find(n => n.id === word.trailNoteId)
    if (!note) return
    const updatedWords = note.vocabularyWords.map(w =>
      w.id === word.id ? { ...w, mastered: !w.mastered } : w
    )
    updateTrailNote(note.id, { vocabularyWords: updatedWords })
  }

  const usedPos = [...new Set(allVocab.map(w => w.partOfSpeech).filter(Boolean))]
  const booksWithWords = [...new Set(allVocab.map(w => w.bookId))]

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>🔤 Vocabulary / 词语积累</h1>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '1.25rem' }}>🔤</div>
          <div className="stat-value">{allVocab.length}</div>
          <div className="stat-label">Total Words / 总词语</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '1.25rem' }}>✅</div>
          <div className="stat-value">{masteredCount}</div>
          <div className="stat-label">Mastered / 已掌握</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '1.25rem' }}>📖</div>
          <div className="stat-value">{allVocab.length - masteredCount}</div>
          <div className="stat-label">Still Learning / 学习中</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
            <label className="form-label">🔍 Search / 搜索</label>
            <input
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search word or meaning..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">📚 Book / 书</label>
            <select className="form-select" value={bookFilter} onChange={e => setBookFilter(e.target.value)}>
              <option value="all">All Books / 全部书</option>
              {booksWithWords.map(id => (
                <option key={id} value={id}>{getBookTitle(id)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">🏷️ Sort / 排序</label>
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {/* Mastered filter */}
          {[
            { v: 'all', l: 'All / 全部' },
            { v: 'mastered', l: '✅ Mastered / 已掌握' },
            { v: 'not-mastered', l: '📖 Still Learning / 学习中' },
          ].map(opt => (
            <button
              key={opt.v}
              className={`filter-chip${masteredFilter === opt.v ? ' active' : ''}`}
              onClick={() => setMasteredFilter(opt.v)}
            >
              {opt.l}
            </button>
          ))}

          <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem' }} />

          {/* POS filter */}
          <button
            className={`filter-chip${posFilter === 'all' ? ' active' : ''}`}
            onClick={() => setPosFilter('all')}
          >
            All Parts of Speech / 所有词性
          </button>
          {usedPos.map(pos => {
            const posInfo = PARTS_OF_SPEECH.find(p => p.value === pos)
            return (
              <button
                key={pos}
                className={`filter-chip${posFilter === pos ? ' active' : ''}`}
                onClick={() => setPosFilter(pos)}
              >
                {posInfo ? posInfo.label : pos}
              </button>
            )
          })}
        </div>
      </div>

      {/* Word count */}
      {filtered.length !== allVocab.length && (
        <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 600 }}>
          Showing {filtered.length} of {allVocab.length} words / 显示 {filtered.length}/{allVocab.length} 个词
        </div>
      )}

      {/* Vocab grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: '2.5rem' }}>
          <div className="empty-icon">🔤</div>
          <h3>
            {allVocab.length === 0 ? 'No vocabulary yet / 还没有词语' : 'No words match your filters / 没有匹配的词语'}
          </h3>
          <p>
            {allVocab.length === 0
              ? 'Add vocabulary words in your trail notes! / 在阅读足迹中添加新词！'
              : 'Try clearing some filters. / 试试清除筛选条件。'
            }
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(word => (
            <VocabCard
              key={`${word.id}-${word.trailNoteId}`}
              word={word}
              bookTitle={getBookTitle(word.bookId)}
              onToggleMastered={() => handleToggleMastered(word)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VocabCard({ word, bookTitle, onToggleMastered }) {
  const posInfo = PARTS_OF_SPEECH.find(p => p.value === word.partOfSpeech)

  return (
    <div
      className={`vocab-card${word.mastered ? ' mastered' : ''}`}
      style={{ position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--theme-color)' }}>
          {word.word}
        </div>
        <button
          className={`btn btn-sm ${word.mastered ? 'btn-success' : 'btn-ghost'}`}
          onClick={onToggleMastered}
          title={word.mastered ? 'Click to unmark mastered' : 'Click to mark as mastered'}
          style={{ flexShrink: 0 }}
        >
          {word.mastered ? '✅' : '⬜'}
        </button>
      </div>

      {posInfo && (
        <span style={{
          display: 'inline-block',
          background: 'var(--theme-light)',
          color: 'var(--theme-dark)',
          borderRadius: '99px',
          padding: '0.1rem 0.55rem',
          fontSize: '0.7rem',
          fontWeight: 800,
          marginBottom: '0.4rem',
        }}>
          {posInfo.label}
        </span>
      )}

      {word.meaning && (
        <p style={{ fontSize: '0.83rem', color: 'var(--text-main)', marginBottom: '0.35rem', lineHeight: 1.5 }}>
          {word.meaning}
        </p>
      )}

      {word.exampleSentence && (
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-soft)',
          fontStyle: 'italic',
          borderLeft: '2px solid var(--border)',
          paddingLeft: '0.5rem',
          marginBottom: '0.4rem',
          lineHeight: 1.4,
        }}>
          "{word.exampleSentence}"
        </p>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.4rem',
        paddingTop: '0.4rem',
        borderTop: '1px solid var(--border)',
        fontSize: '0.72rem',
        color: 'var(--text-light)',
        fontWeight: 600,
      }}>
        <span>📚 {bookTitle.slice(0, 20)}{bookTitle.length > 20 ? '...' : ''}</span>
        <span>📅 {word.date}</span>
      </div>

      {word.mastered && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--success)',
        }} />
      )}
    </div>
  )
}
