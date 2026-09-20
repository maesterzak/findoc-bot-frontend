'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { Sparkles, Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      const search = typeof window !== 'undefined' ? window.location.search : ''
      const fullPath = search ? `${pathname}${search}` : pathname
      router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`)
    }
  }, [user, loading, router, pathname])

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090b10',
        color: '#f8fafc',
        gap: '16px',
        fontFamily: 'inherit'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '20px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#ffffff'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            color: '#fff'
          }}>
            <Sparkles size={18} />
          </span>
          finmaester
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#94a3b8'
        }}>
          <Loader2 size={16} className="animate-spin" style={{ color: '#38bdf8' }} />
          Verifying session...
        </div>
      </div>
    )
  }

  return <>{children}</>
}
