'use client'

import Link from 'next/link'
import { ArrowRight, Menu, Search, Sparkles, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const examples = [
  "I'm getting this error during account creation. What could be causing it?",
  'A transaction succeeded on the channel but failed in the core banking system. What should I check?',
  'What could cause this API request to return this error?',
]

const capabilities = [
  ['Error Analysis', 'Understand what a core banking error could mean and what may have caused it.'],
  ['Troubleshooting', 'Get possible causes and practical checks to help narrow down the problem.'],
  ['Integration Issues', 'Investigate possible issues involving banking applications, APIs, and integrations.'],
  ['Incident Support', 'Use AI-assisted reasoning to investigate problems before escalating or resolving an incident.'],
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [issue, setIssue] = useState('')
  const { user, logout } = useAuth()

  function analyzeIssue() {
    if (!issue.trim()) return
    const target = `/chat?question=${encodeURIComponent(issue.trim())}`
    if (user) {
      window.location.href = target
    } else {
      window.location.href = `/login?redirect=${encodeURIComponent(target)}`
    }
  }

  return (
    <main className="marketing-page troubleshooting-page">
      <header className="marketing-nav">
        <Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={16} /></span><span>finmaester</span></Link>
        <nav className="marketing-links"><a href="#how">How it works</a><a href="#capabilities">Capabilities</a><Link href="/team">Team</Link><Link href="/contributors">Contributors</Link></nav>
        <div className="marketing-actions">
          {user ? (
            <>
              <Link href="/settings" className="button-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserRound size={15} /> {user.name || 'Account'}
              </Link>
              <Link href="/chat" className="button-primary">Assistant <ArrowRight size={16} /></Link>
            </>
          ) : (
            <>
              <Link href="/login" className="button-ghost">Log in</Link>
              <Link href="/login?redirect=%2Fchat" className="button-primary">Open assistant <ArrowRight size={16} /></Link>
            </>
          )}
          <button className="mobile-nav-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="mobile-nav">
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</a>
            <Link href="/team">Team</Link>
            <Link href="/contributors">Contributors</Link>
            {user ? (
              <>
                <Link href="/settings">Settings</Link>
                <Link href="/chat">Chat Assistant</Link>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/register">Sign up</Link>
              </>
            )}
          </div>
        )}
      </header>

      <section className="trouble-hero">
        <div className="hero-copy trouble-copy"><div className="kicker"><span className="kicker-dot" /> AI-assisted banking technology support</div><h1>Troubleshoot core<br /><em>banking issues with AI.</em></h1><p>Paste an error, describe a problem, or ask what went wrong. FinMaester helps you understand possible causes and suggests practical next steps.</p></div>
        <div className="issue-panel" aria-label="Issue analyzer"><div className="issue-panel-top"><span><span className="live-dot" /> FinMaester analyzer</span><span className="panel-label">ERROR → ANALYSIS</span></div><label htmlFor="issue">Describe the issue</label><textarea id="issue" value={issue} onChange={(event) => setIssue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); analyzeIssue() } }} placeholder="Paste a core banking error or describe the issue you're facing..." /><button className="analyze-button" onClick={analyzeIssue}><Search size={17} /> Analyze issue <ArrowRight size={16} /></button><p className="issue-note">AI-assisted troubleshooting for banking technology professionals.</p></div>
      </section>

      <section className="examples-strip"><span className="examples-label">Try an example</span><div className="examples-list">{examples.map((example) => <Link href={`/chat?question=${encodeURIComponent(example)}`} key={example}>{example}<ArrowRight size={14} /></Link>)}</div></section>

      <section className="section-centered process-section" id="how"><div className="section-eyebrow">HOW IT WORKS</div><h2>From error to possible solution.</h2><p className="section-lead">A focused path from an unexpected result to practical troubleshooting guidance.</p><div className="process-grid"><div><span>01</span><h3>Describe the issue</h3><p>Paste the error message or explain what happened.</p></div><div><span>02</span><h3>FinMaester analyzes it</h3><p>Identify relevant concepts and possible causes.</p></div><div><span>03</span><h3>Get troubleshooting guidance</h3><p>Receive recommended checks and suggested next steps.</p></div></div></section>

      <section className="section-centered capability-section" id="capabilities"><div className="section-eyebrow">BUILT FOR TROUBLESHOOTING</div><h2>Clarity when something goes wrong.</h2><div className="capability-grid">{capabilities.map(([title, description], index) => <div className="capability-card" key={title}><span className="capability-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div><p className="disclaimer">FinMaester provides AI-assisted troubleshooting suggestions. Always verify recommendations against your organization&apos;s systems, documentation, and procedures.</p></section>

      <section className="final-cta"><div><div className="section-eyebrow">NEED A SECOND LOOK?</div><h2>Stuck on an error?</h2><p>Let FinMaester help you investigate it.</p></div><Link href="/chat" className="button-primary button-large">Try FinMaester <ArrowRight size={17} /></Link></section>

      <footer className="marketing-footer"><div className="footer-brand"><Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={14} /></span><span>finmaester</span></Link><p>AI-assisted troubleshooting for banking technology.</p></div><div className="footer-links"><div><strong>Product</strong><Link href="/chat">Assistant</Link><a href="#capabilities">Capabilities</a><a href="#how">How it works</a></div><div><strong>Company</strong><Link href="/team">Team</Link><Link href="/contributors">Contributors</Link></div></div><div className="footer-bottom">© {new Date().getFullYear()} FinMaester. Built for better banking technology support.</div></footer>
    </main>
  )
}
