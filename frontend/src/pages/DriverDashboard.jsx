import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/UI'

export default function DriverDashboard() {
  const [activeEmergency, setActiveEmergency] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmergency = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/emergency/all')
        const emergencies = await res.json() || []
        if (emergencies.length > 0) {
          setActiveEmergency(emergencies[0])
        }
      } catch (err) {
        console.error('Error loading emergency:', err)
      } finally {
        setLoading(false)
      }
    }

    loadEmergency()
    const interval = setInterval(loadEmergency, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="space-y-6">
        {/* ...existing content... */}
      </div>
    </>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🚑 Ambulance Driver</h1>
        <p className="text-gray-600 mt-1">Your current dispatch and route information</p>
      </div>

      {!activeEmergency ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
          <p className="text-lg text-gray-600">No active emergencies</p>
          <p className="text-sm text-gray-500 mt-2">Waiting for dispatch...</p>
          <div className="mt-6">
            <div className="inline-block animate-pulse">
              <div className="w-12 h-12 rounded-full bg-blue-200 mx-auto"></div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Emergency Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-l-4" style={{ borderLeftColor: 'var(--danger)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Emergency Details</h2>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">ACTIVE</span>
            return (
              <>
                <Navbar />
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🚑 Ambulance Driver</h1>
                    <p className="text-gray-600 mt-1">Your current dispatch and route information</p>
                  </div>
                  {!activeEmergency ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
                      <p className="text-lg text-gray-600">No active emergencies</p>
                      <p className="text-sm text-gray-500 mt-2">Waiting for dispatch...</p>
                      <div className="mt-6">
                        <div className="inline-block animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-blue-200 mx-auto"></div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Active Emergency Card */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-l-4" style={{ borderLeftColor: 'var(--danger)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-900">Emergency Details</h2>
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">ACTIVE</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Patient Name</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{activeEmergency.patient_name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Age</p>
                              <p className="text-lg font-bold text-gray-900 mt-1">{activeEmergency.age || '—'} years</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Emergency Type</p>
                              <p className="text-lg font-bold text-gray-900 mt-1">{activeEmergency.emergency_type || activeEmergency.symptoms}</p>
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase font-semibold">📍 Location</p>
                            <p className="text-sm font-mono text-gray-900 mt-1">{activeEmergency.lat?.toFixed(6)}, {activeEmergency.lon?.toFixed(6)}</p>
                          </div>
                          <button className="w-full btn btn-primary">Start Navigation</button>
                        </div>
                      </motion.div>
                      {/* Vehicle Status Card */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Status</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">92%</p>
                            <p className="text-xs text-gray-600 mt-1">⛽ Fuel</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">✓</p>
                            <p className="text-xs text-gray-600 mt-1">Equipment Ready</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">2/2</p>
                            <p className="text-xs text-gray-600 mt-1">👥 Crew</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">📶</p>
                            <p className="text-xs text-gray-600 mt-1">Signal Good</p>
                          </div>
                        </div>
                        <button className="w-full btn btn-secondary mt-4">Confirm Ready</button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </>
            )
