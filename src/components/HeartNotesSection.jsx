import { useState } from 'react'
import { useApp } from '../context/AppContext'

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  return `${month} ${day}, ${year}`
}

export default function HeartNotesSection({ trailNoteId, heartNotes }) {
  const { activeProfile, profiles, addHeartNote } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const count = heartNotes.length

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    addHeartNote(trailNoteId, trimmed)
    setText('')
    setSubmitting(false)
    setExpanded(true)
  }

  const getProfile = (authorId) => profiles.find(p => p.id === authorId)

  return (
    <div style={{
      marginTop: '0.85rem',
      borderTop: '1px solid var(--border)',
      paddingTop: '0.75rem',
    }}>
      {/* Toggle button */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ fontSize: '0.8rem', marginBottom: expanded ? '0.75rem' : 0 }}
        onClick={() => setExpanded(e => !e)}
      >
        💌 {count > 0
          ? `${count} Heart Note${count !== 1 ? 's' : ''} / ${count}条心语`
          : 'Heart Notes / 心语'
        } {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div>
          {/* Section header */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              💌 Heart Notes / 心语
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>
              Leave a warm message for your reader / 给小读者留下温馨留言
            </div>
          </div>

          {/* Existing heart notes */}
          {count === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'var(--bg-warm)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-soft)',
              fontSize: '0.85rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>💌</div>
              <div>Be the first to leave a heart note! / 第一个留下心语吧！</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {heartNotes.map(hn => {
                const author = getProfile(hn.authorId)
                const color = author?.themeColor || 'var(--theme-color)'
                const displayName = author
                  ? `${author.name} / ${author.chineseName}`
                  : hn.authorId
                const avatar = author?.avatar || '💬'
                return (
                  <div
                    key={hn.id}
                    style={{
                      display: 'flex',
                      gap: '0.6rem',
                      alignItems: 'flex-start',
                      background: 'var(--bg-warm)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div style={{
                      fontSize: '1.3rem',
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color }}>{displayName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>
                          · {formatDate(hn.createdAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {hn.text}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add comment form */}
          {activeProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                className="form-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write a heart note... / 写下你的心语..."
                rows={2}
                style={{ fontSize: '0.88rem', resize: 'vertical' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSubmit}
                  disabled={!text.trim() || submitting}
                  style={{ opacity: text.trim() ? 1 : 0.5 }}
                >
                  Send / 发送 💌
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-soft)',
              textAlign: 'center',
              padding: '0.5rem',
            }}>
              Sign in to leave a heart note / 登录后留言
            </div>
          )}
        </div>
      )}
    </div>
  )
}
