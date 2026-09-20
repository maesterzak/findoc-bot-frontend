'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BriefcaseBusiness, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
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
      await login({
        email: email.trim(),
        password: password.trim()
      })
      router.push('/chat')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
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
          <div className="section-eyebrow">WELCOME BACK</div>
          <h1>Continue the<br/><em>conversation.</em></h1>
          <p>Sign in to ask FinMaester about core banking.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ef4444', fontSize: '13px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>}
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
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="auth-row">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
          <button className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="animate-spin" size={16} /> Logging in...</> : 'Log in'}
          </button>
          <div className="auth-divider"><span>or</span></div>
          <button type="button" className="linkedin-button">
            <BriefcaseBusiness size={16}/> Continue with LinkedIn
          </button>
        </form>
        <p className="auth-footer">New to FinMaester? <Link href="/register">Create an account</Link></p>
      </div>
      <Link href="/" className="auth-back"><ArrowLeft size={15}/> Back to home</Link>
    </main>
  )
}
