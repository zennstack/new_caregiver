import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Server } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account & Profile</h1>
          <p className="page-subtitle">Authenticated caregiver account information.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* User Card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#2563eb',
              color: 'white',
              fontSize: '2rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            {user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>@{user?.username}</p>

          <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
            {user?.role === 'CAREGIVER' ? 'Registered Caregiver' : 'SmartGuide User'}
          </span>
        </div>

        {/* Detailed Info Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <User size={20} color="#2563eb" /> Account Details
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <User size={20} color="#64748b" />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Full Name</span>
                <strong style={{ fontSize: '1rem' }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Not specified'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={20} color="#64748b" />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Email Address</span>
                <strong style={{ fontSize: '1rem' }}>{user?.email || 'N/A'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield size={20} color="#64748b" />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Assigned System Role</span>
                <strong style={{ fontSize: '1rem' }}>{user?.role}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={20} color="#64748b" />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Member Since</span>
                <strong style={{ fontSize: '1rem' }}>
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Server size={20} color="#64748b" />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Authentication Protocol</span>
                <strong style={{ fontSize: '1rem' }}>Simple JWT Authorization Bearer Token</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
