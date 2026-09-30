import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail || 'Invalid username or password. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <ShieldAlert size={34} color="#2563eb" />
            <span>SmartGuide</span>
          </div>
          <p className="auth-subtitle">Caregiver IoT Portal Sign In</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '600' }}>
            Register here
          </Link>
        </p>

        <div style={{ marginTop: '2rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
          <strong>Test Credentials:</strong><br />
          Caregiver Username: <code>caregiver1</code> | Password: <code>password123</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
