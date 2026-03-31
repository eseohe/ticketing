import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Landing from './Landing'
import Register from './Register'
import Dashboard from './Dashboard'
import Tickets from './Tickets'
import TicketDetail from './TicketDetail'
import Escalations from './Escalations'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/escalations" element={<Escalations />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
