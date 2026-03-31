import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiGetTeam, apiGetTickets, apiGetStats, apiCreateTicket, apiJoinTeam, apiLeaveTeam } from './api'
import { useAuth } from './AuthContext'
import {
  ArrowLeft, Users, Ticket, UserPlus, UserMinus, Clock, Building2,
  Plus, Search, X, CheckCircle2, AlertTriangle, BarChart3
} from 'lucide-react'

const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

const priorityDot: Record<string, string> = {
  low: 'bg-gray-300',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function TeamDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [team, setTeam] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Create ticket modal
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('medium')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!id) return
    try {
      const [t, tix, s] = await Promise.all([
        apiGetTeam(id),
        apiGetTickets(filter === 'all' ? undefined : filter, id),
        apiGetStats(undefined, id),
      ])
      setTeam(t)
      setTickets(tix)
      setStats(s)
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [id, filter])

  async function toggleMembership() {
    if (!id || !team) return
    try {
      if (team.is_member) {
        await apiLeaveTeam(id)
      } else {
        await apiJoinTeam(id)
      }
      load()
    } catch { /* ignore */ }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await apiCreateTicket(title, desc, priority, id)
      setTitle(''); setDesc(''); setPriority('medium')
      setShowCreate(false)
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

  const statuses = ['all', 'open', 'in_progress', 'resolved', 'closed']

  if (!team) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/departments" className="hover:text-gray-900 transition-colors">Departments</Link>
        <span className="text-gray-300">/</span>
        {team.department_id ? (
          <Link to={`/departments/${team.department_id}`} className="hover:text-gray-900 transition-colors">{team.department_name}</Link>
        ) : (
          <span>{team.department_name}</span>
        )}
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{team.name}</span>
      </div>

      {/* Team header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                {team.is_member && (
                  <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">Member</span>
                )}
              </div>
              {team.description && (
                <p className="text-sm text-gray-500 mt-1">{team.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <Building2 size={12} /> {team.department_name} · {team.members?.length ?? 0} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMembership}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
                team.is_member
                  ? 'text-gray-700 bg-white border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                  : 'text-white bg-brand-600 border-brand-600 hover:bg-brand-700'
              }`}
            >
              {team.is_member ? <><UserMinus size={15} /> Leave</> : <><UserPlus size={15} /> Join</>}
            </button>
            {team.is_member && (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus size={16} /> New ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label="Total tickets" value={stats?.total ?? '—'} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Clock} label="Open" value={stats?.open ?? '—'} color="bg-amber-50 text-amber-600" />
        <StatCard icon={AlertTriangle} label="High priority" value={stats?.high_priority ?? '—'} color="bg-red-50 text-red-600" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats?.resolved ?? '—'} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tickets panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
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
          </div>

          {/* Ticket list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 size={16} className="text-gray-400" /> Tickets ({filtered.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-400">
                  <Ticket size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-500">No tickets in this team</p>
                  <p className="text-sm mt-1">
                    {team.is_member ? 'Create a ticket to get started.' : 'Join this team to create tickets.'}
                  </p>
                </div>
              )}
              {filtered.map(t => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[t.priority] ?? 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.status?.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Members sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-gray-400" /> Members ({team.members?.length ?? 0})
              </h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              {(team.members ?? []).map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                    {(m.name || m.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.name || m.email}</p>
                    <p className="text-xs text-gray-400">{m.role}</p>
                  </div>
                </div>
              ))}
              {(!team.members || team.members.length === 0) && (
                <p className="text-sm text-gray-400">No members yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create ticket modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">New ticket in {team.name}</h2>
            <p className="text-sm text-gray-500 mb-6">This ticket will be automatically assigned to this team.</p>
            <form onSubmit={handleCreateTicket} className="space-y-4">
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
              {/* Team is pre-selected — show as read-only */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">Team: <span className="font-semibold text-gray-900">{team.name}</span></span>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                  {creating ? 'Creating…' : 'Create ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
