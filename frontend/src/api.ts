// In dev mode requests go through the Vite proxy (/api → backend).
// In production builds, set VITE_API_URL at build time.
export const API_BASE: string = (import.meta.env.VITE_API_URL as string) ?? ''

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function tenantHeader(): Record<string, string> {
  const slug = localStorage.getItem('tenant_slug')
  return slug ? { 'X-Tenant-Slug': slug } : {}
}

function headers(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...tenantHeader(), ...authHeader() }
}

async function handleRes(res: Response) {
  if (!res.ok) {
    const txt = await res.text()
    let msg = txt
    try { msg = JSON.parse(txt).detail ?? txt } catch { /* plain text */ }
    throw new Error(msg || res.statusText)
  }
  return res.json()
}

// ── Auth ────────────────────────────────────────────────────────────────────
export async function apiLogin(slug: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tenantHeader() },
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify({ slug, email, password }),
  })
  return handleRes(res)
}

export async function apiLogout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
  })
  return handleRes(res)
}

export async function apiMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: headers(),
    credentials: 'include' as RequestCredentials,
  })
  return handleRes(res)
}

// ── Tenant ──────────────────────────────────────────────────────────────────
export async function apiRegisterBusiness(name: string, adminEmail: string, adminPassword: string) {
  const res = await fetch(`${API_BASE}/api/public/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, admin_email: adminEmail, admin_password: adminPassword }),
  })
  return handleRes(res)
}

export async function apiJoinTenant(slug: string, name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/public/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, name, email, password }),
  })
  return handleRes(res)
}

// ── Tickets ─────────────────────────────────────────────────────────────────
export async function apiGetTickets(status?: string, teamId?: string, myTeams?: boolean, departmentId?: string) {
  const qs = new URLSearchParams()
  if (status) qs.set('status', status)
  if (teamId) qs.set('team_id', teamId)
  if (departmentId) qs.set('department_id', departmentId)
  if (myTeams) qs.set('my_teams', 'true')
  const q = qs.toString()
  const res = await fetch(`${API_BASE}/api/tickets${q ? '?' + q : ''}`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiGetTicket(id: string) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiCreateTicket(title: string, description: string, priority: string, teamId?: string) {
  const body: any = { title, description, priority }
  if (teamId) body.team_id = teamId
  const res = await fetch(`${API_BASE}/api/tickets`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify(body),
  })
  return handleRes(res)
}

export async function apiUpdateTicket(id: string, data: { status?: string; priority?: string; assignee_id?: string; team_id?: string }) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
    method: 'PATCH',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify(data),
  })
  return handleRes(res)
}

// ── Comments ────────────────────────────────────────────────────────────────
export async function apiGetComments(ticketId: string) {
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/comments`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiAddComment(ticketId: string, body: string) {
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify({ body }),
  })
  return handleRes(res)
}

// ── Stats / Members ─────────────────────────────────────────────────────────
export async function apiGetStats(departmentId?: string, teamId?: string) {
  const qs = new URLSearchParams()
  if (departmentId) qs.set('department_id', departmentId)
  if (teamId) qs.set('team_id', teamId)
  const q = qs.toString()
  const res = await fetch(`${API_BASE}/api/stats${q ? '?' + q : ''}`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiGetMembers() {
  const res = await fetch(`${API_BASE}/api/tenants/members`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

// ── Departments ──────────────────────────────────────────────────────────────
export async function apiGetDepartments() {
  const res = await fetch(`${API_BASE}/api/departments`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiGetDepartment(id: string) {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiCreateDepartment(name: string, description?: string) {
  const res = await fetch(`${API_BASE}/api/departments`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify({ name, description }),
  })
  return handleRes(res)
}

export async function apiDeleteDepartment(id: string) {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, {
    method: 'DELETE',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
  })
  if (!res.ok) {
    const txt = await res.text()
    let msg = txt
    try { msg = JSON.parse(txt).detail ?? txt } catch { /* plain text */ }
    throw new Error(msg || res.statusText)
  }
  return null
}

// ── Teams ────────────────────────────────────────────────────────────────────
export async function apiGetTeams(departmentId?: string) {
  const qs = departmentId ? `?department_id=${departmentId}` : ''
  const res = await fetch(`${API_BASE}/api/teams${qs}`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiGetMyTeams() {
  const res = await fetch(`${API_BASE}/api/teams/my`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiGetTeam(id: string) {
  const res = await fetch(`${API_BASE}/api/teams/${id}`, { headers: headers(), credentials: 'include' as RequestCredentials })
  return handleRes(res)
}

export async function apiCreateTeam(name: string, departmentId: string, description?: string) {
  const res = await fetch(`${API_BASE}/api/teams`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify({ name, department_id: departmentId, description }),
  })
  return handleRes(res)
}

export async function apiJoinTeam(teamId: string) {
  const res = await fetch(`${API_BASE}/api/teams/${teamId}/join`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
  })
  return handleRes(res)
}

export async function apiLeaveTeam(teamId: string) {
  const res = await fetch(`${API_BASE}/api/teams/${teamId}/leave`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include' as RequestCredentials,
  })
  return handleRes(res)
}
