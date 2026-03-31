import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Ticket, Users, CheckCircle2 } from 'lucide-react'

const perks = [
  'Access your team\'s shared ticket queue instantly',
  'Collaborate with other agents in real time',
  'Get AI-assisted response suggestions',
  'Track SLAs and your personal resolution stats',
]

export default function Join() {
  const { joinTenant } = useAuth()
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await joinTenant(slug, name, email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-16 px-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: info */}
        <div>
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-xl mb-8">
            <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Ticket size={16} strokeWidth={2.5} className="text-white" />
            </span>
            Savvy
          </Link>

          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-semibold px-3.5 py-1.5 rounded-full mb-5">
            <Users size={14} />
            Join your team
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Join an existing workspace
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Your company already has a Savvy workspace. Enter the workspace slug (ask your admin) to create your agent account and start handling tickets.
          </p>
          <ul className="space-y-3.5">
            {perks.map(perk => (
              <li key={perk} className="flex items-center gap-3 text-gray-600 text-sm">
                <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-100/60 p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-7">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
            {' · '}
            Need a new workspace?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Register
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Workspace slug</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="acme-corp"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Ask your workspace admin for this</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="jane@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min. 8 characters"
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-blue-200"
            >
              {loading ? 'Joining workspace…' : 'Join workspace →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By joining you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
