import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  Zap,
  Sparkles,
  ShieldCheck,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

// ── Product UI Mockup ────────────────────────────────────────────────────────
function ProductMockup() {
  const tickets = [
    { id: '#1042', subject: 'Login issue on mobile app', status: 'open', priority: 'high', time: '2m ago' },
    { id: '#1041', subject: 'Billing question — Q4 invoice', status: 'pending', priority: 'medium', time: '15m ago' },
    { id: '#1040', subject: 'Feature request: dark mode', status: 'open', priority: 'low', time: '1h ago' },
    { id: '#1039', subject: 'CSV export not working', status: 'resolved', priority: 'medium', time: '3h ago' },
  ]
  const statusStyle: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    pending: 'bg-amber-50 text-amber-700',
    resolved: 'bg-brand-50 text-brand-700',
  }
  const priorityDot: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-brand-400',
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      {/* Browser chrome */}
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-brand-400" />
        <span className="text-gray-400 text-xs ml-3 font-mono select-none">
          app.ticketing.io/tickets
        </span>
      </div>

      <div className="flex" style={{ height: 340 }}>
        {/* Sidebar */}
        <div className="w-12 bg-gray-900 flex flex-col items-center py-4 gap-3 flex-shrink-0">
          {[
            { label: 'T', active: true },
            { label: 'D', active: false },
            { label: 'R', active: false },
            { label: 'S', active: false },
          ].map(({ label, active }) => (
            <div
              key={label}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                active ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">All Tickets</span>
              <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                23 open
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-6 bg-gray-100 rounded-md" />
              <div className="w-14 h-6 bg-brand-600 rounded-md" />
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-1 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-white">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Subject</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3">Time</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-hidden divide-y divide-gray-50">
            {tickets.map((t, i) => (
              <div
                key={t.id}
                className={`grid grid-cols-12 gap-1 px-4 py-2.5 text-xs items-center transition-colors hover:bg-white ${
                  i === 0 ? 'bg-brand-50/60' : 'bg-white'
                }`}
              >
                <div className="col-span-1 text-gray-400 font-mono">{t.id}</div>
                <div className="col-span-5 flex items-center gap-1.5 font-medium text-gray-800 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[t.priority]}`} />
                  <span className="truncate">{t.subject}</span>
                </div>
                <div className="col-span-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[t.status]}`}>
                    {t.status}
                  </span>
                </div>
                <div className="col-span-3 text-gray-400">{t.time}</div>
              </div>
            ))}
          </div>

          {/* Stats footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border-t border-gray-100 text-xs text-gray-500">
            <span>
              SLA:{' '}
              <strong className="text-brand-600">98.2%</strong>
            </span>
            <span>
              Avg response:{' '}
              <strong className="text-gray-700">1.4h</strong>
            </span>
            <span>
              Resolved today:{' '}
              <strong className="text-gray-700">14</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Features Data ────────────────────────────────────────────────────────────
const features = [
  {
    icon: Building2,
    title: 'Multi-tenant architecture',
    desc: 'Every company gets a fully isolated workspace. PostgreSQL row-level security ensures data never mixes.',
  },
  {
    icon: Zap,
    title: 'Agent-focused speed',
    desc: 'Designed for triage and fast resolution. Keyboard-driven workflows mean agents handle more in less time.',
  },
  {
    icon: Sparkles,
    title: 'AI-assisted replies',
    desc: 'Suggested responses and knowledge-base search powered by AI. Close tickets in seconds, not minutes.',
  },
  {
    icon: ShieldCheck,
    title: 'SLA management',
    desc: 'Set and track service level agreements per tenant. Automatic escalations keep everything on track.',
  },
  {
    icon: Users,
    title: 'Role-based access',
    desc: 'Admins, agents, and customers — each with the right permissions. Fine-grained control per workspace.',
  },
  {
    icon: BarChart3,
    title: 'Real-time reporting',
    desc: 'Track resolution times, agent performance, and CSAT scores with live dashboards.',
  },
]

// ── Steps Data ───────────────────────────────────────────────────────────────
const steps = [
  {
    n: '01',
    title: 'Create your workspace',
    desc: 'Register your company in seconds. Get a dedicated subdomain and fully isolated database instantly.',
  },
  {
    n: '02',
    title: 'Invite your team',
    desc: 'Add agents and set their roles. Agents see only their tickets — customers see only their own requests.',
  },
  {
    n: '03',
    title: 'Resolve faster, together',
    desc: 'Triage incoming requests, assign to agents, and close tickets with AI-assisted replies and SLA tracking.',
  },
]

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-14 pb-24 px-6">
        {/* Background blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-800 text-sm font-semibold px-3.5 py-1.5 rounded-full mb-7">
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                Trusted by 10,000+ support teams
              </div>

              <h1 className="text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                Support, simply
                <br />
                <span className="text-brand-600">done right.</span>
              </h1>

              <p className="mt-6 text-lg text-gray-500 max-w-md leading-relaxed">
                Multi-tenant ticketing built for scale. Isolated workspaces, fast workflows, SLA
                tracking, and AI-assisted replies — from day one.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-full text-base transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:-translate-y-px"
                >
                  Start free trial
                </button>
                <a
                  href="#features"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  See all features
                  <ChevronDown size={16} />
                </a>
              </div>

              {/* Social proof row */}
              <div className="mt-10 flex items-center gap-5">
                <div className="flex -space-x-2">
                  {[
                    'bg-violet-500',
                    'bg-blue-500',
                    'bg-rose-500',
                    'bg-amber-500',
                    'bg-teal-500',
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white ${bg} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-bold text-gray-900">4.9 / 5</span>
                  &nbsp;from 2,000+ reviews
                </div>
              </div>
            </motion.div>

            {/* Right: mockup */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:block"
            >
              <ProductMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-7">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {['Acme Corp', 'NovaTech', 'CloudBase', 'Helix IO', 'Veridian', 'Stackr'].map(name => (
              <span
                key={name}
                className="text-gray-300 font-extrabold text-xl tracking-tight select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything your support team needs
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              One platform. Every feature. No unnecessary complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group p-7 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50/60 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No complex setup. No dedicated IT team required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-brand-200 to-transparent z-0" />
                )}
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {n}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {[
              { stat: '10,000+', label: 'Support teams', sub: 'across industries worldwide' },
              { stat: '99.9%', label: 'Uptime SLA', sub: 'zero-downtime deployments' },
              { stat: '<2s', label: 'Avg API latency', sub: 'fast for every customer' },
            ].map(({ stat, label, sub }, i) => (
              <motion.div
                key={stat}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="py-6 md:py-0 md:px-8"
              >
                <div className="text-5xl font-extrabold text-white mb-2">{stat}</div>
                <div className="text-brand-400 font-bold text-lg mb-1">{label}</div>
                <div className="text-gray-500 text-sm">{sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-2xl font-semibold text-gray-900 leading-snug mb-8">
              "Savvy cut our first-response time by 60%. The multi-tenant setup meant we could
              onboard clients in minutes instead of weeks."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold">
                S
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">Sarah Chen</div>
                <div className="text-gray-500 text-sm">Head of Support, NovaTech</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Ready to transform your customer support?
            </h2>
            <p className="mt-5 text-lg text-brand-100 max-w-xl mx-auto">
              Start your free trial today. No credit card required. Up and running in under 5
              minutes.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-white hover:bg-gray-50 text-brand-700 font-bold px-10 py-4 rounded-full text-base transition-all shadow-xl hover:-translate-y-px"
              >
                Start free trial
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="border-2 border-brand-400 text-white hover:bg-brand-500 font-semibold px-10 py-4 rounded-full text-base transition-all flex items-center gap-2"
              >
                View demo <ArrowRight size={18} />
              </button>
            </div>
            <p className="mt-5 text-brand-200 text-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 size={15} />
              Free for 30 days &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; No credit card
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
