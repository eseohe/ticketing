import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6 text-sm text-slate-600">
        © {new Date().getFullYear()} Ticketing — Built with React + FastAPI
      </div>
    </footer>
  )
}
