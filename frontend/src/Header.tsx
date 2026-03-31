import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button'
import { motion } from 'framer-motion'

export default function Header() {
  const navigate = useNavigate()
  const tenant = localStorage.getItem('tenant_slug')

  return (
    <motion.header className="bg-white/80 backdrop-blur-sm shadow-sm" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-indigo-600">Ticketing</Link>
          <nav className="hidden md:flex space-x-3 text-slate-600">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
            <Link to="/tickets" className="hover:text-slate-900">Tickets</Link>
            <Link to="/escalations" className="hover:text-slate-900">Escalations</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          {!tenant ? (
            <Button variant="primary" onClick={() => navigate('/register')}>Get started</Button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Tenant: <strong className="text-slate-800 ml-1">{tenant}</strong></span>
              <Button variant="ghost" onClick={() => { localStorage.removeItem('tenant_slug'); navigate('/'); }}>Leave</Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
