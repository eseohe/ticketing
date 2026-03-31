// In dev mode, VITE_API_URL is empty so requests go through the Vite proxy (/api → backend).
// In production builds, set VITE_API_URL at build time (e.g. https://api.yourdomain.com).
export const API_BASE: string = (import.meta.env.VITE_API_URL as string) ?? ''

function tenantHeader(): Record<string, string> {
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
    credentials: 'include' as RequestCredentials,
  })
  return handleRes(res)
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tenantHeader() },
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify(body),
  })
  return handleRes(res)
}

export async function apiPostForm(path: string, formData: FormData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...tenantHeader() },
    credentials: 'include' as RequestCredentials,
    body: formData,
  })
  return handleRes(res)
}
