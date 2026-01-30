
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localUser, setLocalUser] = useState('');
  const [localPass, setLocalPass] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await login();
      console.log('Logged in as:', user.email);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogin = (e) => {
    e.preventDefault();
    if (localUser === 'admin' && localPass === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid local credentials');
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-card">
          {/* Header */}
          <motion.div className="login-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="login-icon">🚑</div>
            <h1>Emergency Response</h1>
            <p>Staff Portal - Ambulance, Hospital & Admin</p>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div className="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleLocalLogin}>
            <input
              type="text"
              placeholder="Local Admin User"
              value={localUser}
              onChange={e => setLocalUser(e.target.value)}
              className="input"
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              value={localPass}
              onChange={e => setLocalPass(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
            <motion.button
              type="submit"
              disabled={loading}
              className="google-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >Local Login</motion.button>
          </form>
          <div className="divider my-4">or</div>
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >Google Login</motion.button>
        </div>
      </motion.div>
    </div>
  );
}
