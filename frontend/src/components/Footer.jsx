import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Cpu, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '3rem 1.5rem 1.5rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#3b82f6', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={18} />
            </div>
            <span>Smart Lost & Found</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Next-generation lost and found recovery platform powered by AI multimodal image matching, geolocation discovery, and secure ownership verification.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Platform Features</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={15} color="#3b82f6" /> Pretrained CLIP AI Matching
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} color="#10b981" /> OpenStreetMap Proximity Search
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} color="#6366f1" /> Confidential Ownership Claims
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/lost-items">Browse Lost Reports</Link></li>
            <li><Link to="/found-items">Browse Found Belongings</Link></li>
            <li><Link to="/matches">Review AI Matches</Link></li>
            <li><Link to="/map">Interactive Map</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Technology & Architecture</h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Django 5 & REST Framework &bull; MySQL 8.4 Relational DB &bull; React 19 &bull; Leaflet OSM &bull; JWT Authentication
          </p>
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', color: '#047857', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            AI Engine & Backend Online
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
        <p>&copy; {new Date().getFullYear()} Smart Lost & Found Platform. Professional Full Stack Project.</p>
        <p>Built for secure, transparent community recovery.</p>
      </div>
    </footer>
  );
};

export default Footer;
