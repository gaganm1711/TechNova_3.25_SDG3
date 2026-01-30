import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/UI'

export default function AmbulanceMap() {
  const [ambulances, setAmbulances] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ambRes, emsRes] = await Promise.all([
          fetch('http://localhost:8000/api/ambulances'),
          fetch('http://localhost:8000/api/emergency/all'),
        ])
        setAmbulances(await ambRes.json() || [])
        setEmergencies(await emsRes.json() || [])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
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
        <h1 className="text-3xl font-bold text-gray-900">Real-Time Tracking</h1>
        <p className="text-gray-600 mt-1">Monitor ambulance locations and active emergencies</p>
      </div>

      {/* Map placeholder */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card h-96 bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">🗺️ Map Integration Coming Soon</p>
          <p className="text-gray-400 text-sm mt-2">Real-time GPS tracking will appear here</p>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ambulances */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🚑 Active Ambulances ({ambulances.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {ambulances.length === 0 ? (
              <p className="text-gray-500 text-sm">No ambulances in service</p>
            ) : (
              ambulances.map(amb => (
                <div key={amb.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{amb.license_plate}</p>
                    <p className="text-xs text-gray-500">Ready</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Emergencies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🆘 Active Emergencies ({emergencies.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {emergencies.length === 0 ? (
              <p className="text-gray-500 text-sm">No active emergencies</p>
            ) : (
              emergencies.map(em => (
                <div key={em.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{em.patient_name}</p>
                    <p className="text-xs text-gray-500">{em.symptoms}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
