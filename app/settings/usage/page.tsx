'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Sparkles, Loader2 } from 'lucide-react'
import { Progress, SettingsCard, SettingsSection } from '../../../components/settings-section'
import { usage } from '../../../lib/api'

interface UsageData {
  daily: { used: number; limit: number; remaining: number; resetAt: string }
  weekly: { used: number; limit: number; remaining: number; resetAt: string }
  monthly: { used: number; limit: number; remaining: number; resetAt: string }
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usage.getCurrentUsage()
      .then((res: any) => setData(res))
      .catch((err) => console.error('Failed to fetch usage:', err))
      .finally(() => setLoading(false))
  }, [])

  const daily = data?.daily || { used: 0, limit: 100, resetAt: 'Resets in 8 hours' }
  const weekly = data?.weekly || { used: 0, limit: 500, resetAt: 'Resets Monday' }
  const monthly = data?.monthly || { used: 0, limit: 1000, resetAt: 'Resets October 1' }

  return (
    <SettingsSection active="/settings/usage" eyebrow="USAGE & PLAN" title="Usage & plan" description="Keep track of your FinMaester questions and plan limits.">
      <SettingsCard title="Free plan" description="Explore the core concepts behind banking and finance.">
        <div className="plan-summary">
          <span className="plan-icon"><Sparkles size={18}/></span>
          <div>
            <strong>Free</strong>
            <p className="card-muted">Your current plan</p>
          </div>
          <button className="upgrade-button">Upgrade plan</button>
        </div>
        <div className="plan-limits">
          <span><b>{daily.limit}</b> questions / day</span>
          <span><b>{weekly.limit}</b> questions / week</span>
          <span><b>{monthly.limit}</b> questions / month</span>
        </div>
      </SettingsCard>

      <SettingsCard title="Your usage" description="Usage resets automatically for each period.">
        {loading ? (
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
            <Loader2 size={16} className="animate-spin" /> Loading usage metrics...
          </div>
        ) : (
          <div className="usage-grid">
            <Progress label="Daily" used={daily.used} limit={daily.limit} reset={`Resets: ${daily.resetAt}`}/>
            <Progress label="Weekly" used={weekly.used} limit={weekly.limit} reset={`Resets: ${weekly.resetAt}`}/>
            <Progress label="Monthly" used={monthly.used} limit={(monthly as any).monthly?.limit || monthly.limit} reset={`Resets: ${monthly.resetAt}`}/>
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Billing">
        <div className="settings-row">
          <div>
            <strong>Payment method</strong>
            <p className="card-muted">No payment method added</p>
          </div>
          <button className="outline-button"><CreditCard size={15}/> Manage billing</button>
        </div>
      </SettingsCard>
    </SettingsSection>
  )
}
