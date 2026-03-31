import React, { useEffect, useState } from 'react'
import { apiGetDepartments, apiCreateDepartment, apiDeleteDepartment } from './api'
import { useAuth } from './AuthContext'
import { Link } from 'react-router-dom'
import { Building2, Plus, X, Users, Trash2, ChevronRight } from 'lucide-react'

export default function Departments() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [departments, setDepartments] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try { setDepartments(await apiGetDepartments()) } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await apiCreateDepartment(name, desc || undefined)
      setName(''); setDesc('')
      setShowCreate(false)
      load()
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string, deptName: string) {
    if (!confirm(`Delete department "${deptName}" and all its teams?`)) return
    try {
      await apiDeleteDepartment(id)
      load()
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your workspace into departments. Each department contains teams.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> New department
          </button>
        )}
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
            <h2 className="text-xl font-bold text-gray-900 mb-1">New department</h2>
            <p className="text-sm text-gray-500 mb-6">Departments group related teams together.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="e.g. Engineering, Customer Support"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  placeholder="What does this department handle?"
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
                  {creating ? 'Creating…' : 'Create department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments grid */}
      {departments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-gray-500">No departments yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {isAdmin ? 'Create your first department to organize teams.' : 'Ask your admin to create departments.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(d => (
            <Link key={d.id} to={`/departments/${d.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 group relative block">
              {isAdmin && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(d.id, d.name) }}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete department"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <Building2 size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors mb-1">{d.name}</h3>
              {d.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{d.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={12} /> {d.team_count} team{d.team_count !== 1 ? 's' : ''}
                </span>
                <span
                  className="text-xs font-medium text-brand-600 group-hover:text-brand-700 flex items-center gap-0.5"
                >
                  Open dashboard <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
