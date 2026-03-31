import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Ticket, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(slug, email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Ticket size={16} strokeWidth={2.5} />
          </span>
          Savvy
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome back.
          </h2>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Sign in to your workspace to manage tickets, respond to customers, and collaborate with your team.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {['bg-violet-500', 'bg-blue-500', 'bg-rose-500'].map((bg, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-gray-900 ${bg} flex items-center justify-center text-white text-xs font-bold`}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-gray-400 text-sm">10,000+ support teams trust Savvy</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Ticket size={16} strokeWidth={2.5} className="text-white" />
              </span>
              Savvy
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-7">
            Don't have a workspace?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Create one
            </Link>
            {' · '}
            <Link to="/join" className="text-brand-600 hover:text-brand-700 font-medium">
              Join existing
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Workspace slug</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="acme-corp"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">The slug you received when the workspace was created</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
