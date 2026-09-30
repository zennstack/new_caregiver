import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { ShieldAlert, CheckCircle, Plus, AlertOctagon, RefreshCw, Filter } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    device: '',
    alert_type: 'SOS',
    message: 'Manual Emergency SOS trigger from caregiver dashboard',
    latitude: '8.4561',
    longitude: '124.6340',
  });

  const fetchAlertsAndDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertRes, devRes] = await Promise.all([
        api.get('/alerts/'),
        api.get('/devices/'),
      ]);
      setAlerts(alertRes.data);
      setDevices(devRes.data);
      if (devRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, device: devRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to fetch alert logs from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndDevices();
  }, []);

  const handleResolve = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/`, { is_resolved: true });
      fetchAlertsAndDevices();
    } catch (err) {
      console.error('Failed to mark alert as resolved:', err);
      alert('Could not update alert status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alerts/', {
        device: parseInt(formData.device),
        alert_type: formData.alert_type,
        message: formData.message,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
      setIsModalOpen(false);
      fetchAlertsAndDevices();
    } catch (err) {
      console.error('Failed to trigger alert:', err);
      alert('Error triggering test alert.');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNRESOLVED') return !a.is_resolved;
    return a.alert_type === filterType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Safety & Emergency Alerts</h1>
          <p className="page-subtitle">Real-time SOS, Fall Detection, and Device notifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchAlertsAndDevices} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-danger" disabled={devices.length === 0}>
            <AlertOctagon size={16} /> Create Test Alert
          </button>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={16} /> Filter Alerts:
          </span>
          {['ALL', 'UNRESOLVED', 'SOS', 'FALL', 'LOW_BATTERY', 'OTHER'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {type.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List / Table */}
      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading safety alerts...</p>
        ) : filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <ShieldAlert size={44} color="#94a3b8" style={{ marginBottom: '0.8rem' }} />
            <p>No alerts matching the selected filter criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Severity / Type</th>
                  <th>Alert Notification Message</th>
                  <th>Smart Cane Device</th>
                  <th>Coordinates</th>
                  <th>Date / Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    style={{
                      backgroundColor: !alert.is_resolved && (alert.alert_type === 'SOS' || alert.alert_type === 'FALL') ? '#fff5f5' : 'transparent',
                    }}
                  >
                    <td>
                      <span className={`badge badge-${alert.alert_type.toLowerCase()}`}>
                        {alert.alert_type}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: alert.alert_type === 'SOS' ? '#991b1b' : 'inherit' }}>
                        {alert.message}
                      </strong>
                    </td>
                    <td>
                      {alert.device_detail ? `${alert.device_detail.name} (${alert.device_detail.device_id})` : `Device ID ${alert.device}`}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {alert.latitude && alert.longitude ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}` : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(alert.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${alert.is_resolved ? 'badge-resolved' : 'badge-unresolved'}`}>
                        {alert.is_resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!alert.is_resolved ? (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle size={14} /> Mark Resolved
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
                          ✓ Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trigger Test Alert Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Trigger Test Emergency Alert">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="device">Target Smart Cane Device</label>
            <select
              id="device"
              className="form-control"
              value={formData.device}
              onChange={(e) => setFormData({ ...formData, device: e.target.value })}
              required
            >
              {devices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.device_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="alert_type">Alert Type</label>
            <select
              id="alert_type"
              className="form-control"
              value={formData.alert_type}
              onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
            >
              <option value="SOS">Emergency SOS (High Severity)</option>
              <option value="FALL">Fall Detected (High Severity)</option>
              <option value="LOW_BATTERY">Low Battery Warning</option>
              <option value="OTHER">Other System Alert</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Alert Message</label>
            <textarea
              id="message"
              className="form-control"
              rows={3}
              placeholder="Describe the test alert..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="latitude">Latitude (Optional)</label>
              <input
                id="latitude"
                type="number"
                step="any"
                className="form-control"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">Longitude (Optional)</label>
              <input
                id="longitude"
                type="number"
                step="any"
                className="form-control"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Broadcast Alert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Alerts;
