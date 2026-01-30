import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/UI'

export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hosRes, emsRes] = await Promise.all([
          fetch('http://localhost:8000/api/hospitals'),
          fetch('http://localhost:8000/api/emergency/all'),
        ])
        setHospitals(await hosRes.json() || [])
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    )
  }

  const currentHospital = hospitals[0] || { name: 'St. Mary Hospital', available_beds: 8, total_beds: 25 }

  return (
    <>
      <Navbar />
      <div className="space-y-6">
        {/* ...existing content... */}
      </div>
    </>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🏥 Hospital Dashboard</h1>
        <p className="text-gray-600 mt-1">{currentHospital.name} - Emergency Department</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card border-t-4" style={{ borderTopColor: currentHospital.available_beds > 5 ? 'var(--success)' : 'var(--danger)' }}>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Beds Available</div>
          <div className="mt-2 text-3xl font-bold" style={{ color: currentHospital.available_beds > 5 ? 'var(--success)' : 'var(--danger)' }}>{currentHospital.available_beds}</div>
          <div className="mt-2 text-xs text-gray-500">of {currentHospital.total_beds || 25} total</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card border-t-4" style={{ borderTopColor: 'var(--primary)' }}>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Queue</div>
          <div className="mt-2 text-3xl font-bold" style={{ color: 'var(--primary)' }}>{emergencies.length}</div>
          <div className="mt-2 text-xs text-gray-500">Waiting for admission</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card border-t-4" style={{ borderTopColor: 'var(--danger)' }}>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical Cases</div>
          <div className="mt-2 text-3xl font-bold" style={{ color: 'var(--danger)' }}>{emergencies.length}</div>
          <div className="mt-2 text-xs text-gray-500">Requiring immediate care</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bed Status */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bed Availability</h2>
          
          <div className="space-y-4">
            {[
              { type: 'General Ward', available: 5, total: 15, color: 'var(--success)' },
              { type: 'ICU', available: 2, total: 8, color: 'var(--danger)' },
              { type: 'Emergency', available: 1, total: 2, color: 'var(--danger)' }
            ].map((bed, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-sm">{bed.type}</p>
                  <span className="text-xs font-medium" style={{ color: bed.color }}>{bed.available}/{bed.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(bed.available / bed.total) * 100}%`,
                      backgroundColor: bed.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Incoming Patients */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Incoming Patients</h2>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {emergencies.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No incoming patients</p>
            ) : (
              emergencies.map((em, idx) => (
                <div key={em.id} className="p-3 border-l-4 bg-gray-50 rounded" style={{ borderLeftColor: 'var(--danger)' }}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{em.patient_name}</p>
                      <p className="text-xs text-gray-600 mt-1">{em.symptoms || em.emergency_type}</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0">CRITICAL</span>
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
