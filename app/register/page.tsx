'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BriefcaseBusiness, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    try {
      setError('')
      setIsSubmitting(true)
      await register({
        email: email.trim(),
        password: password.trim(),
        full_name: fullName.trim()
      })
      router.push('/chat')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <span className="brand-mark"><Sparkles size={15}/></span>finmaester
        </Link>
        <div className="auth-copy">
          <div className="section-eyebrow">GET STARTED</div>
          <h1>Ask better<br/><em>banking questions.</em></h1>
          <p>Create your FinMaester account to begin.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>}
          <label>Full name
            <input
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label>Email
            <input
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>Password
            <input
              type="password"
              placeholder="Create a password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="animate-spin" size={16} /> Creating account...</> : 'Create account'}
          </button>
          <div className="auth-divider"><span>or</span></div>
          <button type="button" className="linkedin-button">
            <BriefcaseBusiness size={16}/> Continue with LinkedIn
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </main>
  )
}
