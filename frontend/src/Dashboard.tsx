import React, { useEffect, useState } from 'react'
import { apiGetStats, apiGetTickets, apiGetMembers, apiGetMyTeams } from './api'
import { useAuth } from './AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Ticket, Clock, CheckCircle2, AlertTriangle, Plus, Users, ArrowRight, Copy, Check, Building2 } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

const priorityDot: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [myTeams, setMyTeams] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    apiGetStats().then(setStats).catch(() => {})
    apiGetTickets().then(d => setTickets(d.slice(0, 5))).catch(() => {})
    apiGetMembers().then(setMembers).catch(() => {})
    apiGetMyTeams().then(setMyTeams).catch(() => {})
  }, [])

  function copyInvite() {
    if (user?.tenant?.invite_code) {
      navigator.clipboard.writeText(user.tenant.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening in <span className="font-semibold text-gray-700">{user?.tenant?.name ?? 'your workspace'}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets?create=1')}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} /> New ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label="Total tickets" value={stats?.total ?? '—'} color="bg-brand-50 text-brand-600" />
        <StatCard icon={Clock} label="Open" value={stats?.open ?? '—'} color="bg-blue-50 text-blue-600" />
        <StatCard icon={AlertTriangle} label="High priority" value={stats?.high_priority ?? '—'} color="bg-amber-50 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats?.resolved ?? '—'} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" /> Recent tickets
            </h2>
            <Link to="/tickets" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {tickets.length === 0 && (
              <div className="px-6 py-10 text-center text-gray-400">
                <Ticket size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-500">No tickets yet</p>
                <p className="text-sm mt-1">Create your first ticket to get started</p>
              </div>
            )}
            {tickets.map(t => (
              <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[t.priority] ?? 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {t.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Teams */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" /> My teams
              </h2>
              <Link to="/teams" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Browse all</Link>
            </div>
            <div className="px-6 py-4 space-y-2">
              {myTeams.length === 0 && (
                <p className="text-sm text-gray-400">
                  No teams yet. <Link to="/teams" className="text-brand-600 hover:text-brand-700 font-medium">Join a team</Link>
                </p>
              )}
              {myTeams.slice(0, 5).map((t: any) => (
                <Link key={t.id} to={`/teams/${t.id}`} className="flex items-center gap-3 py-1.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.department_name} · {t.member_count} members</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-gray-400" /> Workspace members
              </h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              {members.slice(0, 5).map((m: any) => (
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
              {members.length === 0 && <p className="text-sm text-gray-400">Just you for now</p>}
            </div>
          </div>

          {/* Invite */}
          {user?.role === 'admin' && user?.tenant?.invite_code && (
            <div className="bg-brand-50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-brand-900 mb-1">Invite your team</h3>
              <p className="text-xs text-brand-700 mb-3">Share your workspace slug so agents can join.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white text-sm text-gray-900 px-3 py-2 rounded-lg border border-brand-200 font-mono truncate">
                  {user.tenant.slug}
                </code>
                <button onClick={copyInvite} className="p-2 rounded-lg bg-white border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
