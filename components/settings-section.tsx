'use client'

import Link from 'next/link'
import { ArrowLeft, CreditCard, Lock, Palette, UserRound } from 'lucide-react'

export const settingsItems = [
  { href: '/settings', label: 'Account', icon: UserRound },
  { href: '/profile', label: 'Profile', icon: UserRound },
  { href: '/settings/security', label: 'Security', icon: Lock },
  { href: '/settings/usage', label: 'Usage & plan', icon: CreditCard },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
]

export function SettingsSection({ active, eyebrow, title, description, children }: { active: string; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="settings-page">
      <header className="settings-header"><Link href="/chat" className="back-link"><ArrowLeft size={15} /> Back to chat</Link><Link href="/" className="marketing-brand"><span className="brand-mark">✦</span>finmaester</Link></header>
      <div className="settings-layout">
        <aside className="settings-nav"><h1>Settings</h1>{settingsItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={active === href ? 'active' : ''}><Icon size={16} />{label}</Link>)}</aside>
        <section className="settings-content"><div className="settings-intro"><div className="section-eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>{children}</section>
      </div>
    </main>
  )
}

export function SettingsCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <div className="settings-card"><h3>{title}</h3>{description && <p className="card-muted">{description}</p>}{children}</div>
}

export function Toggle({ label, checked = false }: { label: string; checked?: boolean }) {
  return <label className="toggle-row"><span>{label}</span><input type="checkbox" defaultChecked={checked} /><i /></label>
}

export function Progress({ label, used, limit, reset }: { label: string; used: number; limit: number; reset: string }) {
  return <div className="usage-item"><div><strong>{label}</strong><span>{used} / {limit}</span></div><div className="usage-bar"><i style={{ width: `${Math.round(used / limit * 100)}%` }} /></div><small>{limit - used} remaining · {reset}</small></div>
}
