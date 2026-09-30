import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'CAREGIVER',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      // Auto login after successful registration
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          setError(`${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`);
        } else {
          setError('Registration failed. Please check your details.');
        }
      } else {
        setError('Server unreachable. Please check network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-brand">
            <ShieldAlert size={34} color="#2563eb" />
            <span>SmartGuide</span>
          </div>
          <p className="auth-subtitle">Create Caregiver or SmartGuide Account</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-control"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="form-control"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Role</label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="CAREGIVER">Caregiver (Monitoring Dashboard)</option>
              <option value="PATIENT">Patient (Visually Impaired User)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
