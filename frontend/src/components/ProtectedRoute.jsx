import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from '../components/UI'

/**
 * ProtectedRoute - Enforces role-based access control
 * @param {React.Component} Component - Component to render if authorized
 * @param {string} requiredRole - Role required to access (ambulance, hospital, admin)
 * @param {string} path - Route path for redirect
 */
export function ProtectedRoute({ Component, requiredRole, path }) {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Your role ({userRole}) doesn't have access to this area.</p>
          <p className="text-sm text-gray-500">Contact your administrator if you think this is a mistake.</p>
        </div>
      </div>
    )
  }

  return <Component />
}
