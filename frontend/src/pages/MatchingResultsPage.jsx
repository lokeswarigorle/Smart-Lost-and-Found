import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { matchingService, MEDIA_BASE_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Cpu,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldCheck,
  RotateCw,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

const MatchingResultsPage = () => {
  const [searchParams] = useSearchParams();
  const lostItemId = searchParams.get('lost_item');
  const foundItemId = searchParams.get('found_item');

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'high', 'medium'
  const [actionMessage, setActionMessage] = useState('');

  const fetchMatches = () => {
    setLoading(true);
    const params = {};
    if (lostItemId) params.lost_item = lostItemId;
    if (foundItemId) params.found_item = foundItemId;
    if (activeFilter !== 'all') params.confidence = activeFilter;

    matchingService.getMatches(params)
      .then((res) => {
        setMatches(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Fetch matches error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, [lostItemId, foundItemId, activeFilter]);

  const handleForceGenerate = async () => {
    setGenerating(true);
    setActionMessage('');
    try {
      const res = await matchingService.generateMatches({
        lost_item_id: lostItemId || null,
        found_item_id: foundItemId || null,
      });
      setActionMessage(res.data.message || 'AI matching completed successfully!');
      fetchMatches();
    } catch (err) {
      console.error('Generate error:', err);
      setActionMessage('Failed to trigger AI matching.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRespond = async (matchId, action) => {
    try {
      const res = await matchingService.respondToMatch(matchId, { action });
      setActionMessage(res.data.message);
      // Update local state
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? res.data.match : m))
      );
    } catch (err) {
      alert('Failed to update match status.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Cpu size={15} /> MULTIMODAL AI MATCHING ENGINE
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            AI Image Similarity & Match Results
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Compare uploaded lost and found item photographs using pretrained visual feature embeddings and weighted multi-factor scoring.
          </p>
        </div>

        <button
          onClick={handleForceGenerate}
          disabled={generating}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RotateCw size={16} className={generating ? 'spin-icon' : ''} />
          {generating ? 'Running CLIP Inference...' : 'Re-Evaluate AI Matches'}
        </button>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Confidence Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveFilter('all')}
          className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Matches ({matches.length})
        </button>
        <button
          onClick={() => setActiveFilter('high')}
          className={`btn btn-sm ${activeFilter === 'high' ? 'btn-primary' : 'btn-secondary'}`}
          style={activeFilter === 'high' ? { background: '#10b981', borderColor: '#10b981' } : {}}
        >
          High Similarity (&ge;75%)
        </button>
        <button
          onClick={() => setActiveFilter('medium')}
          className={`btn btn-sm ${activeFilter === 'medium' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Medium Similarity (50-74%)
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating visual feature vectors and cosine similarity..." />
      ) : matches.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {matches.map((match) => {
            const lostImg = match.lost_item.image?.startsWith('http')
              ? match.lost_item.image
              : `${MEDIA_BASE_URL}${match.lost_item.image}`;
            const foundImg = match.found_item.image?.startsWith('http')
              ? match.found_item.image
              : `${MEDIA_BASE_URL}${match.found_item.image}`;

            const isHigh = match.confidence_level === 'high';
            const isMedium = match.confidence_level === 'medium';

            return (
              <div
                key={`match-${match.id}`}
                className="card"
                style={{
                  padding: '2rem',
                  border: isHigh ? '2px solid #a7f3d0' : '1px solid #e2e8f0',
                  boxShadow: isHigh ? '0 10px 25px -5px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                }}
              >
                {/* Header score & status bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: isHigh ? '#059669' : isMedium ? '#2563eb' : '#64748b',
                        lineHeight: 1,
                      }}
                    >
                      {match.combined_score.toFixed(1)}%
                    </div>
                    <div>
                      <span
                        className="badge"
                        style={{
                          background: isHigh ? '#d1fae5' : isMedium ? '#eff6ff' : '#f1f5f9',
                          color: isHigh ? '#047857' : isMedium ? '#1d4ed8' : '#475569',
                          fontSize: '0.8rem',
                        }}
                      >
                        {match.confidence_display || `${match.confidence_level.toUpperCase()} SIMILARITY`}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Weighted Multi-Component AI Match
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-pending">
                      Status: {match.status_display || match.status}
                    </span>
                  </div>
                </div>

                {/* Side by side image comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '1.75rem' }}>
                  {/* Left: Lost Item */}
                  <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '14px', border: '1px solid #fecaca' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-lost">Reported Lost Item</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{match.lost_item.id}</span>
                    </div>

                    <div style={{ width: '100%', height: '220px', borderRadius: '10px', overflow: 'hidden', background: '#fff', marginBottom: '0.75rem' }}>
                      <img
                        src={lostImg}
                        alt={match.lost_item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                      {match.lost_item.title}
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {match.lost_item.description}
                    </p>
                    <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span><strong>Category:</strong> {match.lost_item.category_display}</span>
                      <span><strong>Colors:</strong> {match.lost_item.primary_color}</span>
                      <span><strong>Location:</strong> {match.lost_item.location_name}, {match.lost_item.city}</span>
                    </div>
                  </div>

                  {/* Right: Found Item */}
                  <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '14px', border: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-found">Discovered Found Item</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{match.found_item.id}</span>
                    </div>

                    <div style={{ width: '100%', height: '220px', borderRadius: '10px', overflow: 'hidden', background: '#fff', marginBottom: '0.75rem' }}>
                      <img
                        src={foundImg}
                        alt={match.found_item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                      {match.found_item.title}
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {match.found_item.description}
                    </p>
                    <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span><strong>Category:</strong> {match.found_item.category_display}</span>
                      <span><strong>Colors:</strong> {match.found_item.primary_color}</span>
                      <span><strong>Location:</strong> {match.found_item.found_location}, {match.found_item.city}</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                    Similarity Metrics Breakdown
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#64748b' }}>Image Visual (60%)</span>
                        <strong>{match.image_similarity.toFixed(1)}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${match.image_similarity}%`, height: '100%', background: '#3b82f6' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#64748b' }}>Category (15%)</span>
                        <strong>{match.category_similarity.toFixed(1)}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${match.category_similarity}%`, height: '100%', background: '#10b981' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#64748b' }}>Color (10%)</span>
                        <strong>{match.color_similarity.toFixed(1)}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${match.color_similarity}%`, height: '100%', background: '#f59e0b' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#64748b' }}>Keywords & Text (10%)</span>
                        <strong>{match.description_similarity.toFixed(1)}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${match.description_similarity}%`, height: '100%', background: '#8b5cf6' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#64748b' }}>Location Proximity (5%)</span>
                        <strong>{match.location_similarity.toFixed(1)}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${match.location_similarity}%`, height: '100%', background: '#06b6d4' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Ownership Claim Notice */}
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  * Important: An AI similarity score indicates visual resemblance but is not legal proof of ownership. Claim verification requires matching confidential item identifiers.
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRespond(match.id, 'confirm')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#047857' }}
                    >
                      <CheckCircle size={15} /> Confirm Potential Match
                    </button>
                    <button
                      onClick={() => handleRespond(match.id, 'dismiss')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#b91c1c' }}
                    >
                      <XCircle size={15} /> Dismiss
                    </button>
                  </div>

                  <Link
                    to={`/claims?claim_item=${match.found_item.id}&lost_item=${match.lost_item.id}`}
                    className="btn btn-primary"
                    style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ShieldCheck size={18} /> Initiate Ownership Claim
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Cpu size={46} color="#94a3b8" style={{ margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            No Matches Found Yet
          </h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Our AI engine compares photographs and metadata. Try running the matching evaluation or check your lost report details.
          </p>
          <button
            onClick={handleForceGenerate}
            disabled={generating}
            className="btn btn-primary"
          >
            <RotateCw size={15} /> Run Match Search Now
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchingResultsPage;
