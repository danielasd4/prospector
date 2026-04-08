import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import AddLead from './pages/AddLead'
import Settings from './pages/Settings'
import Login from './pages/Login'

const toastConfig = {
  style: {
    background: '#18181b',
    color: '#e4e4e7',
    border: '1px solid #3f3f46',
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
  },
  success: { iconTheme: { primary: '#3b82f6', secondary: '#0d0d10' } },
  error:   { iconTheme: { primary: '#ef4444', secondary: '#0d0d10' } },
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/leads"    element={<Leads />} />
        <Route path="/add"      element={<AddLead />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={toastConfig} />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
