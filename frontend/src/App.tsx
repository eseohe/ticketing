import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Header from './Header'
import Footer from './Footer'
import Landing from './Landing'
import Login from './Login'
import Register from './Register'
import Join from './Join'
import Dashboard from './Dashboard'
import Tickets from './Tickets'
import TicketDetail from './TicketDetail'
import Escalations from './Escalations'
import Departments from './Departments'
import DepartmentDashboard from './DepartmentDashboard'
import Teams from './Teams'
import TeamDetail from './TeamDetail'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<div className="bg-white"><Landing /></div>} />
              <Route path="/login" element={<div className="bg-white"><Login /></div>} />
              <Route path="/register" element={<Register />} />
              <Route path="/join" element={<Join />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><AppLayout><Tickets /></AppLayout></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<ProtectedRoute><AppLayout><TicketDetail /></AppLayout></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute><AppLayout><Departments /></AppLayout></ProtectedRoute>} />
              <Route path="/departments/:id" element={<ProtectedRoute><AppLayout><DepartmentDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/teams" element={<ProtectedRoute><AppLayout><Teams /></AppLayout></ProtectedRoute>} />
              <Route path="/teams/:id" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
              <Route path="/escalations" element={<ProtectedRoute><AppLayout><Escalations /></AppLayout></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
