import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiPost } from './api'
import { CheckCircle2, Ticket } from 'lucide-react'

const perks = [
  'Fully isolated tenant workspace',
  'Unlimited tickets — first 30 days free',
  'AI-assisted responses included',
  'Cancel anytime, no questions asked',
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiPost('/api/public/tenants', {
        name,
        admin_email: email,
        admin_password: password,
      })
      localStorage.setItem('tenant_slug', res.slug)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-brand-50 to-white py-16 px-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: brand info */}
        <div>
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-xl mb-8">
            <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Ticket size={16} strokeWidth={2.5} className="text-white" />
            </span>
            Ticketing
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Start your free trial
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Set up your company's ticketing workspace in under 2 minutes. No credit card required.
          </p>
          <ul className="space-y-3.5">
            {perks.map(perk => (
              <li key={perk} className="flex items-center gap-3 text-gray-600 text-sm">
                <CheckCircle2 size={18} className="text-brand-500 flex-shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-100/60 p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your workspace</h2>
          <p className="text-sm text-gray-500 mb-7">
            Already have one?{' '}
            <Link to="/dashboard" className="text-brand-600 hover:text-brand-700 font-medium">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Company name
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Acme Corp"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Admin email
              </label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300"
            >
              {loading ? 'Creating workspace…' : 'Create workspace →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By signing up you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-600">
                Privacy Policy
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
