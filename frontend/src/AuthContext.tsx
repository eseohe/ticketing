import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiLogin, apiLogout, apiMe, apiRegisterBusiness, apiJoinTenant } from './api'

interface User {
  id: string
  email: string
  name: string
  role: string
  tenant: { id: string; slug: string; name: string; invite_code: string } | null
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (slug: string, email: string, password: string) => Promise<void>
  registerBusiness: (name: string, email: string, password: string) => Promise<{ slug: string }>
  joinTenant: (slug: string, name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await apiMe()
      setUser(me)
      if (me.tenant) {
        localStorage.setItem('tenant_slug', me.tenant.slug)
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('tenant_slug')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (slug: string, email: string, password: string) => {
    const res = await apiLogin(slug, email, password)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('tenant_slug', slug)
    await loadUser()
  }

  const registerBusiness = async (name: string, email: string, password: string) => {
    const res = await apiRegisterBusiness(name, email, password)
    // After registering, auto-login
    localStorage.setItem('tenant_slug', res.slug)
    await login(res.slug, email, password)
    return { slug: res.slug }
  }

  const joinTenant = async (slug: string, name: string, email: string, password: string) => {
    await apiJoinTenant(slug, name, email, password)
    await login(slug, email, password)
  }

  const logout = async () => {
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    localStorage.removeItem('tenant_slug')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, registerBusiness, joinTenant, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
