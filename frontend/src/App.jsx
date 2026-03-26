import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'

const RoleRedirect = () => {
  const { isAdmin } = useAuth()
  return <Navigate to={isAdmin ? '/dashboard' : '/entries'} replace />
}

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/entries" replace />
}
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Entries from './pages/Entries'
import Exits from './pages/Exits'
import Users from './pages/Users'
import Inventory from './pages/Inventory'
import Sites from './pages/Sites'
import AuditLog from './pages/AuditLog'

function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleRedirect />} />
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="products" element={<AdminRoute><Products /></AdminRoute>} />
            <Route path="sites" element={<AdminRoute><Sites /></AdminRoute>} />
            <Route path="entries" element={<Entries />} />
            <Route path="exits" element={<Exits />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="audit" element={<AdminRoute><AuditLog /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  )
}

export default App
