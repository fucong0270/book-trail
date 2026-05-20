import { useState } from 'react'
import { useApp } from '../context/AppContext'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function renderMentionText(text) {
  const parts = text.split(/(@\S+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} style={{ color: '#8B5CF6', fontWeight: 800 }}>{part}</span>
      : part
  )
}

function AuthorPicker({ profiles, authorId, setAuthorId }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.35rem' }}>
        Who is commenting? / 谁在留言？
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => setAuthorId(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.65rem', borderRadius: '99px',
              border: `2px solid ${authorId === p.id ? p.themeColor : 'var(--border)'}`,
              background: authorId === p.id ? p.themeColorLight : 'white',
              color: authorId === p.id ? p.themeColorDark : 'var(--text-soft)',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
              transition: 'all 0.15s',
            }}
          >
            <span>{p.avatar}</span>
            <span>{p.name} / {p.chineseName}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MentionChips({ profiles, onMention }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.35rem' }}>
        @ Mention someone / 提醒某人
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onMention('all')}
          style={{
            padding: '0.18rem 0.55rem', borderRadius: '99px',
            border: '1.5px solid #8B5CF6', background: '#F5F3FF',
            color: '#8B5CF6', cursor: 'pointer', fontWeight: 800, fontSize: '0.73rem'
          }}
        >
          @All / 所有人
        </button>
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => onMention(p.id)}
            style={{
              padding: '0.18rem 0.55rem', borderRadius: '99px',
              border: `1.5px solid ${p.themeColor}`,
              background: p.themeColorLight,
              color: p.themeColorDark,
              cursor: 'pointer', fontWeight: 800, fontSize: '0.73rem'
            }}
          >
            @{p.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function CommentForm({ profiles, authorId, setAuthorId, text, setText, onSubmit, onMention, placeholder, isReply = false }) {
  return (
    <div style={{
      background: isReply ? 'white' : 'var(--bg-warm)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.75rem',
      border: '1.5px solid var(--border)',
      marginTop: '0.5rem',
    }}>
      <AuthorPicker profiles={profiles} authorId={authorId} setAuthorId={setAuthorId} />
      <MentionChips profiles={profiles} onMention={onMention} />
      <textarea
        className="form-input"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        rows={isReply ? 2 : 3}
        style={{ width: '100%', resize: 'vertical', marginBottom: '0.5rem', fontSize: '0.9rem' }}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) onSubmit() }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>
          Ctrl+Enter to send / 按Ctrl+回车发送
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={onSubmit}
          disabled={!text.trim() || !authorId}
          style={{
            opacity: (!text.trim() || !authorId) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          Send / 发送 💌
        </button>
      </div>
    </div>
  )
}

function CommentBubble({ comment, author, isReply = false, onReply, isReplying }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
      <div style={{ fontSize: isReply ? '1.3rem' : '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>
        {author?.avatar || '👤'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 900, fontSize: '0.88rem', color: author?.themeColor || '#666' }}>
            {author?.name || 'Unknown'} / {author?.chineseName || ''}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)',
          padding: '0.6rem 0.8rem',
          fontSize: '0.9rem', lineHeight: 1.6,
          color: 'var(--text-main)', fontWeight: 500,
          borderLeft: `3px solid ${author?.themeColor || '#ddd'}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {renderMentionText(comment.text)}
        </div>
        {onReply && (
          <button
            onClick={onReply}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 700,
              color: isReplying ? (author?.themeColor || 'var(--text-soft)') : 'var(--text-light)',
              padding: '0.3rem 0', marginTop: '0.1rem',
            }}
          >
            ↩ {isReplying ? 'Cancel / 取消' : 'Reply / 回复'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function HeartNotesSection({ trailNoteId, heartNotes = [] }) {
  const { profiles, activeProfile, addHeartNote } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const defaultAuthor = activeProfile?.id || profiles[0]?.id || ''
  const [commentAuthorId, setCommentAuthorId] = useState(defaultAuthor)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyAuthorId, setReplyAuthorId] = useState(defaultAuthor)
  const [replyText, setReplyText] = useState('')

  const topLevel = heartNotes.filter(h => !h.parentId)
  const getReplies = id => heartNotes.filter(h => h.parentId === id)
  const getProfile = id => profiles.find(p => p.id === id)

  const insertMention = (profileId, setter) => {
    if (profileId === 'all') setter(prev => prev + '@所有人 ')
    else {
      const p = getProfile(profileId)
      if (p) setter(prev => prev + `@${p.name} `)
    }
  }

  const handleSubmit = () => {
    if (!commentText.trim() || !commentAuthorId) return
    addHeartNote(trailNoteId, { authorId: commentAuthorId, text: commentText.trim(), parentId: null })
    setCommentText('')
  }

  const handleReply = (parentId) => {
    if (!replyText.trim() || !replyAuthorId) return
    addHeartNote(trailNoteId, { authorId: replyAuthorId, text: replyText.trim(), parentId })
    setReplyText('')
    setReplyingTo(null)
  }

  return (
    <div style={{ marginTop: '1rem', borderTop: '1.5px dashed var(--border)', paddingTop: '0.75rem' }}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-soft)',
          padding: '0.2rem 0',
        }}
      >
        <span>💌</span>
        <span>Heart Notes / 心语</span>
        {heartNotes.length > 0 && (
          <span style={{
            background: '#FDF2F8', color: '#EC4899', borderRadius: '99px',
            padding: '0.05rem 0.5rem', fontSize: '0.75rem', fontWeight: 800,
          }}>
            {heartNotes.length}
          </span>
        )}
        <span style={{ fontSize: '0.75rem' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '1rem' }}>
            💬 Family members can leave warm messages and discuss together / 家人可以留言，一起讨论
          </div>

          {/* Comment list */}
          {topLevel.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '1.5rem 1rem',
              color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600,
              background: 'var(--bg-warm)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem',
            }}>
              💌 Be the first to leave a heart note! / 第一个留下心语吧！
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {topLevel.map(comment => {
                const author = getProfile(comment.authorId)
                const replies = getReplies(comment.id)
                return (
                  <div key={comment.id}>
                    <CommentBubble
                      comment={comment}
                      author={author}
                      onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      isReplying={replyingTo === comment.id}
                    />

                    {/* Nested replies */}
                    {replies.length > 0 && (
                      <div style={{
                        marginLeft: '2.5rem', marginTop: '0.75rem',
                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                        paddingLeft: '0.75rem',
                        borderLeft: `2px solid ${author?.themeColor || 'var(--border)'}40`,
                      }}>
                        {replies.map(reply => (
                          <CommentBubble
                            key={reply.id}
                            comment={reply}
                            author={getProfile(reply.authorId)}
                            isReply
                          />
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div style={{ marginLeft: '2.5rem' }}>
                        <CommentForm
                          profiles={profiles}
                          authorId={replyAuthorId}
                          setAuthorId={setReplyAuthorId}
                          text={replyText}
                          setText={setReplyText}
                          onSubmit={() => handleReply(comment.id)}
                          onMention={id => insertMention(id, setReplyText)}
                          placeholder={`Reply to ${author?.name || ''}... / 回复${author?.chineseName || ''}...`}
                          isReply
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* New comment form */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.4rem' }}>
              ✍️ Add a Heart Note / 添加心语
            </div>
            <CommentForm
              profiles={profiles}
              authorId={commentAuthorId}
              setAuthorId={setCommentAuthorId}
              text={commentText}
              setText={setCommentText}
              onSubmit={handleSubmit}
              onMention={id => insertMention(id, setCommentText)}
              placeholder="Write a heart note... / 写下你的心语..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
