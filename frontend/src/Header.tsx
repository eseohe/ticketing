import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Ticket, LogOut, LayoutDashboard, ListTodo, AlertTriangle, Building2, Users } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLanding = location.pathname === '/'
  const isAuth = !loading && !!user

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const publicLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
  ]

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Tickets', href: '/tickets', icon: ListTodo },
    { label: 'Teams', href: '/teams', icon: Users },
    { label: 'Departments', href: '/departments', icon: Building2 },
    { label: 'Escalations', href: '/escalations', icon: AlertTriangle },
  ]

  const links = isAuth ? appLinks : publicLinks

  const headerBg = scrolled || !isLanding || mobileOpen
    ? 'bg-white/95 backdrop-blur-md shadow-sm'
    : 'bg-transparent'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuth ? '/dashboard' : '/'} className="flex items-center gap-2 text-gray-900 font-bold text-xl">
            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
              <Ticket size={16} strokeWidth={2.5} />
            </span>
            Savvy
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => {
              const active = location.pathname === l.href
              return (
                <Link
                  key={l.label}
                  to={l.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${
                    active
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth ? (
              <>
                <div className="flex items-center gap-2.5 mr-1">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                    {(user?.name ?? user?.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 leading-tight">{user?.name ?? user?.email}</p>
                    <p className="text-xs text-gray-400">{user?.tenant?.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-md shadow-brand-200"
                >
                  Start free trial
                </button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
          {links.map(l => {
            const active = location.pathname === l.href
            return (
              <Link
                key={l.label}
                to={l.href}
                className={`block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  active ? 'text-brand-700 bg-brand-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
          <div className="pt-3 mt-2 border-t border-gray-100">
            {isAuth ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                    {(user?.name ?? user?.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name ?? user?.email}</p>
                    <p className="text-xs text-gray-400">{user?.tenant?.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  Start free trial
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
