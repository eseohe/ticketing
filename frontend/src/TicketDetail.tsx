import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet, apiPost } from './api'

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState<any>(null)
  const [comment, setComment] = useState('')
  async function load() {
    if (!id) return
    try { const t = await apiGet(`/api/tickets/${id}`); setTicket(t) } catch (err) { console.error(err) }
  }
  useEffect(() => { load() }, [id])

  async function submitComment(e: any) {
    e.preventDefault()
    try { await apiPost(`/api/tickets/${id}/comments`, { body: comment }); setComment(''); load() } catch (err) { alert(String(err)) }
  }

  if (!ticket) return <div>Loading...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold">{ticket.title}</h2>
        <p className="text-slate-600 mt-2">{ticket.description}</p>
        <div className="text-sm text-slate-500 mt-4">Status: {ticket.status}</div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold">Add Comment</h3>
        <form onSubmit={submitComment} className="mt-3">
          <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full border p-2 rounded" rows={4} />
          <div className="mt-2">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">Add Comment</button>
          </div>
        </form>
      </div>
    </div>
  )
}
