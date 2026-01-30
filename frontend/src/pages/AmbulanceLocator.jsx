
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import '../styles/ambulance-locator.css'

export default function AmbulanceLocator() {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [ambulances, setAmbulances] = useState([
    {
      id: 1,
      plate: 'AMB-001',
      location: '4.8 km away',
      latitude: 37.7749,
      longitude: -122.4194,
      status: 'Available',
      crew: '2 Paramedics',
      equipment: '✓ AED, Oxygen, Stretcher',
      eta: '8 minutes',
    },
    {
      id: 2,
      plate: 'AMB-002',
      location: '6.2 km away',
      latitude: 37.7850,
      longitude: -122.4080,
      status: 'Available',
      crew: '2 Paramedics',
      equipment: '✓ AED, Oxygen, Stretcher',
      eta: '11 minutes',
    },
    {
      id: 3,
      plate: 'AMB-003',
      location: '7.1 km away',
      latitude: 37.7649,
      longitude: -122.4310,
      status: 'Available',
      crew: '2 Paramedics',
      equipment: '✓ AED, Oxygen, Stretcher',
      eta: '13 minutes',
    },
    {
      id: 4,
      plate: 'AMB-004',
      location: '9.5 km away',
      latitude: 37.7500,
      longitude: -122.4500,
      status: 'Busy',
      crew: '2 Paramedics',
      equipment: '✓ AED, Oxygen, Stretcher',
      eta: '18 minutes',
    },
  ])

  const [selectedAmbulance, setSelectedAmbulance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mapCenter] = useState({ lat: 37.7749, lng: -122.4194 })

  // Get user's actual location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        // In real app, fetch ambulances near this location
        console.log('User location:', latitude, longitude)
      })
    }
  }, [])

  const handleSelectAmbulance = async (ambulance) => {
    if (ambulance.status !== 'Available') {
      alert('This ambulance is currently busy. Please select another one.')
      return
    }

    setLoading(true)
    setSelectedAmbulance(ambulance)

    try {
      // Get user's location
      const userLocation = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          (error) => {
            // Use default location if geolocation fails
            resolve({
              latitude: 37.7749,
              longitude: -122.4194,
            })
          }
        )
      })

      // Send emergency request to backend
      const response = await fetch('http://localhost:8000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: `Emergency at ${ambulance.location}`,
          age: 25,
          emergency_type: 'AMBULANCE_REQUEST',
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          assigned_ambulance: ambulance.plate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Emergency created:', data)

        // Show success and redirect to emergency form with status
        setTimeout(() => {
          navigate('/', { state: { helpIsArriving: true, ambulanceId: ambulance.plate } })
        }, 1500)
      }
    } catch (error) {
      console.error('Error requesting ambulance:', error)
      alert('Failed to request ambulance. Please try again.')
      setLoading(false)
      setSelectedAmbulance(null)
    }
  }

  return (
    <div className="ambulance-locator-page">
      <Navbar user={user} />
      <div className="locator-container">
        {/* Header */}
        <motion.div className="locator-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1>🚑 Nearest Ambulances</h1>
          <p>Select an ambulance to request immediate assistance</p>
        </motion.div>

        <div className="locator-content">
          {/* Map Section */}
          <motion.div className="map-section" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="map-placeholder">
              <div className="map-header">
                <h3>📍 Your Location & Nearby Ambulances</h3>
                <div className="map-legend">
                  <div className="legend-item">
                    <span className="legend-dot available"></span> Available
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot busy"></span> Busy
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot selected"></span> Selected
                  </div>
                </div>
              </div>

              <div className="map-area">
                <svg viewBox="0 0 400 400" className="map-svg">
                  {/* Simple map representation */}
                  <rect x="10" y="10" width="380" height="380" fill="#f0f4f8" stroke="#ddd" strokeWidth="2" />

                  {/* Your location (center) */}
                  <circle cx="200" cy="200" r="8" fill="#0b5cff" />
                  <circle cx="200" cy="200" r="15" fill="none" stroke="#0b5cff" strokeWidth="2" opacity="0.3" />
                  <text x="200" y="225" textAnchor="middle" fontSize="11" fill="#333">
                    YOU
                  </text>

                  {/* Ambulances */}
                  {ambulances.map((amb, idx) => {
                    const isSelected = selectedAmbulance?.id === amb.id
                    const angle = (idx * 90) * (Math.PI / 180)
                    const radius = 80
                    const x = 200 + radius * Math.cos(angle)
                    const y = 200 + radius * Math.sin(angle)

                    return (
                      <g key={amb.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r="10"
                          fill={amb.status === 'Available' ? (isSelected ? '#16a34a' : '#0b5cff') : '#64748b'}
                          style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                        />
                        <text x={x} y={y + 18} textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold">
                          {amb.plate}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                <p className="map-info">🗺️ MapLibre integration ready - Real map coming soon</p>
              </div>
            </div>
          </motion.div>

          {/* Ambulances List */}
          <motion.div className="ambulances-list-section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h2>Available Ambulances</h2>

            <div className="ambulances-list">
              {ambulances.map((ambulance, idx) => (
                <motion.div
                  key={ambulance.id}
                  className={`ambulance-card ${ambulance.status === 'Busy' ? 'busy' : ''} ${selectedAmbulance?.id === ambulance.id ? 'selected' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => handleSelectAmbulance(ambulance)}
                >
                  {/* Top Section - License Plate & Status */}
                  <div className="ambulance-header">
                    <div className="plate-section">
                      <div className="license-plate">🚑 {ambulance.plate}</div>
                      <span className={`status-badge ${ambulance.status.toLowerCase()}`}>{ambulance.status}</span>
                    </div>
                    <div className="distance">{ambulance.location}</div>
                  </div>

                  {/* Middle Section - Details */}
                  <div className="ambulance-details">
                    <div className="detail-row">
                      <span className="label">👥 Crew:</span>
                      <span className="value">{ambulance.crew}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">⚙️ Equipment:</span>
                      <span className="value">{ambulance.equipment}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">⏱️ ETA:</span>
                      <span className="value">{ambulance.eta}</span>
                    </div>
                  </div>

                  {/* Bottom Section - Request Button */}
                  <div className="ambulance-action">
                    {selectedAmbulance?.id === ambulance.id && loading ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <span>Requesting...</span>
                      </div>
                    ) : (
                      <button className={`request-btn ${ambulance.status !== 'Available' ? 'disabled' : ''}`} disabled={ambulance.status !== 'Available'}>
                        {ambulance.status === 'Available' ? '✓ Request This Ambulance' : '❌ Currently Busy'}
                      </button>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {selectedAmbulance?.id === ambulance.id && !loading && (
                    <motion.div className="selected-indicator" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <span>✓ SELECTED</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.button className="back-btn" onClick={() => navigate('/')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          ← Back to Emergency Form
        </motion.button>
      </div>
    </div>
  )
}
