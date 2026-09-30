import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const initial = user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <header className="top-header">
      <div className="header-title">
        {user?.role === 'CAREGIVER' ? 'Caregiver Portal' : 'Patient Portal'}
      </div>
      <div className="user-profile-badge">
        <div className="avatar">{initial}</div>
        <div className="user-info">
          <span className="user-name">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
          </span>
          <span className="user-role">{user?.role === 'CAREGIVER' ? 'Caregiver' : 'Patient'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
