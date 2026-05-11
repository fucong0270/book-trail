import { useState } from 'react'
import { useApp } from '../context/AppContext'

const CATEGORY_COLORS = {
  summary: '#3B82F6',
  reflection: '#EC4899',
  character: '#8B5CF6',
  learning: '#10B981',
  connection: '#F97316',
  opinion: '#EAB308',
}

const CATEGORY_LABELS = {
  summary: 'Summary / 总结',
  reflection: 'Reflection / 感想',
  character: 'Character / 角色',
  learning: 'Learning / 学习',
  connection: 'Connection / 联想',
  opinion: 'Opinion / 看法',
}

export default function FormatClueModal({ onClose }) {
  const { writingTemplates } = useApp()
  const [activeTab, setActiveTab] = useState('all')
  const [copiedId, setCopiedId] = useState(null)

  const categories = ['all', ...new Set(writingTemplates.map(t => t.category))]

  const filtered = activeTab === 'all'
    ? writingTemplates
    : writingTemplates.filter(t => t.category === activeTab)

  const handleCopy = (template) => {
    const text = `${template.englishTemplate}\n\n${template.chineseTemplate}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg animate-scaleIn">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>💡 Format Clues</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
              写作小提示 — Click a template to copy it!
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        <div className="modal-body">
          {/* Category tabs */}
          <div className="tab-bar">
            {categories.map(cat => (
              <button
                key={cat}
                className={`tab-btn${activeTab === cat ? ' active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat === 'all' ? '✨ All / 全部' : (CATEGORY_LABELS[cat] || cat)}
              </button>
            ))}
          </div>

          {/* Templates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(template => {
              const color = CATEGORY_COLORS[template.category] || 'var(--theme-color)'
              const isCopied = copiedId === template.id
              return (
                <div
                  key={template.id}
                  className="card"
                  style={{ padding: '1rem 1.25rem', cursor: 'pointer', borderLeft: `4px solid ${color}` }}
                  onClick={() => handleCopy(template)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          background: color + '20',
                          color: color,
                          borderRadius: '99px',
                          padding: '0.15rem 0.6rem',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                        }}>
                          {CATEGORY_LABELS[template.category] || template.category}
                        </span>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                          {template.title} / {template.chineseTitle}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div className="reflection-text" style={{ borderLeftColor: color, fontSize: '0.85rem' }}>
                          🇺🇸 {template.englishTemplate}
                        </div>
                        <div className="reflection-text" style={{ borderLeftColor: color, fontSize: '0.85rem', background: '#FAFAF8' }}>
                          🇨🇳 {template.chineseTemplate}
                        </div>
                      </div>
                    </div>

                    <button
                      className={`btn btn-sm ${isCopied ? 'btn-success' : 'btn-secondary'}`}
                      style={{ flexShrink: 0 }}
                      onClick={(e) => { e.stopPropagation(); handleCopy(template) }}
                    >
                      {isCopied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>No templates yet</h3>
              <p>Ask Mom to add writing templates! / 请妈妈添加写作模板！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
