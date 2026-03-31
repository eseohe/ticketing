import React from 'react'
import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'

const links: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Tickets', href: '/tickets' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Ticket size={16} strokeWidth={2.5} className="text-white" />
              </span>
              Ticketing
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Multi-tenant support, built for scale. From startups to enterprise.
            </p>
          </div>

          {/* Link columns */}
          {links.map(({ heading, items }) => (
            <div key={heading}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Ticketing. All rights reserved.</span>
          <span>Built with React + FastAPI</span>
        </div>
      </div>
    </footer>
  )
}
