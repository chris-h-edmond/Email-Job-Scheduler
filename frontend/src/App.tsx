import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/useAuth'
import LoginPage from './features/auth/LoginPage'
import AppShell from './components/layout/AppShell'
import EmailListPage from './features/emails/EmailListPage'
import EmailDetailPage from './features/emails/EmailDetailPage'
import ComposePage from './features/compose/ComposePage'
import ProtectedRoute from './features/auth/ProtectedRoute'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/scheduled" replace />} />
        <Route path="/scheduled" element={<EmailListPage tab="scheduled" />} />
        <Route path="/sent" element={<EmailListPage tab="sent" />} />
        <Route path="/emails/:id" element={<EmailDetailPage />} />
        <Route path="/compose" element={<ComposePage />} />
      </Route>
    </Routes>
  )
}

export default App
