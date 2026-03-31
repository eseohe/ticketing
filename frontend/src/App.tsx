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

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="max-w-5xl mx-auto px-6 py-10">{children}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/tickets" element={<PageWrapper><Tickets /></PageWrapper>} />
            <Route path="/tickets/:id" element={<PageWrapper><TicketDetail /></PageWrapper>} />
            <Route path="/escalations" element={<PageWrapper><Escalations /></PageWrapper>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
