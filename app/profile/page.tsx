'use client'

import { useEffect, useState } from 'react'
import { Link2, UserRound, Loader2 } from 'lucide-react'
import { SettingsCard, SettingsSection } from '../../components/settings-section'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { profile } from '../../lib/api'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || 'Exploring the systems behind modern banking.')
    }
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage('')
      await profile.update({ name, bio })
      await refreshUser()
      setMessage('Profile updated successfully!')
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const displayName = user?.name || 'Alex Morgan'
  const email = user?.email || 'alex@example.com'
  const joined = user?.joined || 'September 2026'
  const provider = user?.provider || 'Email'

  return (
    <SettingsSection active="/profile" eyebrow="YOUR PROFILE" title="Profile" description="Manage the information people see about you in FinMaester.">
      <SettingsCard title="Personal details">
        {message && <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '12px' }}>{message}</div>}
        <div className="profile-avatar">
          <span><UserRound size={22}/></span>
          <div>
            <strong>{displayName}</strong>
            <p className="card-muted">Member since {joined}</p>
          </div>
          <button className="outline-button">Change photo</button>
        </div>
        <label>Display name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}/>
        </label>
        <button className="save-button" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : 'Save profile'}
        </button>
      </SettingsCard>
      
      <SettingsCard title="Connected accounts" description="Manage the services connected to your profile.">
        <div className="settings-row">
          <div>
            <strong>{provider}</strong>
            <p className="card-muted">{email}</p>
          </div>
          <span className="connected-label"><Link2 size={14}/> Connected</span>
        </div>
      </SettingsCard>
    </SettingsSection>
  )
}
