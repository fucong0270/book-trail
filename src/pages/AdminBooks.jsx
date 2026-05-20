import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, LEVELS } from '../data/sampleData'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status / 全部状态' },
  { value: 'not_started', label: '📋 Not Started / 未开始' },
  { value: 'started', label: '📖 Reading / 阅读中' },
  { value: 'finished', label: '✅ Finished / 读完了' },
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

export default function AdminBooks() {
  const {
    books, profiles, addBook, updateBook, deleteBook, navigate, categories,
  } = useApp()

  const [readerFilter, setReaderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [form, setForm] = useState(EMPTY_BOOK)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const kidProfiles = profiles.filter(p => p.role === 'kid')

  const allCategories = [...new Set(books.map(b => b.category).filter(Boolean))]

  const filtered = books
    .filter(b => readerFilter === 'all' || b.readerId === readerFilter)
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => categoryFilter === 'all' || b.category === categoryFilter)
    .filter(b => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.chineseTitle?.toLowerCase().includes(q)
    })

  const openAdd = () => {
    setForm({ ...EMPTY_BOOK })
    setEditingBook(null)
    setShowModal(true)
  }

  const openEdit = (book) => {
    const knownCat = categories.find(c => c.value === book.category)
    setForm({
      title: book.title || '',
      chineseTitle: book.chineseTitle || '',
      author: book.author || '',
      category: knownCat ? book.category : (book.category ? '__custom__' : ''),
      customCategory: knownCat ? '' : (book.category || ''),
      level: book.level || '',
      lexile: book.lexile || '',
      status: book.status || 'not_started',
      source: book.source || '',
      rating: book.rating || null,
      notes: book.notes || book.description || '',
      readerId: book.readerId || '',
    })
    setEditingBook(book)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.author.trim()) return
    const cat = form.category === '__custom__' ? form.customCategory.trim() : form.category
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
      readerId: form.readerId,
      createdBy: 'mom',
    }
    if (editingBook) {
      updateBook(editingBook.id, bookData)
    } else {
      addBook(bookData)
    }
    setShowModal(false)
  }

  const getReaderName = (readerId) => {
    const p = profiles.find(pr => pr.id === readerId)
    return p ? `${p.avatar} ${p.name} (${p.chineseName})` : readerId || 'Unknown'
  }

  const getReaderColor = (readerId) => {
    const p = profiles.find(pr => pr.id === readerId)
    return p?.themeColor || 'var(--text-soft)'
  }

  return (
    <>
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>📚 All Books / 所有书</h1>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openAdd}>
          + Add Book / 添加书
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
            <label className="form-label">🔍 Search / 搜索</label>
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Title, author..." />
          </div>
          <div className="form-group">
            <label className="form-label">👤 Reader / 读者</label>
            <select className="form-select" value={readerFilter} onChange={e => setReaderFilter(e.target.value)}>
              <option value="all">All Readers / 所有读者</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name} / {p.chineseName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">📋 Status / 状态</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">🏷️ Category / 类型</label>
            <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories / 所有类型</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-soft)', fontWeight: 600 }}>
          {filtered.length} books / 本书 (total: {books.length})
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title / 书名</th>
                <th>Reader / 读者</th>
                <th>Category / 类型</th>
                <th>Level / 难度</th>
                <th>Status / 状态</th>
                <th>Source / 来源</th>
                <th>Actions / 操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-soft)' }}>
                    No books found / 未找到书
                  </td>
                </tr>
              ) : (
                filtered.map(book => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{book.title}</div>
                      {book.chineseTitle && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{book.chineseTitle}</div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{book.author}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: getReaderColor(book.readerId), fontSize: '0.82rem' }}>
                        {getReaderName(book.readerId)}
                      </span>
                    </td>
                    <td>
                      {book.category && <span className="tag">{book.category}</span>}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{book.level || '—'}</td>
                    <td>
                      <span className={`status-badge status-${book.status}`}>
                        {book.status === 'finished' ? '✅' : book.status === 'started' ? '📖' : '📋'}
                        {' '}{book.status === 'finished' ? 'Done / 读完了' : book.status === 'started' ? 'Reading / 阅读中' : 'Not Started / 未开始'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-soft)', maxWidth: '120px' }}>
                      {book.source || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(book.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>

      {/* Modals outside animated container */}
      {showModal && (
        <AdminBookModal
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isEditing={!!editingBook}
          categories={categories}
          levels={LEVELS}
          sourceSuggestions={SOURCE_SUGGESTIONS}
          allProfiles={profiles}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box animate-scaleIn" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Delete Book / 删除书</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-soft)' }}>
                Delete this book and all its trail notes? This cannot be undone.<br />
                删除这本书和所有阅读足迹？此操作无法撤消。
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel / 取消</button>
              <button className="btn btn-danger" onClick={() => { deleteBook(deleteConfirm); setDeleteConfirm(null) }}>
                Delete / 删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AdminBookModal({ form, setForm, onSave, onClose, isEditing, categories, levels, sourceSuggestions, allProfiles }) {
  const [hover, setHover] = useState(0)
  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const valid = form.title.trim() && form.author.trim()

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg animate-scaleIn" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Edit Book / 编辑书' : '+ Add Book / 添加书'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">👤 Reader / 读者</label>
            <select className="form-select" value={form.readerId} onChange={f('readerId')}>
              <option value="">Select reader... / 选择读者</option>
              {allProfiles.map(p => (
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
              <input className="form-input" value={form.chineseTitle} onChange={f('chineseTitle')} placeholder="中文书名" />
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
                <option value="">Select level...</option>
                {levels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">📏 Lexile</label>
              <input className="form-input" value={form.lexile} onChange={f('lexile')} placeholder="e.g. 670L" />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">📋 Status / 状态</label>
              <select className="form-select" value={form.status} onChange={f('status')}>
                <option value="not_started">📋 Not Started / 未开始</option>
                <option value="started">📖 Reading / 阅读中</option>
                <option value="finished">✅ Finished / 读完了</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">📌 Source / 来源</label>
              <input className="form-input" value={form.source} onChange={f('source')} placeholder={sourceSuggestions[0]} list="admin-source-list" />
              <datalist id="admin-source-list">
                {sourceSuggestions.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          {form.status === 'finished' && (
            <div className="form-group">
              <label className="form-label">⭐ Rating / 我的评分</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className="star"
                    style={{ color: n <= (hover || form.rating || 0) ? '#FBBF24' : '#D1D5DB', fontSize: '1.8rem' }}
                    onClick={() => setForm(prev => ({ ...prev, rating: n === prev.rating ? null : n }))}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                  >★</span>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">📒 Brief Description / 简单介绍</label>
            <textarea className="form-textarea" value={form.notes} onChange={f('notes')} placeholder="A short description of what this book is about..." rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel / 取消</button>
          <button className="btn btn-primary" onClick={() => valid && onSave()} disabled={!valid}>
            {isEditing ? '💾 Save / 保存' : '+ Add / 添加'}
          </button>
        </div>
      </div>
    </div>
  )
}
