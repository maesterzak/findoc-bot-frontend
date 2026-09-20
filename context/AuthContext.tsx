'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, setAuthToken } from '../lib/api'

interface User {
  id: number
  email: string
  name: string
  joined: string
  provider: string
  bio: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (body: any) => Promise<void>
  register: (body: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('findoc_token')
    const savedUser = localStorage.getItem('findoc_user')

    if (savedToken) {
      setToken(savedToken)
      setAuthToken(savedToken)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {
          // ignore
        }
      }
      // Fetch fresh current user data
      auth.me()
        .then((u: any) => {
          setUser(u)
          localStorage.setItem('findoc_user', JSON.stringify(u))
        })
        .catch(() => {
          // If token invalid, logout
          logout()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (body: any) => {
    const res: any = await auth.login(body)
    if (res.token) {
      setToken(res.token)
      setUser(res.user)
      setAuthToken(res.token)
      localStorage.setItem('findoc_token', res.token)
      localStorage.setItem('findoc_user', JSON.stringify(res.user))
    }
  }

  const register = async (body: any) => {
    const res: any = await auth.register(body)
    if (res.token) {
      setToken(res.token)
      setUser(res.user)
      setAuthToken(res.token)
      localStorage.setItem('findoc_token', res.token)
      localStorage.setItem('findoc_user', JSON.stringify(res.user))
    }
  }

  const logout = async () => {
    try {
      await auth.logout()
    } catch {
      // ignore
    }
    setToken(null)
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('findoc_token')
    localStorage.removeItem('findoc_user')
  }

  const refreshUser = async () => {
    try {
      const u: any = await auth.me()
      setUser(u)
      localStorage.setItem('findoc_user', JSON.stringify(u))
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
