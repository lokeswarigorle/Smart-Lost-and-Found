import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, itemService, matchingService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemCard from '../components/ItemCard';
import {
  FileText,
  PlusCircle,
  Cpu,
  ShieldCheck,
  Bell,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getUserStats(),
      itemService.getLostItems({ my_reports: true, limit: 3 }),
      itemService.getFoundItems({ my_reports: true, limit: 3 }),
    ])
      .then(([statsRes, lostRes, foundRes]) => {
        setStats(statsRes.data);
        setMyLostItems(lostRes.data.results || lostRes.data.items || []);
        setMyFoundItems(foundRes.data.results || foundRes.data.items || []);
      })
      .catch((err) => console.error('Dashboard data error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div>
      {/* Header welcome banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Hello, {user?.first_name || user?.username}!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage your reported items, check AI visual matches, and track ownership claims.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report-lost" className="btn btn-primary" style={{ background: '#ef4444' }}>
            <PlusCircle size={16} /> Report Lost Item
          </Link>
          <Link to="/report-found" className="btn btn-primary" style={{ background: '#10b981' }}>
            <PlusCircle size={16} /> Report Found Item
          </Link>
        </div>
      </div>

      {/* Numerical Stats Widgets */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats?.my_lost_items || 0}</div>
            <div className="stat-title">My Lost Reports</div>
            <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>
              {stats?.my_lost_recovered || 0} Recovered
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{stats?.my_found_items || 0}</div>
            <div className="stat-title">My Found Items</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              {stats?.my_found_available || 0} in custody
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{stats?.my_matches_count || 0}</div>
            <div className="stat-title">AI Matches Found</div>
            <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '0.2rem', fontWeight: 600 }}>
              <Link to="/matches">Review Matches &rarr;</Link>
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Cpu size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value">{stats?.my_claims_submitted || 0}</div>
            <div className="stat-title">Claims Submitted</div>
            <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.2rem', fontWeight: 600 }}>
              {stats?.my_claims_pending || 0} Pending Verification
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Action Notice if Claims Received */}
      {stats?.claims_received_pending > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '2.5rem' }}>
          <AlertTriangle size={20} />
          <div style={{ flex: 1 }}>
            <strong>Action Needed:</strong> You have {stats.claims_received_pending} pending ownership claim(s) from users claiming items you found.
          </div>
          <Link to="/claims" className="btn btn-secondary btn-sm">
            Review Claims
          </Link>
        </div>
      )}

      {/* My Lost Items Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            My Lost Item Reports
          </h2>
          <Link to="/lost-items?my_reports=true" className="btn btn-secondary btn-sm">
            View All My Reports <ArrowRight size={14} />
          </Link>
        </div>

        {myLostItems.length > 0 ? (
          <div className="grid-cols-3">
            {myLostItems.map((item) => (
              <ItemCard key={`mylost-${item.id}`} item={item} type="lost" />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>You haven't reported any lost belongings yet.</p>
            <Link to="/report-lost" className="btn btn-primary" style={{ background: '#ef4444' }}>
              <PlusCircle size={16} /> Report a Lost Item
            </Link>
          </div>
        )}
      </div>

      {/* My Found Items Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Items I Have Found & Reported
          </h2>
          <Link to="/found-items?my_reports=true" className="btn btn-secondary btn-sm">
            View All My Found Items <ArrowRight size={14} />
          </Link>
        </div>

        {myFoundItems.length > 0 ? (
          <div className="grid-cols-3">
            {myFoundItems.map((item) => (
              <ItemCard key={`myfound-${item.id}`} item={item} type="found" />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>You haven't reported any found items yet.</p>
            <Link to="/report-found" className="btn btn-primary" style={{ background: '#10b981' }}>
              <PlusCircle size={16} /> Report a Found Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
