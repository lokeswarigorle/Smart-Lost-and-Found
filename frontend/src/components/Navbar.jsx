import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import {
  Compass,
  Search,
  PlusCircle,
  Cpu,
  MapPin,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getNotifications()
        .then((res) => {
          setUnreadCount(res.data.unread_count || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Compass size={22} />
          </div>
          <span>Smart Lost & Found</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links">
          <NavLink to="/lost-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Lost Items
          </NavLink>
          <NavLink to="/found-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Found Items
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Cpu size={16} /> AI Matches
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MapPin size={16} /> Nearby Map
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Claims
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: '#dc2626' }}>
                  <ShieldAlert size={16} /> Admin
                </NavLink>
              )}
            </>
          ) : null}
        </nav>

        {/* Right Action Icons / Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <>
              {/* Report Actions */}
              <Link to="/report-lost" className="btn btn-primary btn-sm" style={{ background: '#ef4444' }}>
                <PlusCircle size={15} /> Report Lost
              </Link>
              <Link to="/report-found" className="btn btn-primary btn-sm" style={{ background: '#10b981' }}>
                <PlusCircle size={15} /> Report Found
              </Link>

              {/* Notification Bell */}
              <Link to="/notifications" className="nav-link" style={{ position: 'relative', padding: '0.5rem' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Link */}
              <Link to="/profile" className="nav-link" title={`Logged in as ${user?.username}`}>
                <User size={19} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
