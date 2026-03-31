import React, { useEffect, useState } from 'react'
import { apiGetTickets, apiUpdateTicket, apiAddComment } from './api'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react'

const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
}

const priorityDot: Record<string, string> = {
  low: 'bg-gray-300',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export default function Escalations() {
  const [tickets, setTickets] = useState<any[]>([])

  async function load() {
    try {
      const data = await apiGetTickets()
      // Show high-priority and urgent open tickets
      setTickets(data.filter((t: any) =>
        ['high', 'urgent'].includes(t.priority) || t.status === 'open'
      ))
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [])

  async function escalate(id: string) {
    try {
      await apiUpdateTicket(id, { priority: 'urgent' })
      await apiAddComment(id, '⚠️ This ticket has been escalated to urgent priority.')
      load()
    } catch { /* ignore */ }
  }

  const urgent = tickets.filter(t => t.priority === 'urgent')
  const high = tickets.filter(t => t.priority === 'high')
  const other = tickets.filter(t => !['urgent', 'high'].includes(t.priority))

  function TicketRow({ t }: { t: any }) {
    return (
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priorityDot[t.priority] ?? 'bg-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <Link to={`/tickets/${t.id}`} className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
            {t.title}
          </Link>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={11} />
              {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColor[t.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {t.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
        {t.priority !== 'urgent' && (
          <button
            onClick={() => escalate(t.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowUpRight size={12} /> Escalate
          </button>
        )}
        {t.priority === 'urgent' && (
          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <AlertTriangle size={12} /> Urgent
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor and escalate high-priority tickets that need immediate attention.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
          <AlertTriangle size={20} className="text-red-500" />
          <div>
            <p className="text-2xl font-bold text-red-900">{urgent.length}</p>
            <p className="text-sm text-red-700">Urgent tickets</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <ArrowUpRight size={20} className="text-amber-500" />
          <div>
            <p className="text-2xl font-bold text-amber-900">{high.length}</p>
            <p className="text-sm text-amber-700">High priority</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
          <Clock size={20} className="text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-blue-900">{other.length}</p>
            <p className="text-sm text-blue-700">Open (normal)</p>
          </div>
        </div>
      </div>

      {/* Urgent */}
      {urgent.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <h2 className="font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle size={16} /> Urgent — Immediate action required
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {urgent.map(t => <TicketRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* High */}
      {high.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ArrowUpRight size={16} className="text-amber-500" /> High priority
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {high.map(t => <TicketRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* Other open */}
      {other.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Other open tickets</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {other.map(t => <TicketRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {tickets.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-4 text-green-400" />
          <p className="font-medium text-gray-600">All clear!</p>
          <p className="text-sm text-gray-400 mt-1">No tickets need escalation right now.</p>
        </div>
      )}
    </div>
  )
}
