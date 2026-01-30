import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import EmergencyForm from './pages/EmergencyForm'
import AmbulanceLocator from './pages/AmbulanceLocator'
import AmbulanceMap from './pages/AmbulanceMap'
import AdminDashboard from './pages/AdminDashboard'
import DriverDashboard from './pages/DriverDashboard'
import HospitalDashboard from './pages/HospitalDashboard'
import EmergencyTracker from './pages/EmergencyTracker'

// Header component
function Header() {
  const { user, logout, userRole } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2 hover:text-blue-600 transition">
            🚑 Emergency Ambulance Routing
          </Link>
          
          {user && (
            <nav className="flex gap-6">
              {userRole === 'ambulance' && (
                <>
                  <Link to="/ambulance" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                    Ambulance
                  </Link>
                  <Link to="/tracking" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                    Tracking
                  </Link>
                </>
              )}
              {userRole === 'hospital' && (
                <Link to="/hospital" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                  Hospital
                </Link>
              )}
              {userRole === 'admin' && (
                <>
                  <Link to="/admin" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                    Admin
                  </Link>
                  <Link to="/tracking" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                    Tracking
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-semibold text-gray-900">{user.displayName || user.email}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{userRole}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// Layout wrapper
function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

// Main app routes
function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><EmergencyForm /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/ambulance-locator" element={<Layout><AmbulanceLocator /></Layout>} />

      {/* Protected routes */}
      <Route
        path="/ambulance"
        element={
          user ? (
            <Layout>
              <ProtectedRoute Component={DriverDashboard} requiredRole="ambulance" />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/hospital"
        element={
          user ? (
            <Layout>
              <ProtectedRoute Component={HospitalDashboard} requiredRole="hospital" />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          user ? (
            <Layout>
              <ProtectedRoute Component={AdminDashboard} requiredRole="admin" />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/tracking"
        element={
          user ? (
            <Layout>
              <AmbulanceMap />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/emergency-tracker"
        element={
          user ? (
            <Layout>
              <EmergencyTracker />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
