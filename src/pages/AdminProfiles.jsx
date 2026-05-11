import { useState } from 'react'
import { useApp } from '../context/AppContext'

const AVATAR_OPTIONS = [
  '📘', '📗', '📕', '📙', '📚', '📖', '🌟', '⭐', '🦁', '🐯',
  '🐼', '🦊', '🐻', '🐨', '🦋', '🌈', '🚀', '🎯', '🏆', '🎨',
  '🌸', '🍀', '🌻', '🎵', '⚽', '🏀', '🎮', '🦄', '🐉', '🌙',
]

const COLOR_PRESETS = [
  { color: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8', name: 'Blue / 蓝色' },
  { color: '#10B981', light: '#D1FAE5', dark: '#065F46', name: 'Green / 绿色' },
  { color: '#EC4899', light: '#FCE7F3', dark: '#9D174D', name: 'Pink / 粉色' },
  { color: '#F97316', light: '#FFEDD5', dark: '#9A3412', name: 'Orange / 橙色' },
  { color: '#8B5CF6', light: '#EDE9FE', dark: '#5B21B6', name: 'Purple / 紫色' },
  { color: '#EF4444', light: '#FEE2E2', dark: '#991B1B', name: 'Red / 红色' },
  { color: '#14B8A6', light: '#CCFBF1', dark: '#0F766E', name: 'Teal / 青绿' },
  { color: '#EAB308', light: '#FEF9C3', dark: '#854D0E', name: 'Yellow / 黄色' },
]

export default function AdminProfiles() {
  const { profiles, updateProfile } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({})
  const [saved, setSaved] = useState(null)

  const kidProfiles = profiles.filter(p => p.role === 'kid')
  const momProfile = profiles.find(p => p.role === 'admin')

  const openEdit = (profile) => {
    setEditingId(profile.id)
    setForm({
      name: profile.name || '',
      chineseName: profile.chineseName || '',
      gradeLevel: profile.gradeLevel || '',
      readingGoal: profile.readingGoal || '',
      chineseReadingGoal: profile.chineseReadingGoal || '',
      avatar: profile.avatar || '📚',
      themeColor: profile.themeColor || '#3B82F6',
      themeColorLight: profile.themeColorLight || '#DBEAFE',
      themeColorDark: profile.themeColorDark || '#1D4ED8',
    })
  }

  const handleSave = (id) => {
    updateProfile(id, form)
    setEditingId(null)
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleColorPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      themeColor: preset.color,
      themeColorLight: preset.light,
      themeColorDark: preset.dark,
    }))
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>👥 Reader Profiles / 读者档案</h1>
      </div>

      <p style={{ color: 'var(--text-soft)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Edit each reader's profile details. Profiles cannot be deleted to protect reading data. / 编辑每位读者的档案。为保护阅读数据，档案不可删除。
      </p>

      {/* Kid profiles */}
      <div className="section-title">👧👦 Kids / 孩子们</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
        {kidProfiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isEditing={editingId === profile.id}
            form={editingId === profile.id ? form : null}
            saved={saved === profile.id}
            onEdit={() => openEdit(profile)}
            onCancel={() => setEditingId(null)}
            onSave={() => handleSave(profile.id)}
            onFormChange={f}
            onAvatarChange={(avatar) => setForm(prev => ({ ...prev, avatar }))}
            onColorPreset={handleColorPreset}
          />
        ))}
      </div>

      {/* Mom profile */}
      {momProfile && (
        <>
          <div className="section-title">👑 Admin Profile / 管理员档案</div>
          <ProfileCard
            key={momProfile.id}
            profile={momProfile}
            isEditing={editingId === momProfile.id}
            form={editingId === momProfile.id ? form : null}
            saved={saved === momProfile.id}
            onEdit={() => openEdit(momProfile)}
            onCancel={() => setEditingId(null)}
            onSave={() => handleSave(momProfile.id)}
            onFormChange={f}
            onAvatarChange={(avatar) => setForm(prev => ({ ...prev, avatar }))}
            onColorPreset={handleColorPreset}
          />
        </>
      )}
    </div>
  )
}

