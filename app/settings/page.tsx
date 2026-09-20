'use client'

import { useEffect, useState } from 'react'
import { SettingsCard, SettingsSection } from '../../components/settings-section'
import { useAuth } from '../../context/AuthContext'
import { profile } from '../../lib/api'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      setMsg('')
      await profile.update({ name })
      await refreshUser()
      setMsg('Changes saved!')
    } catch (err: any) {
      setMsg(err.message || 'Error saving changes.')
    } finally {
      setSaving(false)
    }
  }

  const email = user?.email || 'alex@example.com'
  const joined = user?.joined || 'September 2026'

  return (
    <SettingsSection active="/settings" eyebrow="ACCOUNT SETTINGS" title="Account" description="Manage your profile and FinMaester preferences.">
      <SettingsCard title="Account details">
        {msg && <div style={{ fontSize: '13px', color: '#10b981', marginBottom: '12px' }}>{msg}</div>}
        <label>Full name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>Email
          <input value={email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
        </label>
        <button className="save-button" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : 'Save changes'}
        </button>
      </SettingsCard>

      <SettingsCard title="Account status" description="Your FinMaester account is active and ready to use.">
        <div className="security-note">
          <span className="status-dot"/> <span>Active account · Member since {joined}</span>
        </div>
      </SettingsCard>
    </SettingsSection>
  )
}
