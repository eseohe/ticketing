import React, { useEffect, useState } from 'react'
import { apiGetTeams, apiGetMyTeams, apiGetDepartments, apiCreateTeam, apiJoinTeam, apiLeaveTeam } from './api'
import { useAuth } from './AuthContext'
import { Link, useSearchParams } from 'react-router-dom'
import { Users, Plus, X, UserPlus, UserMinus, ChevronRight, Building2, Filter } from 'lucide-react'

export default function Teams() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const deptFilter = searchParams.get('department')
  const [teams, setTeams] = useState<any[]>([])
  const [myTeamIds, setMyTeamIds] = useState<Set<string>>(new Set())
  const [departments, setDepartments] = useState<any[]>([])
  const [selectedDept, setSelectedDept] = useState(deptFilter ?? 'all')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [deptId, setDeptId] = useState(deptFilter ?? '')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'all' | 'my'>('all')

  async function load() {
    try {
      const [allTeams, myTeams, depts] = await Promise.all([
        apiGetTeams(selectedDept !== 'all' ? selectedDept : undefined),
        apiGetMyTeams(),
        apiGetDepartments(),
      ])
      setTeams(allTeams)
      setMyTeamIds(new Set(myTeams.map((t: any) => t.id)))
      setDepartments(depts)
      if (!deptId && depts.length > 0) setDeptId(depts[0].id)
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [selectedDept])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await apiCreateTeam(name, deptId, desc || undefined)
      setName(''); setDesc('')
      setShowCreate(false)
      load()
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally { setCreating(false) }
  }

  async function toggleMembership(teamId: string, isMember: boolean) {
    try {
      if (isMember) {
        await apiLeaveTeam(teamId)
      } else {
        await apiJoinTeam(teamId)
      }
      load()
    } catch { /* ignore */ }
  }

  const displayed = tab === 'my' ? teams.filter(t => myTeamIds.has(t.id)) : teams

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join teams to see their tickets. You can join teams across departments.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} /> New team
        </button>
      </div>

      {/* Tabs & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'my'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors capitalize ${
                tab === t ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t === 'my' ? 'My teams' : 'All teams'}
            </button>
          ))}
        </div>
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">New team</h2>
            <p className="text-sm text-gray-500 mb-6">Create a team within a department. You'll be added as the first member.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  value={deptId}
                  onChange={e => setDeptId(e.target.value)}
                  required
                >
                  <option value="">Select department…</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Team name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="e.g. Frontend, Billing Support"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  placeholder="What does this team work on?"
                  rows={3}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                  {creating ? 'Creating…' : 'Create team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams list */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <Users size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-gray-500">{tab === 'my' ? 'You haven\'t joined any teams yet' : 'No teams found'}</p>
          <p className="text-sm text-gray-400 mt-1">
            {tab === 'my' ? 'Browse all teams and join one to see tickets.' : 'Create the first team to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map(t => {
            const isMember = myTeamIds.has(t.id)
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <button
                    onClick={() => toggleMembership(t.id, isMember)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      isMember
                        ? 'text-gray-600 bg-gray-50 border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                        : 'text-brand-700 bg-brand-50 border-brand-200 hover:bg-brand-100'
                    }`}
                  >
                    {isMember ? <><UserMinus size={12} /> Leave</> : <><UserPlus size={12} /> Join</>}
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5">{t.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <Building2 size={11} /> {t.department_name}
                </p>
                {t.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{t.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{t.member_count} member{t.member_count !== 1 ? 's' : ''}</span>
                  <Link
                    to={`/teams/${t.id}`}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    Details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
