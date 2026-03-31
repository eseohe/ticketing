import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from './api'
import { Link } from 'react-router-dom'

export default function Escalations() {
  const [tickets, setTickets] = useState<any[]>([])
  async function load() { try { const data = await apiGet('/api/tickets'); setTickets(data) } catch (err) { console.error(err) } }
  useEffect(() => { load() }, [])

  async function escalate(id: string) {
    if (!confirm('Escalate this ticket?')) return
    try { await apiPost(`/api/tickets/${id}/comments`, { body: 'Escalation requested by agent via UI' }); alert('Escalation noted (comment added)'); load() } catch (err) { alert(String(err)) }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold">Escalations</h3>
        <ul className="mt-4 space-y-3">
          {tickets.map(t => (
            <li key={t.id} className="flex justify-between items-center border rounded p-3">
              <div>
                <Link to={`/tickets/${t.id}`} className="font-medium text-indigo-700">{t.title}</Link>
                <div className="text-sm text-slate-600">{t.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{t.status}</span>
                <button onClick={() => escalate(t.id)} className="bg-red-600 text-white px-3 py-1 rounded">Escalate</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
