
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import { Navbar } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import '../styles/emergency-form.css'

const EmergencyForm = () => {
  const { user } = useAuth();
  const location = useLocation()
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    emergencyType: '',
    latitude: null,
    longitude: null,
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [helpIsArriving, setHelpIsArriving] = useState(location.state?.helpIsArriving || false)
  const [arrivedAmbulance, setArrivedAmbulance] = useState(location.state?.ambulanceId || null)
  const [error, setError] = useState('')
  const [sosStatus, setSOSStatus] = useState('idle')
  const [showSOS, setShowSOS] = useState(false)

  const emergencyTypes = [
    { id: 'heart', label: 'Heart Attack', icon: '❤️' },
    { id: 'stroke', label: 'Stroke', icon: '🧠' },
    { id: 'accident', label: 'Accident', icon: '🚗' },
    { id: 'breathing', label: 'Breathing', icon: '💨' },
    { id: 'bleeding', label: 'Bleeding', icon: '🩸' },
    { id: 'unconscious', label: 'Unconscious', icon: '😴' },
    { id: 'fever', label: 'Fever', icon: '🌡️' },
    { id: 'other', label: 'Other', icon: '❓' }
  ]

  useEffect(() => {
    if (!helpIsArriving) return
    let countdown = 8
    const interval = setInterval(() => {
      countdown -= 1
      const el = document.getElementById('help-countdown')
      if (el) el.textContent = countdown
      if (countdown <= 0) {
        clearInterval(interval)
        setHelpIsArriving(false)
        setArrivedAmbulance(null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [helpIsArriving])

  useEffect(() => {
    if (!showSOS || sosStatus !== 'success') return
    let countdown = 6
    const interval = setInterval(() => {
      countdown -= 1
      const el = document.getElementById('sos-countdown')
      if (el) el.textContent = countdown
      if (countdown <= 0) {
        clearInterval(interval)
        setShowSOS(false)
        setSOSStatus('idle')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [showSOS, sosStatus])

  const getLocation = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({ ...prev, latitude, longitude }))
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          setFormData(prev => ({
            ...prev,
            address: data.address?.road || data.address?.neighbourhood || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }))
        } catch {
          setFormData(prev => ({ ...prev, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
        }
        setLoading(false)
      },
      () => {
        setError('Could not get your location. Please enable location services.')
        setLoading(false)
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.patientName || !formData.age || !formData.emergencyType) {
      setError('Please fill in all required fields')
      return
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Please provide your location')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:8000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: formData.patientName,
          age: parseInt(formData.age),
          emergency_type: formData.emergencyType,
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.address
        })
      })
      if (!response.ok) throw new Error('Failed to submit emergency')
      setSuccess(true)
      setFormData({ patientName: '', age: '', emergencyType: '', latitude: null, longitude: null, address: '' })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSOS = async () => {
    setSOSStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch('http://localhost:8000/api/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient_name: 'SOS Emergency',
              age: 0,
              emergency_type: 'AUTO_SOS',
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            })
          })
          if (response.ok) {
            setSOSStatus('success')
            setShowSOS(true)
          }
        } catch (err) {
          console.error(err)
          setSOSStatus('idle')
        }
      },
      () => setSOSStatus('idle')
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } }
  }

  return (
    <div className="emergency-wrapper">
      <Navbar user={user} />
      {/* SOS Button */}
      <motion.button
        className={`sos-btn ${sosStatus}`}
        onClick={handleSOS}
        whileHover={{ scale: sosStatus === 'loading' ? 1 : 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="sos-content">
          {sosStatus === 'loading' && <div className="spinner"></div>}
          {sosStatus === 'success' && <span className="sos-icon">✓</span>}
          {sosStatus === 'idle' && (
            <>
              <span className="sos-label">SOS</span>
              <span className="sos-subtext">Emergency</span>
            </>
          )}
        </div>
      </motion.button>

      {/* SOS Success Modal */}
      <AnimatePresence>
        {showSOS && sosStatus === 'success' && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content success-modal"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div className="success-icon" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                ✓
              </motion.div>
              <h2>Help is on the way!</h2>
              <p>Emergency services have been dispatched to your location.</p>
              <div className="countdown">Closing in <span id="sos-countdown">6</span>s</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Arriving Modal */}
      <AnimatePresence>
        {helpIsArriving && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content arrival-modal"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div className="arrival-icon" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                🚑
              </motion.div>
              <h2>Help is arriving!</h2>
              <p className="ambulance-plate">{arrivedAmbulance}</p>
              <p>Ambulance dispatched to your location</p>
              <p className="eta">Est. arrival: 8-12 minutes</p>
              <button className="btn btn-primary btn-block" onClick={() => { setHelpIsArriving(false); setArrivedAmbulance(null) }}>
                ✓ Got it
              </button>
              <div className="countdown">Closing in <span id="help-countdown">8</span>s</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div className="emergency-container" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div className="header" variants={itemVariants}>
          <div className="header-icon">🚑</div>
          <h1>Emergency Response</h1>
          <p>Request ambulance assistance immediately</p>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && <motion.div className="alert alert-danger" key="error" variants={itemVariants}>{error}</motion.div>}
          {success && <motion.div className="alert alert-success" key="success" variants={itemVariants}>✓ Ambulance dispatched!</motion.div>}
        </AnimatePresence>

        {/* Form Card */}
        <motion.form onSubmit={handleSubmit} className="form-card card" variants={itemVariants}>
          {/* Name & Age */}
          <motion.div className="form-row" variants={itemVariants}>
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                placeholder="Full name"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="Years"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="0"
                max="150"
                required
              />
            </div>
          </motion.div>

          {/* Emergency Type */}
          <motion.div className="form-group" variants={itemVariants}>
            <label>Emergency Type</label>
            <div className="emergency-grid">
              {emergencyTypes.map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  className={`emergency-btn ${formData.emergencyType === type.id ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, emergencyType: type.id })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="emoji">{type.icon}</span>
                  <span className="label">{type.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div className="form-group" variants={itemVariants}>
            <label>Location</label>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={getLocation}
              disabled={loading}
            >
              {loading ? <>⏳ Detecting...</> : <>📍 Use My Location</>}
            </button>
            {formData.address && (
              <motion.div className="location-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ✓ {formData.address}
              </motion.div>
            )}
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <>⏳ Requesting...</> : <>🚑 REQUEST AMBULANCE</>}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <motion.div className="divider" variants={itemVariants}>
          <span>Or</span>
        </motion.div>

        {/* Ambulance Selector */}
        <motion.div variants={itemVariants}>
          <Link to="/ambulance-locator" className="btn btn-secondary btn-lg btn-block">
            🗺️ Choose Ambulance
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p className="footer-text" variants={itemVariants}>
          Your information is secure and encrypted
        </motion.p>
      </motion.div>
    </div>
  )
}

export default EmergencyForm
