import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { MOOD_OPTIONS, PARTS_OF_SPEECH } from '../data/sampleData'
import WritingCluesModal from '../components/WritingCluesModal'

const EMPTY_VOCAB = () => ({
  id: `v${Date.now()}_${Math.random().toString(36).slice(2)}`,
  word: '',
  partOfSpeech: 'noun',
  meaning: '',
  exampleSentence: '',
  mastered: false,
})

function buildEmptyNote(bookId, readerId) {
  return {
    bookId,
    readerId,
    date: new Date().toISOString().split('T')[0],
    pageFrom: '',
    pageTo: '',
    totalPagesRead: '',
    notes: '',       // single free-write field
    mood: '',
    vocabularyWords: [],
    // legacy fields kept for data compatibility
    favoritePart: '', summary: '', learned: '', feeling: '',
    favoriteQuote: '', question: '', connection: '',
    recommendToSibling: null, siblingRecommendationReason: '',
  }
}

export default function TrailNoteForm() {
  const {
    books, trailNotes, activeProfile,
    selectedBookId, editingTrailNoteId, setEditingTrailNoteId,
    addTrailNote, updateTrailNote, navigate,
  } = useApp()

  const isEditing = !!editingTrailNoteId
  const existingNote = isEditing ? trailNotes.find(n => n.id === editingTrailNoteId) : null
  const book = books.find(b => b.id === (existingNote?.bookId || selectedBookId))

  const [form, setForm] = useState(() => {
    if (existingNote) {
      return {
        ...buildEmptyNote(existingNote.bookId, existingNote.readerId),
        ...existingNote,
        pageFrom: existingNote.pageFrom?.toString() || '',
        pageTo: existingNote.pageTo?.toString() || '',
        totalPagesRead: existingNote.totalPagesRead?.toString() || '',
        notes: existingNote.notes || existingNote.favoritePart || existingNote.summary || '',
        vocabularyWords: existingNote.vocabularyWords
          ? existingNote.vocabularyWords.map(w => ({ ...w }))
          : [],
      }
    }
    return buildEmptyNote(selectedBookId, activeProfile?.id)
  })

  const [showWritingClues, setShowWritingClues] = useState(false)

  useEffect(() => {
    const from = parseInt(form.pageFrom)
    const to = parseInt(form.pageTo)
    if (!isNaN(from) && !isNaN(to) && to >= from) {
      setForm(prev => ({ ...prev, totalPagesRead: String(to - from + 1) }))
    }
  }, [form.pageFrom, form.pageTo])

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = () => {
    const noteData = {
      ...form,
      pageFrom: parseInt(form.pageFrom) || 0,
      pageTo: parseInt(form.pageTo) || 0,
      totalPagesRead: parseInt(form.totalPagesRead) || 0,
    }
    if (isEditing) {
      updateTrailNote(editingTrailNoteId, noteData)
      setEditingTrailNoteId(null)
    } else {
      addTrailNote(noteData)
    }
    navigate('book-detail', noteData.bookId)
  }

  const handleCancel = () => {
    setEditingTrailNoteId(null)
    navigate('book-detail', form.bookId || selectedBookId)
  }

  const addVocab = () =>
    setForm(prev => ({ ...prev, vocabularyWords: [...prev.vocabularyWords, EMPTY_VOCAB()] }))

  const updateVocab = (id, field, value) =>
    setForm(prev => ({
      ...prev,
      vocabularyWords: prev.vocabularyWords.map(w => w.id === id ? { ...w, [field]: value } : w),
    }))

  const removeVocab = (id) =>
    setForm(prev => ({ ...prev, vocabularyWords: prev.vocabularyWords.filter(w => w.id !== id) }))

  return (
    <>
      <div className="page-container animate-fadeIn">
        {/* Header */}
        <div className="page-header">
          <button className="btn btn-ghost btn-sm" onClick={handleCancel}>← Back / 返回</button>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>
              {isEditing ? '✏️ Edit Trail Note / 编辑阅读足迹' : '📝 New Trail Note / 新阅读足迹'}
            </h1>
            {book && (
              <p style={{ color: 'var(--text-soft)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                📚 {book.title}{book.chineseTitle ? ` · ${book.chineseTitle}` : ''}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ── Section 1: Date & Pages ── */}
          <Section icon="📅" title="Date & Pages / 日期和页数">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">📅 Date / 日期</label>
                <input type="date" className="form-input" value={form.date} onChange={f('date')} />
              </div>
              <div className="form-group">
                <label className="form-label">📖 From Page / 开始页</label>
                <input
                  type="number" className="form-input" value={form.pageFrom}
                  onChange={f('pageFrom')} placeholder="e.g. 1" min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label">📖 To Page / 结束页</label>
                <input
                  type="number" className="form-input" value={form.pageTo}
                  onChange={f('pageTo')} placeholder="e.g. 45" min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label">📄 Total / 总页数</label>
                <input
                  type="number" className="form-input" value={form.totalPagesRead}
                  onChange={f('totalPagesRead')} placeholder="Auto / 自动"
                  style={{ background: 'var(--bg-warm)' }}
                />
              </div>
            </div>
          </Section>

          {/* ── Section 2: Reading Mood ── */}
          <Section icon="😊" title="Reading Mood / 阅读心情">
            <div className="mood-grid">
              {MOOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`mood-btn${form.mood === opt.value ? ' selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, mood: prev.mood === opt.value ? '' : opt.value }))}
                >
                  <span className="mood-emoji">{opt.emoji}</span>
                  <span className="mood-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* ── Section 3: My Notes ── */}
          <Section
            icon="✏️"
            title="My Notes / 我的阅读笔记"
            action={
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowWritingClues(true)}
                style={{ flexShrink: 0 }}
              >
                💡 Writing Clues / 写作提示
              </button>
            }
          >
            <textarea
              className="form-textarea"
              value={form.notes}
              onChange={f('notes')}
              placeholder={
                "Write anything about what you read today!\n" +
                "You can write about: what happened, how you felt, your favorite part, a quote you loved, questions you have, or what this story reminds you of.\n\n" +
                "不知道怎么写？点击 💡 写作提示 找找灵感！\n" +
                "你可以写：发生了什么、你的感受、最喜欢的部分、喜欢的句子、你的问题……随便写！"
              }
              rows={10}
              style={{ fontSize: '0.95rem', lineHeight: 1.8 }}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.4rem', fontStyle: 'italic' }}>
              💡 Don't know what to write? Click "Writing Clues" above for ideas and formats! / 不知道写什么？点上面的"写作提示"找灵感！
            </p>
          </Section>

          {/* ── Section 4: Vocabulary ── */}
          <Section
            icon="🔤"
            title="New Words / 新词积累"
            action={
              <button className="btn btn-secondary btn-sm" onClick={addVocab}>
                + Add Word / 添加新词
              </button>
            }
          >
            {form.vocabularyWords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-light)', fontSize: '0.88rem' }}>
                Did you find any new or interesting words? / 有没有遇到有趣的新词？
              </div>
            ) : (
              form.vocabularyWords.map((vocab, idx) => (
                <VocabEntry
                  key={vocab.id}
                  vocab={vocab}
                  index={idx}
                  onChange={updateVocab}
                  onRemove={removeVocab}
                />
              ))
            )}
            {form.vocabularyWords.length > 0 && (
              <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.25rem' }} onClick={addVocab}>
                + Add Another Word / 再添加一个词
              </button>
            )}
          </Section>
        </div>

        {/* Save / Cancel bar */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          marginTop: '1.5rem', padding: '1rem 0',
          borderTop: '1px solid var(--border)',
          position: 'sticky', bottom: 0, background: 'var(--bg-warm)',
        }}>
          <button className="btn btn-ghost" onClick={handleCancel}>Cancel / 取消</button>
          <button className="btn btn-primary btn-lg" onClick={handleSave}>
            {isEditing ? '💾 Save / 保存' : '📝 Save Trail Note / 保存足迹'}
          </button>
        </div>
      </div>

      {/* Writing Clues Modal rendered outside animated container to fix positioning */}
      {showWritingClues && <WritingCluesModal onClose={() => setShowWritingClues(false)} />}
    </>
  )
}

function Section({ icon, title, children, action }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          {icon} {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function VocabEntry({ vocab, index, onChange, onRemove }) {
  return (
    <div className={`vocab-card${vocab.mastered ? ' mastered' : ''}`} style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-soft)' }}>
          Word {index + 1} / 第{index + 1}个词
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            color: vocab.mastered ? '#065F46' : 'var(--text-soft)',
          }}>
            <input
              type="checkbox" checked={vocab.mastered}
              onChange={e => onChange(vocab.id, 'mastered', e.target.checked)}
            />
            {vocab.mastered ? '✅ Got it! / 掌握了' : '⬜ Learning / 还在学'}
          </label>
          <button className="btn btn-danger btn-sm" onClick={() => onRemove(vocab.id)}>✕</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div className="form-group">
          <label className="form-label">🔤 Word / 词语</label>
          <input className="form-input" value={vocab.word}
            onChange={e => onChange(vocab.id, 'word', e.target.value)} placeholder="e.g. courage" />
        </div>
        <div className="form-group">
          <label className="form-label">🏷️ Type / 词性</label>
          <select className="form-select" value={vocab.partOfSpeech}
            onChange={e => onChange(vocab.id, 'partOfSpeech', e.target.value)}>
            {PARTS_OF_SPEECH.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
        <label className="form-label">📖 Meaning / 意思</label>
        <input className="form-input" value={vocab.meaning}
          onChange={e => onChange(vocab.id, 'meaning', e.target.value)}
          placeholder="What does it mean? / 这个词是什么意思？" />
      </div>

      <div className="form-group">
        <label className="form-label">✍️ Example / 例句</label>
        <input className="form-input" value={vocab.exampleSentence}
          onChange={e => onChange(vocab.id, 'exampleSentence', e.target.value)}
          placeholder="Use it in a sentence... / 用这个词造个句子……" />
      </div>
    </div>
  )
}
