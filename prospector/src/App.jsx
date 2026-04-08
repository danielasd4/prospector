import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import AddLead from './pages/AddLead'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#e4e4e7',
            border: '1px solid #3f3f46',
            borderRadius: '10px',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#0d0d10' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0d0d10' },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/leads"    element={<Leads />} />
          <Route path="/add"      element={<AddLead />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
