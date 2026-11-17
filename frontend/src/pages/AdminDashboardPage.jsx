import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, authService, itemService, claimService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldAlert,
  Users,
  FileText,
  CheckCircle,
  Cpu,
  Clock,
  CheckCheck,
  XCircle,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'recent'

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminStats(),
      authService.getUsers(),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setUsersList(usersRes.data.results || usersRes.data || []);
      })
      .catch((err) => console.error('Admin dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating platform system statistics..." />;
  }

  const overview = stats?.overview || {};

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fee2e2', color: '#dc2626', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldAlert size={15} /> SYSTEM ADMINISTRATION PORTAL
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Administrator Control Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Global application monitoring, AI performance oversight, claim auditing, and user management.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid (8 Metrics from Section 11) */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.total_users || 0}</div>
            <div className="stat-title">Total Registered Users</div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.total_lost_items || 0}</div>
            <div className="stat-title">Total Lost Items</div>
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, marginTop: '0.2rem' }}>
              {overview.active_lost_items || 0} Active
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.total_found_items || 0}</div>
            <div className="stat-title">Total Found Items</div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
              {overview.available_found_items || 0} in custody
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.total_possible_matches || 0}</div>
            <div className="stat-title">Total AI Matches</div>
            <div style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600, marginTop: '0.2rem' }}>
              {overview.high_confidence_matches || 0} High Confidence
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Cpu size={24} />
          </div>
        </div>
      </div>

      {/* Secondary KPI Grid (Claims & Cases) */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.pending_claims || 0}</div>
            <div className="stat-title">Pending Claims</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.approved_claims || 0}</div>
            <div className="stat-title">Approved Claims</div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.rejected_claims || 0}</div>
            <div className="stat-title">Rejected Claims</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <XCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{overview.resolved_cases || 0}</div>
            <div className="stat-title">Resolved Recoveries</div>
          </div>
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Recent Activity & Categories
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Manage Registered Users ({usersList.length})
        </button>
      </div>

      {/* Tab 1: Activity & Categories */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Top Lost Categories Breakdown */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>
              Top Lost Categories Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats?.category_breakdown?.map((cat) => (
                <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#334155' }}>{cat.category}</span>
                  <span className="badge" style={{ background: '#eff6ff', color: '#1e40af' }}>{cat.count} reports</span>
                </div>
              ))}
              {(!stats?.category_breakdown || stats.category_breakdown.length === 0) && (
                <p style={{ color: '#94a3b8' }}>No category data yet.</p>
              )}
            </div>
          </div>

          {/* Recent Claims Submitted */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
                Recent Ownership Claims
              </h3>
              <Link to="/claims" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                View All Claims
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.recent_claims?.map((claim) => (
                <div key={claim.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                  <div>
                    <strong style={{ color: '#1e293b' }}>{claim.found_item__title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>By {claim.claimant__username}</div>
                  </div>
                  <span className="badge badge-pending">{claim.status}</span>
                </div>
              ))}
              {(!stats?.recent_claims || stats.recent_claims.length === 0) && (
                <p style={{ color: '#94a3b8' }}>No claim activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>
            Registered Users ({usersList.length})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Username</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>City</th>
                <th style={{ padding: '0.75rem' }}>Staff/Admin</th>
                <th style={{ padding: '0.75rem' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{u.id}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{u.username}</td>
                  <td style={{ padding: '0.75rem', color: '#64748b' }}>{u.email || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge" style={{ background: u.role === 'admin' ? '#fee2e2' : u.role === 'finder' ? '#d1fae5' : '#eff6ff', color: u.role === 'admin' ? '#b91c1c' : u.role === 'finder' ? '#065f46' : '#1e40af' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#64748b' }}>{u.city || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{u.is_staff ? 'Yes (Staff)' : 'No'}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>
                    {new Date(u.created_at || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
