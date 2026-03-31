import React, { useEffect, useState } from 'react'
import { apiGetTickets, apiCreateTicket, apiGetMyTeams } from './api'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, X, Ticket, Filter } from 'lucide-react'

const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
}

const priorityBadge: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-600',
  high: 'text-amber-600',
  urgent: 'text-red-600',
}

const priorityDot: Record<string, string> = {
  low: 'bg-gray-300',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

const statuses = ['all', 'open', 'in_progress', 'resolved', 'closed']

export default function Tickets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tickets, setTickets] = useState<any[]>([])
  const [myTeams, setMyTeams] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState(searchParams.get('team') ?? 'all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(searchParams.get('create') === '1')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('medium')
  const [teamId, setTeamId] = useState(searchParams.get('team') ?? '')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await apiGetTickets(
        filter === 'all' ? undefined : filter,
        teamFilter !== 'all' ? teamFilter : undefined,
      )
      setTickets(data)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    apiGetMyTeams().then(setMyTeams).catch(() => {})
  }, [])

  useEffect(() => { load() }, [filter, teamFilter])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await apiCreateTicket(title, desc, priority, teamId || undefined)
      setTitle(''); setDesc(''); setPriority('medium')
      setShowCreate(false)
      searchParams.delete('create')
      setSearchParams(searchParams)
      load()
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally {
      setCreating(false)
    }
  }

  const filtered = tickets.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} /> New ticket
        </button>
      </div>

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Search tickets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors capitalize ${
                filter === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s === 'in_progress' ? 'In progress' : s}
            </button>
          ))}
        </div>
        {myTeams.length > 0 && (
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All teams</option>
            {myTeams.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => { setShowCreate(false); searchParams.delete('create'); setSearchParams(searchParams) }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create a ticket</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in the details below to log a new ticket.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  placeholder="Provide more details…"
                  rows={4}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              {myTeams.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Team <span className="text-gray-400 font-normal">(optional)</span></label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    value={teamId}
                    onChange={e => setTeamId(e.target.value)}
                  >
                    <option value="">No team</option>
                    {myTeams.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.department_name} → {t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); searchParams.delete('create'); setSearchParams(searchParams) }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  {creating ? 'Creating…' : 'Create ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Ticket size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-500">No tickets found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? 'Try a different search term' : 'Create your first ticket to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Ticket</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden sm:table-cell">Priority</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/tickets/${t.id}`} className="block">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">{t.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {t.team_name && (
                            <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-medium">{t.team_name}</span>
                          )}
                          {t.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">{t.description}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize">
                        <span className={`w-2 h-2 rounded-full ${priorityDot[t.priority] ?? 'bg-gray-300'}`} />
                        <span className={priorityBadge[t.priority] ?? 'text-gray-500'}>{t.priority ?? '—'}</span>
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColor[t.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {t.status?.replace('_', ' ') ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-4 hidden md:table-cell text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
