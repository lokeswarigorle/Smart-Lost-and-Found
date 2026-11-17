import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ShieldCheck, Cpu } from 'lucide-react';
import { MEDIA_BASE_URL } from '../services/api';

const ItemCard = ({ item, type = 'lost' }) => {
  const isLost = type === 'lost';
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${MEDIA_BASE_URL}${item.image}`
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60';

  const dateValue = isLost ? item.date_lost : item.date_found;
  const locationValue = isLost ? item.location_name : item.found_location;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
      {/* Photograph */}
      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
        </div>
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span className="badge badge-pending" style={{ background: 'rgba(255,255,255,0.9)', color: '#1e293b' }}>
            {item.status_display || item.status}
          </span>
        </div>
      </div>

      {/* Item Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          <Tag size={13} />
          <span>{item.category_display || item.category}</span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {item.title}
        </h3>

        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>

        {/* Location & Date Meta */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.83rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="#64748b" />
            <span style={{ fontWeight: 500 }}>{item.city}{item.area ? `, ${item.area}` : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="#64748b" />
            <span>{dateValue}</span>
          </div>
        </div>

        {/* Action Link */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/items/${type}/${item.id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, textAlign: 'center' }}
          >
            View Details
          </Link>
          {!isLost && (
            <Link
              to={`/claims?claim_item=${item.id}`}
              className="btn btn-primary btn-sm"
              style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Claim this found item"
            >
              <ShieldCheck size={14} /> Claim
            </Link>
          )}
          {isLost && (
            <Link
              to={`/matches?lost_item=${item.id}`}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Check AI Matches"
            >
              <Cpu size={14} /> Matches
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
