import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService, MEDIA_BASE_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Cpu,
  User,
  ArrowLeft,
  Trash2,
  Edit3,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  Archive,
} from 'lucide-react';

const ItemDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const isLost = type === 'lost';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchFunc = isLost ? itemService.getLostItem : itemService.getFoundItem;
    fetchFunc(id)
      .then((res) => {
        setItem(res.data);
      })
      .catch((err) => {
        console.error('Fetch detail error:', err);
        setError('Item not found or failed to load details.');
      })
      .finally(() => setLoading(false));
  }, [type, id]);

  const isOwner =
    user &&
    ((isLost && item?.user?.id === user.id) ||
      (!isLost && item?.finder?.id === user.id) ||
      isAdmin);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      if (isLost) {
        await itemService.deleteLostItem(id);
        navigate('/lost-items');
      } else {
        await itemService.deleteFoundItem(id);
        navigate('/found-items');
      }
    } catch (err) {
      alert('Failed to delete report.');
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading item details..." />;

  if (error || !item) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '0.5rem' }}>Item Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'Unable to display item information.'}</p>
        <Link to={isLost ? '/lost-items' : '/found-items'} className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Listing
        </Link>
      </div>
    );
  }

  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${MEDIA_BASE_URL}${item.image}`
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=60';

  const dateValue = isLost ? item.date_lost : item.date_found;
  const locationValue = isLost ? item.location_name : item.found_location;
  const reporter = isLost ? item.user : item.finder;

  return (
    <div style={{ maxWidth: '1000px', margin: '1rem auto' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="card" style={{ padding: '2.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Left Column: Photograph */}
          <div>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                maxHeight: '440px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '440px' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=60';
                }}
              />
            </div>

            {/* Quick Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!isLost && (
                <Link
                  to={`/claims?claim_item=${item.id}`}
                  className="btn btn-primary"
                  style={{ background: '#10b981', width: '100%', padding: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <ShieldCheck size={18} /> Claim This Item (Verify Ownership)
                </Link>
              )}

              {isLost && (
                <Link
                  to={`/matches?lost_item=${item.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Cpu size={18} /> Check AI Image Similarity Matches
                </Link>
              )}

              {isOwner && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete Report'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Meta & Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
                {isLost ? 'Lost Item Report' : 'Found Item Record'}
              </span>
              <span className="badge badge-pending">
                {item.status_display || item.status}
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.25 }}>
              {item.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              <Tag size={16} />
              <span>{item.category_display || item.category}</span>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Item Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Primary Color:</span>{' '}
                  <strong style={{ color: '#1e293b' }}>{item.primary_color}</strong>
                </div>
                {item.secondary_color && (
                  <div>
                    <span style={{ color: '#64748b' }}>Accent Color:</span>{' '}
                    <strong style={{ color: '#1e293b' }}>{item.secondary_color}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: '#64748b' }}>{isLost ? 'Date Lost:' : 'Date Found:'}</span>{' '}
                  <strong style={{ color: '#1e293b' }}>{dateValue}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>City:</span>{' '}
                  <strong style={{ color: '#1e293b' }}>{item.city}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                Description
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {item.description}
              </p>
            </div>

            {/* Location Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                Location
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#475569', fontSize: '0.92rem' }}>
                <MapPin size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{locationValue}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {item.area ? `${item.area}, ` : ''}{item.city}
                    {item.latitude && item.longitude && (
                      <span style={{ marginLeft: '0.5rem', color: '#94a3b8' }}>
                        ({Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Location if found item */}
            {!isLost && item.storage_location && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Current Custody / Safe Keeping
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', background: '#ecfdf5', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <Archive size={17} />
                  <span>{item.storage_location}</span>
                </div>
              </div>
            )}

            {/* Reporter Contact Info */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    Reported by {reporter?.username || 'Community Member'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Preferred: {item.contact_preference || 'In-App Message'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
