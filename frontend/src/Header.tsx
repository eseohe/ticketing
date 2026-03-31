import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Ticket } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const tenant = localStorage.getItem('tenant_slug')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Dashboard', href: '/dashboard' },
  ]

  const headerBg =
    scrolled || !isLanding || mobileOpen
      ? 'bg-white shadow-sm'
      : 'bg-transparent'

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-xl">
            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
              <Ticket size={16} strokeWidth={2.5} />
            </span>
            Ticketing
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {tenant ? (
              <>
                <span className="text-sm text-gray-500">
                  Workspace: <strong className="text-gray-800">{tenant}</strong>
                </span>
                <button
                  onClick={() => { localStorage.removeItem('tenant_slug'); navigate('/') }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Leave
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
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
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-1"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100">
            {tenant ? (
              <button
                onClick={() => { localStorage.removeItem('tenant_slug'); navigate('/') }}
                className="text-sm font-medium text-gray-600"
              >
                Leave workspace ({tenant})
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                Start free trial
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
