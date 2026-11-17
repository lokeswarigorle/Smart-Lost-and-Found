import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Bell,
  CheckCircle,
  CheckCheck,
  Cpu,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    notificationService.getNotifications()
      .then((res) => {
        setNotifications(res.data.results || res.data || []);
        setUnreadCount(res.data.unread_count || 0);
      })
      .catch((err) => console.error('Error fetching notifications:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error('Mark read error:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Mark all read error:', e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match_found':
        return <Cpu size={20} color="#2563eb" />;
      case 'claim_received':
        return <ShieldCheck size={20} color="#d97706" />;
      case 'claim_approved':
        return <CheckCircle size={20} color="#059669" />;
      case 'claim_rejected':
        return <XCircle size={20} color="#dc2626" />;
      default:
        return <Info size={20} color="#3b82f6" />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '1rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Bell size={15} /> REAL-TIME ALERTS & NOTIFICATIONS
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Notifications {unreadCount > 0 && <span style={{ fontSize: '1.2rem', color: '#ef4444' }}>({unreadCount} unread)</span>}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Updates regarding AI matches, ownership claims, and report status changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your notifications..." />
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {notifications.map((notif) => (
            <div
              key={`notif-${notif.id}`}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: notif.is_read ? '4px solid #cbd5e1' : '4px solid #3b82f6',
                background: notif.is_read ? '#ffffff' : '#f8fafc',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div style={{ marginTop: '3px' }}>{getNotificationIcon(notif.notification_type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                    )}
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    {notif.link && (
                      <Link to={notif.link} style={{ fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Open Details <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                  title="Mark as read"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Bell size={42} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
            No Notifications
          </h3>
          <p style={{ color: '#64748b' }}>
            You're all caught up! You will be notified here when AI matches or claims are submitted.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
