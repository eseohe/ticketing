import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Card from './Card'
import AnimatedList from './AnimatedList'
import { motion } from 'framer-motion'

export default function Landing() {
  const navigate = useNavigate()
  const features = [
    { id: 'multi', title: 'Multi-tenant', desc: 'Isolate company data with PostgreSQL RLS and tenant aware backend.' },
    { id: 'workflows', title: 'Fast workflows', desc: 'Agent-focused UI for triage and quick resolution.' },
    { id: 'ai', title: 'AI assistance', desc: 'Optional suggested replies and knowledge-base search.' },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <motion.h1 className="text-4xl md:text-5xl font-extrabold leading-tight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Support, triaged and resolved — at scale</motion.h1>
          <motion.p className="mt-4 text-indigo-100 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}>Multi-tenant ticketing for companies: subdomain provisioning, roles, SLAs, and AI-assisted responses. Built for speed and privacy.</motion.p>
          <div className="mt-6 flex items-center gap-4">
            <Button onClick={() => navigate('/register')} className="shadow-lg">Start free trial</Button>
            <a className="text-indigo-100 underline" href="#features">Learn more</a>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <Card>
            <h3 className="text-xl font-semibold">Live demo</h3>
            <ul className="mt-4 space-y-2 text-indigo-50 text-sm">
              <li>Ticket creation & assignment</li>
              <li>Internal comments & attachments</li>
              <li>Escalations & reporting</li>
            </ul>
          </Card>
        </div>
      </div>
      <section id="features" className="mt-12 container mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <AnimatedList items={features} itemKey={(i: any) => i.id} renderItem={(f: any) => (
            <div className="bg-white/10 p-6 rounded-lg">
              <h4 className="font-semibold">{f.title}</h4>
              <p className="mt-2 text-indigo-100 text-sm">{f.desc}</p>
            </div>
          )} />
        </div>
      </section>
    </div>
  )
}
