import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapPlaceholder = ({ latitude, longitude, title = "Live Location & GPS Tracking Map" }) => {
  return (
    <div className="map-placeholder">
      <div className="map-placeholder-icon">
        <MapPin size={48} />
      </div>
      <h3>{title}</h3>
      <p style={{ marginTop: '0.4rem', marginBottom: '0.8rem', color: '#93c5fd' }}>
        {latitude && longitude 
          ? `Current Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          : 'Waiting for device GPS signal broadcast...'}
      </p>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
        <strong>Google Maps Integration Placeholder:</strong> Live real-time map rendering with safe zone geofencing will be activated in the next development phase when Neo-6M GPS hardware is connected.
      </p>
    </div>
  );
};

export default MapPlaceholder;
