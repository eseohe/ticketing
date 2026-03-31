import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiGetTicket, apiGetComments, apiAddComment, apiUpdateTicket, apiGetMembers } from './api'
import { useAuth } from './AuthContext'
import { ArrowLeft, MessageSquare, Clock, Send, User } from 'lucide-react'

const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
}

const priorityConfig: Record<string, { dot: string; label: string }> = {
  low: { dot: 'bg-gray-400', label: 'Low' },
  medium: { dot: 'bg-blue-500', label: 'Medium' },
  high: { dot: 'bg-amber-500', label: 'High' },
  urgent: { dot: 'bg-red-500', label: 'Urgent' },
}

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  async function loadTicket() {
    if (!id) return
    try {
      const t = await apiGetTicket(id)
      setTicket(t)
    } catch { /* ignore */ }
  }

  async function loadComments() {
    if (!id) return
    try {
      const c = await apiGetComments(id)
      setComments(c)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadTicket()
    loadComments()
    apiGetMembers().then(setMembers).catch(() => {})
  }, [id])

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !comment.trim()) return
    setSending(true)
    try {
      await apiAddComment(id, comment)
      setComment('')
      loadComments()
    } catch { /* ignore */ }
    setSending(false)
  }

  async function updateStatus(status: string) {
    if (!id) return
    try {
      await apiUpdateTicket(id, { status })
      loadTicket()
    } catch { /* ignore */ }
  }

  async function updatePriority(priority: string) {
    if (!id) return
    try {
      await apiUpdateTicket(id, { priority })
      loadTicket()
    } catch { /* ignore */ }
  }

  async function updateAssignee(assignee_id: string) {
    if (!id) return
    try {
      await apiUpdateTicket(id, { assignee_id: assignee_id || undefined })
      loadTicket()
    } catch { /* ignore */ }
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const pri = priorityConfig[ticket.priority] ?? { dot: 'bg-gray-300', label: ticket.priority }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={14} /> Back to tickets
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${pri.dot}`} />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColor[ticket.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {ticket.status?.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            {ticket.description && (
              <p className="text-sm text-gray-600 leading-relaxed pl-5 border-l-2 border-gray-100">
                {ticket.description}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-gray-400" />
                Activity ({comments.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {comments.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-400">
                  <MessageSquare size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No comments yet. Be the first to respond.</p>
                </div>
              )}
              {comments.map((c: any) => (
                <div key={c.id} className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                      {(c.author_name ?? c.author_id ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{c.author_name ?? 'Agent'}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' '}
                      {new Date(c.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed ml-10">{c.body}</p>
                </div>
              ))}
            </div>

            {/* Comment form */}
            <div className="px-6 py-4 border-t border-gray-100">
              <form onSubmit={handleComment} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1.5">
                  {(user?.name ?? user?.email ?? 'Y')[0].toUpperCase()}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    placeholder="Write a comment…"
                    rows={2}
                  />
                  <button
                    type="submit"
                    disabled={sending || !comment.trim()}
                    className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-30 text-white transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={ticket.status}
                onChange={e => updateStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
              <select
                value={ticket.priority ?? 'medium'}
                onChange={e => updatePriority(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignee</label>
              <select
                value={ticket.assignee_id ?? ''}
                onChange={e => updateAssignee(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="text-gray-900 font-mono text-xs">{ticket.id?.slice(0, 8)}…</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{new Date(ticket.created_at).toLocaleDateString()}</dd>
              </div>
              {ticket.updated_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Updated</dt>
                  <dd className="text-gray-900">{new Date(ticket.updated_at).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
