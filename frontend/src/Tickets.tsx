import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from './api'
import { Link } from 'react-router-dom'

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const data = await apiGet('/api/tickets')
      setTickets(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { load() }, [])

  async function createTicket(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost('/api/tickets', { title, description: desc })
      setTitle(''); setDesc(''); load()
    } catch (err) {
      alert(String(err))
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold">Create Ticket</h3>
        <form className="mt-3 space-y-3" onSubmit={createTicket}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Subject" className="w-full border p-2 rounded" required />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full border p-2 rounded" rows={4} />
          <div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Ticket'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold">Recent Tickets</h3>
        <ul className="mt-4 space-y-2">
          {tickets.length === 0 && <li className="text-slate-500">No tickets yet.</li>}
          {tickets.map(t => (
            <li key={t.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <Link to={`/tickets/${t.id}`} className="font-medium text-indigo-700">{t.title}</Link>
                <div className="text-sm text-slate-600">{t.description}</div>
              </div>
              <div className="text-sm text-slate-500">{new Date(t.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