function ProfileCard({
  profile, isEditing, form, saved,
  onEdit, onCancel, onSave, onFormChange, onAvatarChange, onColorPreset,
}) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const displayColor = isEditing ? form?.themeColor : profile.themeColor
  const displayAvatar = isEditing ? form?.avatar : profile.avatar

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        borderLeft: `5px solid ${displayColor}`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: isEditing ? '1.25rem' : 0 }}>
        <div
          style={{
            fontSize: '2.5rem',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isEditing ? (form?.themeColorLight || profile.themeColorLight) : profile.themeColorLight,
            borderRadius: '50%',
            cursor: isEditing ? 'pointer' : 'default',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onClick={() => isEditing && setShowAvatarPicker(v => !v)}
          title={isEditing ? 'Click to change avatar' : ''}
        >
          {displayAvatar}
          {isEditing && <span style={{ fontSize: '0.6rem', position: 'absolute', bottom: 0, right: 0 }}>✏️</span>}
        </div>

        <div style={{ flex: 1 }}>
          {isEditing ? (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Editing profile...</span>
          ) : (
            <>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{profile.name}</div>
              <div style={{ fontWeight: 700, color: profile.themeColor }}>{profile.chineseName}</div>
              {profile.gradeLevel && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{profile.gradeLevel}</div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {saved && (
            <span style={{ color: '#065F46', fontWeight: 800, fontSize: '0.88rem' }}>✅ Saved!</span>
          )}
          {!isEditing && (
            <button className="btn btn-secondary btn-sm" onClick={onEdit}>
              ✏️ Edit / 编辑
            </button>
          )}
        </div>
      </div>

      {/* Avatar picker */}
      {isEditing && showAvatarPicker && (
        <div style={{
          background: 'var(--bg-warm)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
        }}>
          {AVATAR_OPTIONS.map(emoji => (
            <button
              key={emoji}
              style={{
                fontSize: '1.4rem',
                width: '38px',
                height: '38px',
                border: form?.avatar === emoji ? `2px solid ${form?.themeColor}` : '2px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: form?.avatar === emoji ? form?.themeColorLight : 'white',
                transition: 'all 0.15s',
              }}
              onClick={() => { onAvatarChange(emoji); setShowAvatarPicker(false) }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Edit form */}
      {isEditing && form && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">👤 Name / 姓名</label>
              <input className="form-input" value={form.name} onChange={onFormChange('name')} placeholder="English name" />
            </div>
            <div className="form-group">
              <label className="form-label">🇨🇳 Chinese Name / 中文名</label>
              <input className="form-input" value={form.chineseName} onChange={onFormChange('chineseName')} placeholder="中文名字" />
            </div>
          </div>

          {profile.role === 'kid' && (
            <div className="form-group">
              <label className="form-label">🏫 Grade Level / 年级</label>
              <input className="form-input" value={form.gradeLevel} onChange={onFormChange('gradeLevel')} placeholder="e.g. Grade 7" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">🎯 Reading Goal / 阅读目标 (English)</label>
            <input className="form-input" value={form.readingGoal} onChange={onFormChange('readingGoal')} placeholder="e.g. Read 10 books this summer" />
          </div>

          <div className="form-group">
            <label className="form-label">🎯 Reading Goal / 阅读目标 (Chinese)</label>
            <input className="form-input" value={form.chineseReadingGoal} onChange={onFormChange('chineseReadingGoal')} placeholder="例如：暑假读完10本书" />
          </div>

          <div className="form-group">
            <label className="form-label">🎨 Theme Color / 主题颜色</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.color}
                  title={preset.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: preset.color,
                    border: form.themeColor === preset.color ? '3px solid var(--text-main)' : '2px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s',
                  }}
                  onClick={() => onColorPreset(preset)}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={form.themeColor}
                onChange={onFormChange('themeColor')}
                style={{ width: '44px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>Custom color / 自定义颜色</span>
            </div>
          </div>

          {/* Preview */}
          <div style={{
            background: form.themeColorLight || '#EDE9FE',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            border: `2px solid ${form.themeColor || 'var(--theme-color)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{form.avatar}</span>
            <div>
              <div style={{ fontWeight: 800, color: form.themeColor }}>{form.name || 'Name'}</div>
              <div style={{ fontSize: '0.82rem', color: form.themeColorDark || 'var(--theme-dark)' }}>{form.chineseName || '名字'}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-soft)' }}>Preview / 预览</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onCancel}>Cancel / 取消</button>
            <button
              className="btn btn-primary"
              onClick={onSave}
              disabled={!form.name.trim()}
            >
              💾 Save Profile / 保存档案
            </button>
          </div>
        </div>
      )}

      {/* Display (not editing) */}
      {!isEditing && (
        <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            {profile.readingGoal && (
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-soft)' }}>🎯 Goal: </span>
                <span>{profile.readingGoal}</span>
              </div>
            )}
            {profile.chineseReadingGoal && (
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-soft)' }}>目标: </span>
                <span>{profile.chineseReadingGoal}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
