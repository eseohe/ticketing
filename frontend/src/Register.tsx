import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from './api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiPost('/api/public/tenants', { name, admin_email: email, admin_password: password })
      localStorage.setItem('tenant_slug', res.slug)
      navigate('/dashboard')
    } catch (err: any) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg p-8 shadow">
      <h2 className="text-2xl font-bold mb-4">Create your company's ticketing system</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Company name</label>
          <input className="mt-1 block w-full border rounded-md p-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Admin email</label>
          <input type="email" className="mt-1 block w-full border rounded-md p-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input type="password" className="mt-1 block w-full border rounded-md p-2" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md">
            {loading ? 'Creating...' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  )
}
