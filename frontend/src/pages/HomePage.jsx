import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  PlusCircle,
  Cpu,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';

const HomePage = () => {
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      itemService.getLostItems({ limit: 4 }),
      itemService.getFoundItems({ limit: 4 }),
    ])
      .then(([lostRes, foundRes]) => {
        setRecentLost(lostRes.data.results || lostRes.data.items || []);
        setRecentFound(foundRes.data.results || foundRes.data.items || []);
      })
      .catch((e) => console.error('Error fetching home data:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '4rem 2.5rem',
          marginBottom: '3rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93c5fd',
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={16} /> Pretrained CLIP Multimodal AI Matching Enabled
          </div>

          <h1
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Recover What You Lost. Return What You Found.
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            The intelligent community lost and found network. Upload photographs to extract AI visual embeddings, pinpoint locations on OpenStreetMap, and securely verify ownership through confidential claims.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              to="/report-lost"
              className="btn btn-primary"
              style={{ background: '#ef4444', padding: '0.8rem 1.6rem', fontSize: '1rem' }}
            >
              <PlusCircle size={18} /> I Lost Something
            </Link>
            <Link
              to="/report-found"
              className="btn btn-primary"
              style={{ background: '#10b981', padding: '0.8rem 1.6rem', fontSize: '1rem' }}
            >
              <PlusCircle size={18} /> I Found Something
            </Link>
            <Link
              to="/map"
              className="btn btn-secondary"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', padding: '0.8rem 1.6rem', fontSize: '1rem' }}
            >
              <MapPin size={18} /> Explore Nearby Map
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>
          How Smart AI Recovery Works
        </h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1rem' }}>
          Three-step intelligent matching cycle connecting community members safely.
        </p>

        <div className="grid-cols-3">
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Cpu size={26} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', color: '#1e293b' }}>
              1. Multimodal AI Matching
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Uploaded photographs are transformed into normalized feature embeddings. Our engine computes cosine visual similarity (60%), category (15%), color (10%), text description (10%), and geographical distance (5%).
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <MapPin size={26} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', color: '#1e293b' }}>
              2. Proximity-Based Discovery
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Interactive OpenStreetMap Leaflet integration allows real-time radius searches using the Haversine distance formula, while protecting exact private user addresses.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', color: '#1e293b' }}>
              3. Secure Verification Claims
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              AI similarity scores flag potential matches, but ownership is verified through confidential answers (serial numbers, hidden markings, receipts) reviewed by the finder or administrator.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Lost Reports */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Recent Lost Reports</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>People actively searching for their belongings.</p>
          </div>
          <Link to="/lost-items" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View All Lost Items <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid-cols-4">
          {recentLost.slice(0, 4).map((item) => (
            <ItemCard key={`lost-${item.id}`} item={item} type="lost" />
          ))}
          {recentLost.length === 0 && !loading && (
            <p style={{ color: '#94a3b8', gridColumn: 'span 4', textAlign: 'center', padding: '2rem' }}>
              No lost items reported yet. Be the first to report!
            </p>
          )}
        </div>
      </section>

      {/* Recent Found Reports */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Recent Found Items</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Items in safe custody waiting for their rightful owner.</p>
          </div>
          <Link to="/found-items" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View All Found Items <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid-cols-4">
          {recentFound.slice(0, 4).map((item) => (
            <ItemCard key={`found-${item.id}`} item={item} type="found" />
          ))}
          {recentFound.length === 0 && !loading && (
            <p style={{ color: '#94a3b8', gridColumn: 'span 4', textAlign: 'center', padding: '2rem' }}>
              No found items reported yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
