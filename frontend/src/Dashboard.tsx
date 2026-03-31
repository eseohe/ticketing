import React, { useEffect, useState } from 'react'
import { apiGet } from './api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [tenant, setTenant] = useState<any>(null)
  useEffect(() => {
    apiGet('/api/tenants/current').then(setTenant).catch(() => setTenant(null))
  }, [])
  if (!tenant) {
    return <div className="max-w-xl mx-auto">No tenant set. Please register or set tenant slug in localStorage.</div>
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold">Tenant: {tenant.name}</h2>
        <p className="text-sm text-slate-600">Slug: {tenant.slug}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/tickets" className="bg-white p-4 rounded shadow text-center">Tickets</Link>
        <Link to="/escalations" className="bg-white p-4 rounded shadow text-center">Escalations</Link>
        <Link to="/dashboard" className="bg-white p-4 rounded shadow text-center">Settings</Link>
      </div>
    </div>
  )
}
