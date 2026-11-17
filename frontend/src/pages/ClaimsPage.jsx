import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimService, itemService, MEDIA_BASE_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  User,
  Eye,
  Lock,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

const ClaimsPage = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const claimItemId = searchParams.get('claim_item');
  const lostItemId = searchParams.get('lost_item');

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('submitted'); // 'submitted', 'received', 'all'
  const [statusMessage, setStatusMessage] = useState('');

  // Submit Claim Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [foundItemToClaim, setFoundItemToClaim] = useState(null);
  const [claimForm, setClaimForm] = useState({
    unique_identifying_features: '',
    serial_number: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchClaims = () => {
    setLoading(true);
    const params = {};
    if (tab === 'received') params.as_finder = 'true';

    claimService.getClaims(params)
      .then((res) => {
        setClaims(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Fetch claims error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, [tab]);

  // If claim_item is in URL, fetch item and open modal automatically
  useEffect(() => {
    if (claimItemId) {
      itemService.getFoundItem(claimItemId)
        .then((res) => {
          setFoundItemToClaim(res.data);
          setModalOpen(true);
        })
        .catch(() => {});
    }
  }, [claimItemId]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!claimForm.unique_identifying_features.trim()) {
      setFormError('Please describe unique identifying features to verify ownership.');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('found_item', foundItemToClaim.id);
    if (lostItemId) data.append('lost_item', lostItemId);
    data.append('unique_identifying_features', claimForm.unique_identifying_features);
    if (claimForm.serial_number) data.append('serial_number', claimForm.serial_number);
    if (proofFile) data.append('proof_of_ownership', proofFile);

    try {
      await claimService.createClaim(data);
      setStatusMessage('Ownership claim submitted successfully! The finder will review your details.');
      setModalOpen(false);
      setClaimForm({ unique_identifying_features: '', serial_number: '' });
      setProofFile(null);
      fetchClaims();
    } catch (err) {
      console.error('Submit claim error:', err);
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit claim.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setUpdatingStatus(true);

    try {
      await claimService.updateClaimStatus(selectedClaim.id, {
        status: reviewStatus,
        admin_notes: adminNotes,
      });
      setStatusMessage(`Claim #${selectedClaim.id} updated to ${reviewStatus}.`);
      setReviewModalOpen(false);
      setSelectedClaim(null);
      setAdminNotes('');
      fetchClaims();
    } catch (err) {
      alert('Failed to update claim status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openReviewModal = (claim) => {
    setSelectedClaim(claim);
    setReviewStatus('approved');
    setAdminNotes(claim.admin_notes || '');
    setReviewModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', color: '#047857', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldCheck size={15} /> CONFIDENTIAL OWNERSHIP VERIFICATION
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Ownership Claims & Verification
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage and verify ownership claims securely with protected serial numbers and proof verification.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setTab('submitted')}
          className={`btn btn-sm ${tab === 'submitted' ? 'btn-primary' : 'btn-secondary'}`}
        >
          My Submitted Claims
        </button>
        <button
          onClick={() => setTab('received')}
          className={`btn btn-sm ${tab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Claims on My Found Items
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('all')}
            className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={tab === 'all' ? { background: '#dc2626', borderColor: '#dc2626' } : {}}
          >
            All System Claims (Admin)
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading ownership claims..." />
      ) : claims.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {claims.map((claim) => {
            const isClaimant = user?.id === claim.claimant.id;
            const isFinder = user?.id === claim.found_item.finder.id;
            const canReview = isFinder || isAdmin;

            const isApproved = claim.status === 'approved';
            const isRejected = claim.status === 'rejected';
            const isPending = claim.status === 'pending';

            return (
              <div
                key={`claim-${claim.id}`}
                className="card"
                style={{
                  padding: '1.75rem',
                  borderLeft: isApproved ? '5px solid #10b981' : isRejected ? '5px solid #ef4444' : '5px solid #f59e0b',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#1e293b' }}>
                        Claim #{claim.id}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: isApproved ? '#d1fae5' : isRejected ? '#fee2e2' : '#fef3c7',
                          color: isApproved ? '#047857' : isRejected ? '#b91c1c' : '#92400e',
                        }}
                      >
                        {claim.status_display || claim.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Claim for: {claim.found_item.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Claimant: <strong>{claim.claimant.username}</strong> &bull; Found by: <strong>{claim.found_item.finder.username}</strong>
                    </div>
                  </div>

                  {canReview && !isApproved && (
                    <button
                      onClick={() => openReviewModal(claim)}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FileCheck size={15} /> Review & Decide
                    </button>
                  )}
                </div>

                {/* Confidential Verification Details Card */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    <Lock size={14} /> CONFIDENTIAL VERIFICATION PROOF
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Unique Marks / Features:</div>
                    <div style={{ fontSize: '0.92rem', color: '#1e293b', marginTop: '0.2rem' }}>
                      {claim.unique_identifying_features}
                    </div>
                  </div>

                  {claim.serial_number && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Serial Number / IMEI:</div>
                      <div style={{ fontSize: '0.92rem', color: '#1e293b', fontFamily: 'monospace', fontWeight: 700 }}>
                        {claim.serial_number}
                      </div>
                    </div>
                  )}

                  {claim.proof_of_ownership && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>Proof Document:</div>
                      <a
                        href={claim.proof_of_ownership.startsWith('http') ? claim.proof_of_ownership : `${MEDIA_BASE_URL}${claim.proof_of_ownership}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <Eye size={13} /> View Uploaded Proof File
                      </a>
                    </div>
                  )}
                </div>

                {/* Decision Notes Trail */}
                {claim.admin_notes && (
                  <div style={{ background: isApproved ? '#ecfdf5' : '#fef2f2', padding: '1rem 1.25rem', borderRadius: '10px', fontSize: '0.88rem', color: isApproved ? '#065f46' : '#991b1b', marginBottom: '0.5rem' }}>
                    <strong>Decision Notes / Handover Instructions:</strong> {claim.admin_notes}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                  <span>Submitted on {new Date(claim.created_at).toLocaleDateString()}</span>
                  <Link to={`/items/found/${claim.found_item.id}`} style={{ fontWeight: 600 }}>
                    Inspect Item Page &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <ShieldCheck size={42} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
            No Claims Found
          </h3>
          <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto' }}>
            {tab === 'submitted'
              ? "You haven't submitted ownership claims on any found belongings yet."
              : 'No users have submitted claims on items you found.'}
          </p>
        </div>
      )}

      {/* MODAL 1: Submit Claim Form Modal */}
      {modalOpen && foundItemToClaim && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Verify Ownership of Item
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Claiming: <strong>{foundItemToClaim.title}</strong>
            </p>

            {formError && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleClaimSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Private Identifying Features *
                </label>
                <textarea
                  required
                  className="form-control"
                  rows={4}
                  placeholder="Describe unique features not visible in public photos: scratches, inner compartment contents, wallpaper image, lock code type, engraving, stickers..."
                  value={claimForm.unique_identifying_features}
                  onChange={(e) => setClaimForm({ ...claimForm, unique_identifying_features: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number / IMEI (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. C02G45ABCDEF or IMEI"
                  value={claimForm.serial_number}
                  onChange={(e) => setClaimForm({ ...claimForm, serial_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proof of Purchase / Old Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setProofFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#10b981' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Review & Decide Modal */}
      {reviewModalOpen && selectedClaim && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Review Ownership Claim #{selectedClaim.id}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Submitted by <strong>{selectedClaim.claimant.username}</strong> for <strong>{selectedClaim.found_item.title}</strong>
            </p>

            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">Review Decision *</label>
                <select
                  className="form-control"
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                >
                  <option value="approved">Approve Claim (Verified Owner)</option>
                  <option value="rejected">Reject Claim (Information Did Not Match)</option>
                  <option value="under_review">Mark Under Further Review</option>
                  <option value="resolved">Mark Resolved & Handed Over</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Handover Instructions / Reason Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Provide handover instructions (e.g. Meet at Campus Security Office) or rejection reason."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {updatingStatus ? 'Recording...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
