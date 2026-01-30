import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider } from '../config/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

// Auth context
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch user role from backend
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE}/user-role/${firebaseUser.uid}`)
          const data = await res.json()
          setUserRole(data.role || 'user')
        } catch (err) {
          console.error('Error fetching user role:', err)
          setUserRole('user')
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
      return result.user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
