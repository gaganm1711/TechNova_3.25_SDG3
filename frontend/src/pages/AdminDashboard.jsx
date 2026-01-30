import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/UI'

export default function AdminDashboard() {
  const [emergencies, setEmergencies] = useState([])
  const [ambulances, setAmbulances] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('emergencies')

  const loadData = useCallback(async () => {
    try {
      const [emsRes, ambRes, hosRes] = await Promise.all([
        fetch('http://localhost:8000/api/emergency/all'),
        fetch('http://localhost:8000/api/ambulances'),
        fetch('http://localhost:8000/api/hospitals'),
      ])
      
      const ems = await emsRes.json()
      const amb = await ambRes.json()
      const hos = await hosRes.json()
      
      setEmergencies(Array.isArray(ems) ? ems : [])
      setAmbulances(Array.isArray(amb) ? amb : [])
      setHospitals(Array.isArray(hos) ? hos : [])
    } catch (err) {
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card border-t-4" style={{ borderTopColor: 'var(--danger)' }}>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Emergencies</div>
          <div className="mt-2 text-3xl font-bold" style={{ color: 'var(--danger)' }}>{emergencies.length}</div>
          <div className="mt-2 text-xs text-gray-500">Currently active cases</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card border-t-4" style={{ borderTopColor: 'var(--primary)' }}>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available Ambulances</div>
          <div className="mt-2 text-3xl font-bold" style={{ color: 'var(--primary)' }}>{ambulances.length}</div>
          <div className="mt-2 text-xs text-gray-500">Ready to dispatch</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card border-t-4" style={{ borderTopColor: 'var(--success)' }}>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Hospitals</div>
          <div className="mt-2 text-3xl font-bold" style={{ color: 'var(--success)' }}>{hospitals.length}</div>
          <div className="mt-2 text-xs text-gray-500">Available facilities</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex gap-4 px-4 sm:px-6 min-w-max">
          {['emergencies', 'ambulances', 'hospitals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-2 font-medium text-sm border-b-2 transition capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'emergencies' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {emergencies.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No active emergencies</p>
              </div>
            ) : (
              emergencies.map((em, idx) => (
                <motion.div key={em.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="card border-l-4" style={{ borderLeftColor: 'var(--danger)' }}>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{em.patient_name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600 mt-1">Age: {em.age || '—'} | {em.symptoms || em.emergency_type || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">Location: {em.lat?.toFixed(4)}, {em.lon?.toFixed(4)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">ACTIVE</span>
                      <p className="text-xs text-gray-500 mt-2">{new Date(em.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'ambulances' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {ambulances.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No ambulances available</p>
              </div>
            ) : (
              ambulances.map((amb, idx) => (
                <motion.div key={amb.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="card border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{amb.license_plate || `Ambulance ${amb.id}`}</h3>
                      <p className="text-sm text-gray-600 mt-1">Crew: {amb.crew_count || 2} | Station: {amb.station_id || '—'}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">AVAILABLE</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'hospitals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {hospitals.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No hospitals found</p>
              </div>
            ) : (
              hospitals.map((hos, idx) => (
                <motion.div key={hos.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="card border-l-4" style={{ borderLeftColor: 'var(--success)' }}>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{hos.name || 'Hospital'}</h3>
                      <p className="text-sm text-gray-600 mt-1">Location: {hos.city || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">Beds Available: {hos.available_beds || 0}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">OPERATIONAL</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
