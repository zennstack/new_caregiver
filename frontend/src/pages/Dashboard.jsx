import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapPlaceholder from '../components/MapPlaceholder';
import { 
  Cpu, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  ArrowRight,
  UserCheck,
  UserPlus,
  HeartHandshake
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const isCaregiver = user?.role === 'CAREGIVER';

  // Caregiver state
  const [patients, setPatients] = useState([]);
  const [pairings, setPairings] = useState([]);
  const [patientUsername, setPatientUsername] = useState('');
  const [pairSuccess, setPairSuccess] = useState('');
  const [pairError, setPairError] = useState('');
  const [pairLoading, setPairLoading] = useState(false);

  // Monitoring state
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isCaregiver) {
        const [ptsRes, pairRes, devRes, altRes, locRes] = await Promise.all([
          api.get('/patients/my/'),
          api.get('/pairings/my/'),
          api.get('/devices/'),
          api.get('/alerts/'),
          api.get('/locations/'),
        ]);
        setPatients(ptsRes.data);
        setPairings(pairRes.data);
        setDevices(devRes.data);
        setAlerts(altRes.data);
        setLocations(locRes.data);
      } else {
        // Patient role view
        const [pairRes, devRes, altRes, locRes] = await Promise.all([
          api.get('/pairings/my/'),
          api.get('/devices/'),
          api.get('/alerts/'),
          api.get('/locations/'),
        ]);
        setPairings(pairRes.data);
        setDevices(devRes.data);
        setAlerts(altRes.data);
        setLocations(locRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch account telemetry. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isCaregiver]);

  const handlePairPatient = async (e) => {
    e.preventDefault();
    setPairSuccess('');
    setPairError('');
    if (!patientUsername.trim()) return;

    setPairLoading(true);
    try {
      const res = await api.post('/pairings/', { patient_username: patientUsername.trim() });
      setPairSuccess(`Successfully paired with patient "${res.data.patient_detail?.username || patientUsername}"!`);
      setPatientUsername('');
      fetchDashboardData();
    } catch (err) {
      console.error('Pairing error:', err);
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'object') {
          const key = Object.keys(data)[0];
          const val = data[key];
          setPairError(`${key}: ${Array.isArray(val) ? val.join(' ') : val}`);
        } else {
          setPairError('Failed to create pairing.');
        }
      } else {
        setPairError('Network error while initiating pairing.');
      }
    } finally {
      setPairLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/`, { is_resolved: true });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: '#64748b' }}>
        <p>Loading SmartGuide account dashboard...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // PATIENT UI VIEW
  // ----------------------------------------------------
  if (!isCaregiver) {
    const activePairing = pairings.find((p) => p.status === 'ACTIVE') || pairings[0];

    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {user?.first_name || user?.username}!</h1>
            <p className="page-subtitle">Patient SmartGuide Account & Caregiver Pairing Status.</p>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Pairing Info Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <HeartHandshake size={20} color="#2563eb" /> Pairing Information
              </span>
            </div>

            {pairings.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  No caregiver paired yet.
                </p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Provide your username (<strong>{user?.username}</strong>) to your assigned Caregiver so they can pair with your account.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pairings.map((p) => (
                  <div key={p.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Assigned Caregiver</span>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-active' : 'badge-unresolved'}`}>
                        Status: {p.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                      {p.caregiver_detail?.first_name ? `${p.caregiver_detail.first_name} ${p.caregiver_detail.last_name || ''}` : p.caregiver_detail?.username}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Username: <code>@{p.caregiver_detail?.username}</code> | Email: {p.caregiver_detail?.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Devices */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Cpu size={20} color="#2563eb" /> My Smart Cane Devices
              </span>
            </div>
            {devices.length === 0 ? (
              <p style={{ color: '#64748b' }}>No Smart Cane assigned to your account yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {devices.map((dev) => (
                  <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div>
                      <strong>{dev.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'monospace', color: '#2563eb' }}>{dev.device_id}</span>
                    </div>
                    <span className={`badge ${dev.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {dev.is_active ? 'Active' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CAREGIVER UI VIEW
  // ----------------------------------------------------
  const activeDevicesCount = devices.filter((d) => d.is_active).length;
  const unresolvedAlerts = alerts.filter((a) => !a.is_resolved);
  const latestLocation = locations.length > 0 ? locations[0] : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.first_name || user?.username}!</h1>
          <p className="page-subtitle">Caregiver Account & Patient Pairing Monitoring Dashboard.</p>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Pairing & Patient Management Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Paired Patients List */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <span className="card-title">
              <UserCheck size={20} color="#2563eb" /> Paired Patients ({patients.length})
            </span>
          </div>

          {patients.length === 0 ? (
            <div style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>
              <p>No patients paired yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Use the pairing form on the right to connect with a patient.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {patients.map((pt) => (
                <div key={pt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong>{pt.first_name ? `${pt.first_name} ${pt.last_name || ''}` : pt.username}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Username: <code>@{pt.username}</code> ({pt.email})</span>
                  </div>
                  <span className="badge badge-active">Paired</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pair Patient Form */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <span className="card-title">
              <UserPlus size={20} color="#2563eb" /> Pair Patient
            </span>
          </div>

          {pairSuccess && <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>{pairSuccess}</div>}
          {pairError && <div className="error-alert" style={{ marginBottom: '1rem' }}>{pairError}</div>}

          <form onSubmit={handlePairPatient}>
            <div className="form-group">
              <label htmlFor="patientUsername">Patient Username</label>
              <input
                id="patientUsername"
                type="text"
                className="form-control"
                placeholder="Enter patient username (e.g. patient1)"
                value={patientUsername}
                onChange={(e) => setPatientUsername(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={pairLoading}>
              {pairLoading ? 'Pairing...' : (
                <>
                  <UserPlus size={16} /> Pair Patient
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Cpu size={26} />
          </div>
          <div className="stat-details">
            <h4>Active Smart Canes</h4>
            <div className="stat-value">{activeDevicesCount} / {devices.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${unresolvedAlerts.length > 0 ? 'danger' : 'success'}`}>
            <AlertTriangle size={26} />
          </div>
          <div className="stat-details">
            <h4>Active Emergency Alerts</h4>
            <div className="stat-value" style={{ color: unresolvedAlerts.length > 0 ? '#ef4444' : '#10b981' }}>
              {unresolvedAlerts.length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <MapPin size={26} />
          </div>
          <div className="stat-details">
            <h4>Latest GPS Log</h4>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>
              {latestLocation ? `${latestLocation.latitude.toFixed(3)}, ${latestLocation.longitude.toFixed(3)}` : 'No signals'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Map + Recent Alerts */}
      <div className="dashboard-grid">
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <MapPin size={20} color="#2563eb" /> Live Location Radar
              </span>
              {latestLocation && (
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> Updated: {new Date(latestLocation.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <MapPlaceholder
              latitude={latestLocation?.latitude}
              longitude={latestLocation?.longitude}
              title="SmartGuide Cane Live GPS Radar"
            />
          </div>
        </div>

        {/* Right Sidebar: Recent Emergency Alerts */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <ShieldAlert size={20} color="#ef4444" /> Recent Safety Alerts
              </span>
              <Link to="/alerts" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                View All
              </Link>
            </div>

            {alerts.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No safety alerts logged for paired patients.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '0.9rem',
                      borderRadius: '8px',
                      background: alert.alert_type === 'SOS' || alert.alert_type === 'FALL' ? '#fef2f2' : '#f8fafc',
                      border: `1px solid ${alert.alert_type === 'SOS' || alert.alert_type === 'FALL' ? '#fca5a5' : '#e2e8f0'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className={`badge badge-${alert.alert_type.toLowerCase()}`}>
                        {alert.alert_type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '500', marginBottom: '0.5rem' }}>
                      {alert.message}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: '#64748b' }}>
                        Device: <strong>{alert.device_detail?.device_id || alert.device}</strong>
                      </span>

                      {!alert.is_resolved ? (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}>
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
