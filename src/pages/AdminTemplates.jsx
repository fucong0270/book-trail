import { useState } from 'react'
import { useApp } from '../context/AppContext'

const CATEGORY_OPTIONS = [
  { value: 'summary', label: 'Summary / 总结' },
  { value: 'reflection', label: 'Reflection / 感想' },
  { value: 'character', label: 'Character / 角色' },
  { value: 'learning', label: 'Learning / 学习' },
  { value: 'connection', label: 'Connection / 联想' },
  { value: 'opinion', label: 'Opinion / 看法' },
  { value: 'other', label: 'Other / 其他' },
]

const EMPTY_FORM = {
  title: '',
  chineseTitle: '',
  englishTemplate: '',
  chineseTemplate: '',
  category: 'summary',
}

export default function AdminTemplates() {
  const { writingTemplates, addWritingTemplate, updateWritingTemplate, deleteWritingTemplate } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const allCategories = [...new Set(writingTemplates.map(t => t.category))]

  const filtered = categoryFilter === 'all'
    ? writingTemplates
    : writingTemplates.filter(t => t.category === categoryFilter)

  const openAdd = () => {
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (tpl) => {
    setForm({
      title: tpl.title || '',
      chineseTitle: tpl.chineseTitle || '',
      englishTemplate: tpl.englishTemplate || '',
      chineseTemplate: tpl.chineseTemplate || '',
      category: tpl.category || 'summary',
    })
    setEditingId(tpl.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editingId) {
      updateWritingTemplate(editingId, form)
    } else {
      addWritingTemplate(form)
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    deleteWritingTemplate(id)
    setDeleteConfirm(null)
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const getCatLabel = (cat) => {
    const found = CATEGORY_OPTIONS.find(c => c.value === cat)
    return found ? found.label : cat
  }

  const CAT_COLORS = {
    summary: '#3B82F6',
    reflection: '#EC4899',
    character: '#8B5CF6',
    learning: '#10B981',
    connection: '#F97316',
    opinion: '#EAB308',
    other: '#78716C',
  }

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>✏️ Writing Templates / 写作模板</h1>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openAdd}>
          + Add Template / 添加模板
        </button>
      </div>

      <p style={{ color: 'var(--text-soft)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        These templates help children write their trail notes. / 这些模板帮助孩子们写阅读足迹。
      </p>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button
          className={`filter-chip${categoryFilter === 'all' ? ' active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All / 全部 ({writingTemplates.length})
        </button>
        {allCategories.map(cat => (
          <button
            key={cat}
            className={`filter-chip${categoryFilter === cat ? ' active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {getCatLabel(cat)} ({writingTemplates.filter(t => t.category === cat).length})
          </button>
        ))}
      </div>

      {/* Templates grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: '2.5rem' }}>
          <div className="empty-icon">✏️</div>
          <h3>No templates yet / 还没有模板</h3>
          <p>Create writing templates for the kids! / 为孩子创建写作模板！</p>
          <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={openAdd}>
            + Add Template / 添加模板
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map(tpl => {
            const color = CAT_COLORS[tpl.category] || '#78716C'
            return (
              <div
                key={tpl.id}
                className="card"
                style={{ padding: '1.25rem', borderLeft: `4px solid ${color}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: color + '20',
                        color: color,
                        borderRadius: '99px',
                        padding: '0.15rem 0.65rem',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}>
                        {getCatLabel(tpl.category)}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                        {tpl.title}
                        {tpl.chineseTitle && (
                          <span style={{ color: 'var(--text-soft)', marginLeft: '0.4rem' }}>/ {tpl.chineseTitle}</span>
                        )}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.6,
                        borderLeft: `3px solid ${color}`,
                      }}>
                        🇺🇸 {tpl.englishTemplate}
                      </div>
                      {tpl.chineseTemplate && (
                        <div style={{
                          background: '#FAFAF8',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          lineHeight: 1.6,
                          borderLeft: `3px solid ${color}`,
                        }}>
                          🇨🇳 {tpl.chineseTemplate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(tpl)}>✏️ Edit / 编辑</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(tpl.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box modal-box-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Edit Template / 编辑模板' : '+ New Template / 新模板'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">📝 English Title / 英文标题 *</label>
                  <input className="form-input" value={form.title} onChange={f('title')} placeholder="e.g. Simple Summary" />
                </div>
                <div className="form-group">
                  <label className="form-label">🇨🇳 Chinese Title / 中文标题</label>
                  <input className="form-input" value={form.chineseTitle} onChange={f('chineseTitle')} placeholder="例如：简单总结" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🏷️ Category / 类型</label>
                <select className="form-select" value={form.category} onChange={f('category')}>
                  {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">🇺🇸 English Template Text / 英文模板</label>
                <textarea
                  className="form-textarea"
                  value={form.englishTemplate}
                  onChange={f('englishTemplate')}
                  placeholder="e.g. Today I read about _____. First, _____ ..."
                  rows={4}
                />
                <span className="helper-text">Use _____ as blanks for kids to fill in / 用 _____ 作为孩子填空的地方</span>
              </div>

              <div className="form-group">
                <label className="form-label">🇨🇳 Chinese Template Text / 中文模板</label>
                <textarea
                  className="form-textarea"
                  value={form.chineseTemplate}
                  onChange={f('chineseTemplate')}
                  placeholder="例如：今天我读到了____。一开始____……"
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel / 取消</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!form.title.trim()}
              >
                {editingId ? '💾 Save / 保存' : '+ Add / 添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box animate-scaleIn" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Delete Template / 删除模板</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-soft)' }}>
                Are you sure you want to delete this template? / 确定要删除这个模板吗？
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
