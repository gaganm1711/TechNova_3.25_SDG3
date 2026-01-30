import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/UI'

export default function EmergencyTracker() {
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/emergency/all')
        setEmergencies(await res.json() || [])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 3000)
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
        <h1 className="text-3xl font-bold text-gray-900">Emergency Timeline</h1>
        <p className="text-gray-600 mt-1">Track all emergency cases and their status</p>
      </div>

      {emergencies.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
          <p className="text-gray-500 text-lg">No emergencies on record</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {emergencies.map((em, idx) => (
            <motion.div
              key={em.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedId(selectedId === em.id ? null : em.id)}
              className={`card cursor-pointer transition border-l-4 ${selectedId === em.id ? 'ring-2 ring-blue-400' : ''}`}
              style={{ borderLeftColor: 'var(--danger)' }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">Case #{em.id}</h3>
                  <p className="text-gray-600 font-medium mt-1">{em.patient_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="inline-block mr-4">👤 Age: {em.age || '—'}</span>
                    <span className="inline-block">🏥 {em.symptoms || em.emergency_type || '—'}</span>
                  </p>
                </div>

                <div className="text-right flex-shrink-0 w-full sm:w-auto">
                  <div className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium text-sm mb-2">
                    ACTIVE
                  </div>
                  <p className="text-xs text-gray-500">{new Date(em.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Expanded details */}
              {selectedId === em.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{em.lat?.toFixed(6)}, {em.lon?.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Assigned Hospital</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{em.assigned_hospital_id ? `Hospital #${em.assigned_hospital_id}` : 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Call Time</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{new Date(em.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                      <p className="text-sm font-medium text-red-600 mt-1">🔴 Active Dispatch</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
