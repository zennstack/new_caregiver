import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Cpu, 
  MapPin, 
  User, 
  LogOut, 
  ShieldAlert 
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Devices', path: '/devices', icon: Cpu },
    { label: 'Locations', path: '/locations', icon: MapPin },
    { label: 'Alerts', path: '/alerts', icon: ShieldAlert },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldAlert size={26} color="#3b82f6" />
        <div>
          <span className="brand-title">SmartGuide</span>
          <span className="brand-badge" style={{ marginLeft: '6px' }}>IoT</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
