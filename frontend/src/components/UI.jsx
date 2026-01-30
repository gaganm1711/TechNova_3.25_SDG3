
import React from 'react'

export function Navbar({ user }) {
  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow">
      <div className="font-bold text-lg">🚑 Smart Ambulance Routing</div>
      <div className="space-x-4">
        <a href="/" className="hover:underline">Home</a>
        <a href="/admin" className="hover:underline">Admin</a>
        <a href="/driver" className="hover:underline">Driver</a>
        <a href="/hospital" className="hover:underline">Hospital</a>
        <a href="/ambulance-locator" className="hover:underline">Locator</a>
        <a href="/emergency-form" className="hover:underline">Emergency Form</a>
        <a href="/emergency-tracker" className="hover:underline">Tracker</a>
        {user ? (
          <span className="ml-4">Logged in as <b>{user.email || user}</b></span>
        ) : (
          <a href="/" className="ml-4 hover:underline">Login</a>
        )}
      </div>
    </nav>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }
  return (
    <span className={`inline-block rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

export function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, className = '' }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  }
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-semibold transition-all ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${className}`}
    >
      {children}
    </button>
  )
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        {children}
      </Card>
    </div>
  )
}

export function Toast({ message, type = 'success', duration = 3000 }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {}, duration)
    return () => clearTimeout(timer)
  }, [duration])

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  return (
    <div className={`${typeStyles[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`}>
      {type === 'success' && '✓'}
      {type === 'error' && '✕'}
      {type === 'warning' && '⚠'}
      {type === 'info' && 'ℹ'}
      {message}
    </div>
  )
}

export function Avatar({ name, size = 'md' }) {
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500']
  const hash = name.charCodeAt(0) % colors.length
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const initials = name.split(' ').map(n => n[0]).join('')
  return (
    <div className={`${colors[hash]} ${sizes[size]} rounded-full flex items-center justify-center text-white font-bold`}>
      {initials}
    </div>
  )
}

export function StatCard({ icon, label, value, trend, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-50 to-blue-100 border-blue-300',
    green: 'from-green-50 to-green-100 border-green-300',
    red: 'from-red-50 to-red-100 border-red-300',
    purple: 'from-purple-50 to-purple-100 border-purple-300',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 border shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
          </p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
  )
}

export function Alert({ type = 'info', title, message, onClose }) {
  const colors = {
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    success: 'bg-green-50 border-green-300 text-green-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    error: 'bg-red-50 border-red-300 text-red-800',
  }
  const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' }
  return (
    <div className={`border-l-4 rounded-lg p-4 ${colors[type]} flex justify-between items-start`}>
      <div className="flex gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div>
          {title && <p className="font-bold">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onClose && <button onClick={onClose} className="text-xl font-bold">×</button>}
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = 'blue' }) {
  const colors = { blue: 'bg-blue-600', green: 'bg-green-600', red: 'bg-red-600', yellow: 'bg-yellow-600' }
  const percentage = (value / max) * 100
  return (
    <div className="w-full bg-gray-300 rounded-full h-2">
      <div className={`${colors[color]} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
    </div>
  )
}
