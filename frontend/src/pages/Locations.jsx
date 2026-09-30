import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MapPlaceholder from '../components/MapPlaceholder';
import Modal from '../components/Modal';
import { MapPin, Plus, RefreshCw, Clock, Navigation } from 'lucide-react';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manual Test Location Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    device: '',
    latitude: '8.4542',
    longitude: '124.6319',
  });

  const fetchLocationsAndDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [locRes, devRes] = await Promise.all([
        api.get('/locations/'),
        api.get('/devices/'),
      ]);
      setLocations(locRes.data);
      setDevices(devRes.data);
      if (devRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, device: devRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load location data:', err);
      setError('Failed to retrieve location history. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationsAndDevices();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/locations/', {
        device: parseInt(formData.device),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      handleCloseModal();
      fetchLocationsAndDevices();
    } catch (err) {
      console.error('Failed to record location:', err);
      alert('Error submitting location signal.');
    }
  };

  const latestLocation = locations.length > 0 ? locations[0] : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">GPS Location Tracking</h1>
          <p className="page-subtitle">Historical coordinates and live spatial telemetry of SmartGuide canes.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchLocationsAndDevices} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleOpenModal} className="btn btn-primary" disabled={devices.length === 0}>
            <Plus size={16} /> Simulate GPS Telemetry
          </button>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Map Radar Banner */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <span className="card-title">
            <Navigation size={20} color="#2563eb" /> Map Interface Placeholder
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Future Neo-6M GPS Module Sync
          </span>
        </div>
        <MapPlaceholder
          latitude={latestLocation?.latitude}
          longitude={latestLocation?.longitude}
          title="Caregiver SmartGuide Geofence Radar"
        />
      </div>

      {/* Location Logs Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <MapPin size={20} color="#2563eb" /> GPS Telemetry History Logs
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading location logs...</p>
        ) : locations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <MapPin size={44} color="#94a3b8" style={{ marginBottom: '0.8rem' }} />
            <p>No location updates recorded yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Record #</th>
                  <th>Smart Cane Device</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Coordinates String</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td>#{loc.id}</td>
                    <td>
                      <strong>
                        {loc.device_detail ? `${loc.device_detail.name} (${loc.device_detail.device_id})` : `Device ID: ${loc.device}`}
                      </strong>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{loc.latitude.toFixed(5)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{loc.longitude.toFixed(5)}</td>
                    <td>
                      <span className="badge badge-other" style={{ textTransform: 'none', fontFamily: 'monospace' }}>
                        {loc.latitude}, {loc.longitude}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#64748b' }}>
                        <Clock size={14} /> {new Date(loc.timestamp).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual GPS Submission Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Simulate GPS Telemetry Broadcast">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="device">Select Smart Cane Device</label>
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
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              type="number"
              step="any"
              className="form-control"
              placeholder="e.g. 8.4542"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              type="number"
              step="any"
              className="form-control"
              placeholder="e.g. 124.6319"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Transmit GPS Signal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Locations;
