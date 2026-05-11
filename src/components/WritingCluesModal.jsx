import { useState } from 'react'
import { useApp } from '../context/AppContext'

// Individual question prompts — inspiration sparks, not required fields
const WRITING_PROMPTS = [
  {
    icon: '❤️',
    en: 'What was your favorite part?',
    zh: '你最喜欢哪个部分？',
    tip: 'My favorite part was _____ because _____.',
    tipZh: '我最喜欢的部分是____，因为____。',
  },
  {
    icon: '📋',
    en: 'What happened in what you read today?',
    zh: '你今天读到了什么事情？',
    tip: 'In this part, _____ happened. First _____, then _____, and finally _____.',
    tipZh: '在这一部分，发生了____。先是____，然后____，最后____。',
  },
  {
    icon: '💡',
    en: 'What did you learn or find interesting?',
    zh: '你学到了什么有趣的东西？',
    tip: 'I learned that _____. This surprised me because _____.',
    tipZh: '我学到了____。这让我感到惊讶，因为____。',
  },
  {
    icon: '😊',
    en: 'How did reading this make you feel?',
    zh: '读这部分让你有什么感受？',
    tip: 'Reading this made me feel _____ because _____.',
    tipZh: '读到这里，我感到____，因为____。',
  },
  {
    icon: '💬',
    en: 'Is there a sentence or line you really liked?',
    zh: '有没有你很喜欢的一句话？',
    tip: 'A sentence I loved was: "___________". I liked it because _____.',
    tipZh: '我很喜欢这句话："____"。我喜欢它，因为____。',
  },
  {
    icon: '❓',
    en: 'What question do you still have after reading?',
    zh: '读完之后你还有什么问题？',
    tip: 'After reading this, I still wonder _____. I would like to ask the author _____.',
    tipZh: '读完之后，我还想知道____。我想问作者____。',
  },
  {
    icon: '🔗',
    en: 'Does this remind you of anything in your own life?',
    zh: '这让你想到了你自己生活里的什么？',
    tip: 'This reminds me of _____ because _____.',
    tipZh: '这让我想到____，因为____。',
  },
  {
    icon: '🦸',
    en: 'What would you do if you were the main character?',
    zh: '如果你是主角，你会怎么做？',
    tip: 'If I were _____, I would _____ because _____.',
    tipZh: '如果我是____，我会____，因为____。',
  },
  {
    icon: '🌟',
    en: 'What is the most important idea in this part?',
    zh: '这一部分最重要的想法是什么？',
    tip: 'The most important idea in this part is _____ because _____.',
    tipZh: '这一部分最重要的想法是____，因为____。',
  },
]

const FORMAT_COLORS = {
  format: '#8B5CF6',
}

export default function WritingCluesModal({ onClose }) {
  const { writingTemplates } = useApp()
  const [activeTab, setActiveTab] = useState('prompts')
  const [copiedId, setCopiedId] = useState(null)
  const [expandedPrompt, setExpandedPrompt] = useState(null)

  const formats = writingTemplates.filter(t => t.category === 'format')

  const handleCopyFormat = (template) => {
    const text = `${template.title}\n\n${template.englishTemplate}\n\n---\n\n${template.chineseTitle}\n\n${template.chineseTemplate}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => {
      // clipboard not available — silently ignore
    })
  }

  const handleCopyPrompt = (prompt) => {
    const text = `${prompt.en}\n${prompt.tip}\n\n${prompt.zh}\n${prompt.tipZh}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(prompt.en)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => {})
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg animate-scaleIn" style={{ maxHeight: '88vh' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>💡 Writing Clues / 写作提示</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
              Not sure what to write? Get inspired! / 不知道写什么？来找找灵感！
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div className="tab-bar" style={{ marginBottom: 0, paddingBottom: '0' }}>
            <button
              className={`tab-btn${activeTab === 'prompts' ? ' active' : ''}`}
              onClick={() => setActiveTab('prompts')}
            >
              💭 Writing Prompts / 写作问题
            </button>
            <button
              className={`tab-btn${activeTab === 'formats' ? ' active' : ''}`}
              onClick={() => setActiveTab('formats')}
            >
              📋 Writing Formats / 写作格式
            </button>
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'prompts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '0.5rem' }}>
                Pick any question that interests you and use it to help you write your note. You don't have to answer all of them! 🌟
                <br />
                <span style={{ fontSize: '0.8rem' }}>选一个你感兴趣的问题来帮你写笔记，不用全部回答！🌟</span>
              </p>

              {WRITING_PROMPTS.map((prompt, i) => {
                const isExpanded = expandedPrompt === i
                const isCopied = copiedId === prompt.en
                return (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: '0.9rem 1rem',
                      cursor: 'pointer',
                      borderLeft: '4px solid var(--theme-color)',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setExpandedPrompt(isExpanded ? null : i)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{prompt.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{prompt.en}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{prompt.zh}</div>
                        </div>
                      </div>
                      <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', flexShrink: 0 }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div
                        style={{ marginTop: '0.75rem' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="reflection-text" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                          🇺🇸 {prompt.tip}
                        </div>
                        <div className="reflection-text" style={{ background: '#FAFAF8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                          🇨🇳 {prompt.tipZh}
                        </div>
                        <button
                          className={`btn btn-sm ${isCopied ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleCopyPrompt(prompt)}
                        >
                          {isCopied ? '✓ Copied! / 已复制！' : '📋 Copy sentence starters / 复制'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'formats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '0.35rem' }}>
                Use one of these writing formats to structure your note. Copy it and fill in the blanks!
                <br />
                <span style={{ fontSize: '0.8rem' }}>选一个写作格式来整理你的笔记。复制它，然后填空！</span>
              </p>

              {formats.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No formats yet</h3>
                  <p>Ask Mom to add writing formats! / 请妈妈添加写作格式！</p>
                </div>
              ) : (
                formats.map(template => {
                  const isCopied = copiedId === template.id
                  return (
                    <div
                      key={template.id}
                      className="card"
                      style={{
                        padding: '1rem 1.25rem',
                        borderLeft: '4px solid var(--theme-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem' }}>
                            {template.title}
                            {template.chineseTitle !== template.title && (
                              <span style={{ fontWeight: 600, color: 'var(--text-soft)', marginLeft: '0.5rem', fontSize: '0.88rem' }}>
                                / {template.chineseTitle}
                              </span>
                            )}
                          </div>

                          <div className="reflection-text" style={{ fontSize: '0.83rem', whiteSpace: 'pre-line', marginBottom: '0.5rem' }}>
                            🇺🇸 {template.englishTemplate}
                          </div>
                          <div className="reflection-text" style={{ background: '#FAFAF8', fontSize: '0.83rem', whiteSpace: 'pre-line' }}>
                            🇨🇳 {template.chineseTemplate}
                          </div>
                        </div>

                        <button
                          className={`btn btn-sm ${isCopied ? 'btn-success' : 'btn-secondary'}`}
                          style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                          onClick={() => handleCopyFormat(template)}
                        >
                          {isCopied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
