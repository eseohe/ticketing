export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function tenantHeader() {
  const slug = localStorage.getItem('tenant_slug')
  return slug ? { 'X-Tenant-Slug': slug } : {}
}

async function handleRes(res: Response) {
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || res.statusText)
  }
  return res.json()
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...tenantHeader() },
    credentials: 'include',
  })
  return handleRes(res)
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tenantHeader() },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return handleRes(res)
}

export async function apiPostForm(path: string, formData: FormData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...tenantHeader() },
    credentials: 'include',
    body: formData,
  })
  return handleRes(res)
}
