import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, LEVELS } from '../data/sampleData'

const STATUS_TABS = [
  { value: 'all', label: 'All / 全部', icon: '📚' },
  { value: 'not_started', label: 'Not Started / 未开始', icon: '📋' },
  { value: 'started', label: 'Reading / 阅读中', icon: '📖' },
  { value: 'finished', label: 'Finished / 读完了', icon: '✅' },
]

const SOURCE_SUGGESTIONS = [
  "Mom recommended it / 妈妈推荐",
  "Friend recommended it / 朋友推荐",
  "Teacher recommended it / 老师推荐",
  "I picked it myself / 我自己选的",
  "Library / 图书馆",
  "Sibling recommended / 兄弟姐妹推荐",
  "School reading list / 学校书单",
  "I found it online / 网上看到的",
]

const EMPTY_BOOK = {
  title: '', chineseTitle: '', author: '', category: '', customCategory: '',
  level: '', lexile: '', status: 'not_started', source: '',
  rating: null, notes: '', readerId: '',
}

export default function BookLibrary() {
  const { activeProfile, profiles, books, addBook, updateBook, deleteBook, navigate, categories } = useApp()

  const [statusTab, setStatusTab] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [form, setForm] = useState(EMPTY_BOOK)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const isAdmin = activeProfile?.role === 'admin'
  const myBooks = isAdmin ? books : books.filter(b => b.readerId === activeProfile?.id)

  const allCategories = [...new Set(myBooks.map(b => b.category).filter(Boolean))]

  const filtered = myBooks
    .filter(b => statusTab === 'all' || b.status === statusTab)
    .filter(b => categoryFilter === 'all' || b.category === categoryFilter)

  const openAdd = () => {
    setForm({ ...EMPTY_BOOK, readerId: activeProfile?.id })
    setEditingBook(null)
    setShowAddModal(true)
  }

  const openEdit = (book, e) => {
    e.stopPropagation()
    const knownValues = categories.map(c => c.value)
    const bookCat = book.category || ''
    const isKnown = knownValues.includes(bookCat)
    setForm({
      title: book.title || '',
      chineseTitle: book.chineseTitle || '',
      author: book.author || '',
      category: isKnown ? bookCat : (bookCat ? '__custom__' : ''),
      customCategory: isKnown ? '' : bookCat,
      level: book.level || '',
      lexile: book.lexile || '',
      status: book.status || 'not_started',
      source: book.source || '',
      rating: book.rating || null,
      notes: book.notes || book.description || '',
      readerId: book.readerId || activeProfile?.id,
    })
    setEditingBook(book)
    setShowAddModal(true)
  }

  const handleSave = () => {
    const cat = form.category === '__custom__'
      ? (form.customCategory.trim() || '')
      : form.category
    const bookData = {
      title: form.title,
      chineseTitle: form.chineseTitle,
      author: form.author,
      category: cat,
      level: form.level,
      lexile: form.lexile,
      status: form.status,
      source: form.source,
      rating: form.rating,
      notes: form.notes,
      description: form.notes,
      readerId: form.readerId || activeProfile?.id,
      createdBy: activeProfile?.id,
    }
    if (editingBook) {
      updateBook(editingBook.id, bookData)
    } else {
      addBook(bookData)
    }
    setShowAddModal(false)
  }

  const handleDelete = (bookId) => {
    deleteBook(bookId)
    setDeleteConfirm(null)
  }

  return (
    <>
      {/* Main content — separate from modals to avoid transform/fixed positioning conflict */}
      <div className="page-container animate-fadeIn">
        <div className="page-header">
          <h1>📚 My Bookshelf / 我的书架</h1>
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openAdd}>
            + Add Book / 添加书
          </button>
        </div>

        {/* Status tabs */}
        <div className="tab-bar">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              className={`tab-btn${statusTab === tab.value ? ' active' : ''}`}
              onClick={() => setStatusTab(tab.value)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Category filters */}
        {allCategories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button
              className={`filter-chip${categoryFilter === 'all' ? ' active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All Categories / 所有类型
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`filter-chip${categoryFilter === cat ? ' active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Book grid */}
        {filtered.length === 0 ? (
          <div className="empty-state card" style={{ padding: '2rem' }}>
            <div className="empty-icon">📚</div>
            <h3>No books here yet</h3>
            <p>Add your first book! / 添加第一本书！</p>
            <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={openAdd}>
              + Add Book / 添加书
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate('book-detail', book.id)}
                onEdit={(e) => openEdit(book, e)}
                onDelete={(e) => { e.stopPropagation(); setDeleteConfirm(book.id) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals rendered outside animated container (fixes position:fixed centering) ── */}
      {showAddModal && (
        <BookFormModal
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowAddModal(false)}
          isEditing={!!editingBook}
          categories={categories}
          levels={LEVELS}
          sourceSuggestions={SOURCE_SUGGESTIONS}
          profiles={profiles}
          isAdmin={isAdmin}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box animate-scaleIn" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Delete Book / 删除书</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-soft)' }}>
                Are you sure? This will also delete all Trail Notes for this book.<br />
                确定吗？这也会删除这本书的所有阅读足迹。
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
    </>
  )
}

function BookCard({ book, onClick, onEdit, onDelete }) {
  const statusLabel = {
    finished: '✅ Finished / 读完了',
    started: '📖 Reading / 阅读中',
    not_started: '📋 Not Started / 未开始',
  }[book.status] || book.status

  return (
    <div
      className="card"
      style={{ padding: '1.1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      onClick={onClick}
    >
      <div style={{
        height: '70px',
        background: 'linear-gradient(135deg, var(--theme-color), var(--theme-dark))',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem',
      }}>
        📚
      </div>

      <div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{book.title}</div>
        {book.chineseTitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{book.chineseTitle}</div>
        )}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>{book.author}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        <span className={`status-badge status-${book.status}`}>{statusLabel}</span>
        {book.category && <span className="tag">{book.category}</span>}
      </div>

      {book.level && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
          Level: {book.level}
          {book.lexile && <span style={{ marginLeft: '0.4rem', color: 'var(--text-light)' }}>· {book.lexile}</span>}
        </div>
      )}

      {book.rating && (
        <div style={{ fontSize: '0.9rem' }}>{'⭐'.repeat(book.rating)}</div>
      )}

      {book.source && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', borderTop: '1px solid var(--border)', paddingTop: '0.35rem' }}>
          📌 {book.source}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onEdit}>
          ✏️ Edit / 编辑
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>
          🗑️
        </button>
      </div>
    </div>
  )
}

function BookFormModal({ form, setForm, onSave, onClose, isEditing, categories, levels, sourceSuggestions, profiles, isAdmin }) {
  const [hover, setHover] = useState(0)
  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const valid = form.title.trim() && form.author.trim()

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-box modal-box-lg animate-scaleIn"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Edit Book / 编辑书' : '+ Add Book / 添加书'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Reader selector */}
          <div className="form-group">
            <label className="form-label">👤 Reader / 阅读者</label>
            <select className="form-select" value={form.readerId} onChange={f('readerId')}>
              <option value="">Select reader... / 选择读者</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name} / {p.chineseName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">📖 Title / 书名 *</label>
              <input className="form-input" value={form.title} onChange={f('title')} placeholder="Book title" />
            </div>
            <div className="form-group">
              <label className="form-label">🇨🇳 Chinese Title / 中文书名</label>
              <input className="form-input" value={form.chineseTitle} onChange={f('chineseTitle')} placeholder="中文书名（可选）" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">✍️ Author / 作者 *</label>
            <input className="form-input" value={form.author} onChange={f('author')} placeholder="Author name" />
          </div>

          <div className="form-group">
            <label className="form-label">🏷️ Category / 类型</label>
            <select className="form-select" value={form.category} onChange={f('category')}>
              <option value="">Select category... / 选择类型</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
              <option value="__custom__">✏️ Custom / 自定义…</option>
            </select>
            {form.category === '__custom__' && (
              <input
                className="form-input"
                style={{ marginTop: '0.5rem' }}
                value={form.customCategory}
                onChange={f('customCategory')}
                placeholder="Type a new category / 自己输入类型名称"
                autoFocus
              />
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">⭐ Level / 难度</label>
              <select className="form-select" value={form.level} onChange={f('level')}>
                <option value="">Select level... / 选择难度</option>
                {levels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">📏 Lexile</label>
              <input className="form-input" value={form.lexile} onChange={f('lexile')} placeholder="e.g. 670L" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📌 Status / 状态</label>
            <select className="form-select" value={form.status} onChange={f('status')}>
              <option value="not_started">📋 Not Started / 未开始</option>
              <option value="started">📖 Reading / 阅读中</option>
              <option value="finished">✅ Finished / 读完了</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">📌 Source / 来源</label>
            <input
              className="form-input"
              value={form.source}
              onChange={f('source')}
              placeholder="e.g. Friend recommended it / 朋友推荐"
              list="source-list-lib"
            />
            <datalist id="source-list-lib">
              {sourceSuggestions.map(s => <option key={s} value={s} />)}
            </datalist>
            <p className="helper-text" style={{ marginTop: '0.25rem' }}>
              Type freely! / 可以自己写来源
            </p>
          </div>

          {form.status === 'finished' && (
            <div className="form-group">
              <label className="form-label">⭐ My Rating / 我的评分</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className="star"
                    style={{ color: n <= (hover || form.rating || 0) ? '#FBBF24' : '#D1D5DB', fontSize: '1.8rem' }}
                    onClick={() => setForm(prev => ({ ...prev, rating: n === prev.rating ? null : n }))}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">📒 Brief Description / 简单介绍</label>
            <textarea
              className="form-textarea"
              value={form.notes}
              onChange={f('notes')}
              placeholder="A short description of what this book is about... / 简单介绍一下这本书讲什么……"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel / 取消</button>
          <button
            className="btn btn-primary"
            onClick={() => { if (valid) onSave() }}
            disabled={!valid}
            style={{ opacity: valid ? 1 : 0.5 }}
          >
            {isEditing ? '💾 Save / 保存' : '+ Add / 添加'}
          </button>
        </div>
      </div>
    </div>
  )
}
