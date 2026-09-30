import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Cpu, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    is_active: true,
  });

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/devices/');
      setDevices(res.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError('Failed to fetch registered devices. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormData({ device_id: '', name: '', is_active: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (device) => {
    setEditingDevice(device);
    setFormData({
      device_id: device.device_id,
      name: device.name,
      is_active: device.is_active,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await api.put(`/devices/${editingDevice.id}/`, formData);
      } else {
        await api.post('/devices/', formData);
      }
      handleCloseModal();
      fetchDevices();
    } catch (err) {
      console.error('Failed to save device:', err);
      alert('Error saving device: ' + (err.response?.data?.detail || err.response?.data?.device_id?.[0] || 'Check network.'));
    }
  };

  const handleDelete = async (id, deviceId) => {
    if (window.confirm(`Are you sure you want to delete Smart Cane device "${deviceId}"?`)) {
      try {
        await api.delete(`/devices/${id}/`);
        fetchDevices();
      } catch (err) {
        console.error('Failed to delete device:', err);
        alert('Could not delete device.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SmartGuide Devices</h1>
          <p className="page-subtitle">Manage Raspberry Pi Smart Cane IoT devices and owners.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Register New Device
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading device list...</p>
        ) : devices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Cpu size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3>No Devices Registered</h3>
            <p style={{ color: '#64748b', marginTop: '0.4rem' }}>
              Click "Register New Device" above to pair a SmartGuide Smart Cane.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Device Name</th>
                  <th>Owner / User</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                        {device.device_id}
                      </span>
                    </td>
                    <td>
                      <strong>{device.name}</strong>
                    </td>
                    <td>
                      {device.owner_detail ? (
                        <span>
                          {device.owner_detail.first_name ? `${device.owner_detail.first_name} (${device.owner_detail.username})` : device.owner_detail.username}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${device.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {device.is_active ? (
                          <>
                            <CheckCircle size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td>{new Date(device.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(device)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Device"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(device.id, device.device_id)}
                          className="btn btn-danger btn-sm"
                          title="Delete Device"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDevice ? 'Edit SmartGuide Device' : 'Register New SmartGuide Device'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="device_id">Hardware Device ID</label>
            <input
              id="device_id"
              type="text"
              className="form-control"
              placeholder="e.g. SG-CANE-002"
              value={formData.device_id}
              onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              required
              disabled={!!editingDevice}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Device Name</label>
            <input
              id="name"
              type="text"
              className="form-control"
              placeholder="e.g. Grandma's Smart Cane"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="is_active" style={{ marginBottom: 0 }}>
              Device Active / Online
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDevice ? 'Save Changes' : 'Register Device'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Devices;
