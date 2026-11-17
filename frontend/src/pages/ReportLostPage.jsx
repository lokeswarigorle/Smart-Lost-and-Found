import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../services/api';
import { PlusCircle, Upload, MapPin, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'phones', label: 'Mobile Phones' },
  { value: 'laptops', label: 'Laptops & Tablets' },
  { value: 'documents', label: 'Documents & ID Cards' },
  { value: 'wallets', label: 'Wallets & Purses' },
  { value: 'keys', label: 'Keys & Keychains' },
  { value: 'bags', label: 'Bags & Luggage' },
  { value: 'jewelry', label: 'Jewelry & Watches' },
  { value: 'clothing', label: 'Clothing & Accessories' },
  { value: 'pets', label: 'Pets & Animals' },
  { value: 'other', label: 'Other Miscellaneous' },
];

const ReportLostPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'electronics',
    description: '',
    primary_color: '',
    secondary_color: '',
    date_lost: new Date().toISOString().split('T')[0],
    location_name: '',
    city: '',
    area: '',
    latitude: '',
    longitude: '',
    contact_preference: 'in_app',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size cannot exceed 10MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeoLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Could not retrieve current location. Please enter coordinates or city manually.');
        setGeoLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please upload a clear photograph of your lost item for AI matching.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== '' && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });
    data.append('image', imageFile);

    try {
      const res = await itemService.createLostItem(data);
      const createdItem = res.data;
      navigate(`/matches?lost_item=${createdItem.id}`, { replace: true });
    } catch (err) {
      console.error('Submission error:', err);
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0];
        setError(`${firstKey}: ${errData[firstKey]}`);
      } else {
        setError('Failed to submit report. Please review your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '1rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', background: '#fee2e2', color: '#b91c1c', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            REPORT MISSING BELONGING
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Report a Lost Item
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Provide accurate visual and location details. Uploaded photos will be processed by our pretrained CLIP matching engine to search against found items automatically.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Item Basic Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              1. Item Information
            </h3>

            <div className="form-group">
              <label className="form-label">Item Title *</label>
              <input
                type="text"
                name="title"
                required
                className="form-control"
                placeholder="e.g. Space Grey Apple MacBook Pro 14-inch"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date Lost *</label>
                <input
                  type="date"
                  name="date_lost"
                  required
                  className="form-control"
                  value={formData.date_lost}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Primary Color *</label>
                <input
                  type="text"
                  name="primary_color"
                  required
                  className="form-control"
                  placeholder="e.g. Black, Grey, Brown"
                  value={formData.primary_color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Secondary / Accent Color</label>
                <input
                  type="text"
                  name="secondary_color"
                  className="form-control"
                  placeholder="e.g. Silver, White"
                  value={formData.secondary_color}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                name="description"
                required
                className="form-control"
                placeholder="Provide physical description, brand, stickers, unique signs, cover case color, etc."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Section 2: Location Information */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
                2. Location Information
              </h3>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={geoLocating}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Navigation size={14} />
                {geoLocating ? 'Detecting GPS...' : 'Use My Current Location'}
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Specific Location / Landmark *</label>
              <input
                type="text"
                name="location_name"
                required
                className="form-control"
                placeholder="e.g. Hitech City Metro Station 2nd Floor, or Central Park bench"
                value={formData.location_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  className="form-control"
                  placeholder="e.g. Hyderabad"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Area / Locality</label>
                <input
                  type="text"
                  name="area"
                  className="form-control"
                  placeholder="e.g. Madhapur"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Latitude (Optional)</label>
                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  className="form-control"
                  placeholder="17.4435"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude (Optional)</label>
                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  className="form-control"
                  placeholder="78.3772"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Photograph & Contact */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              3. Item Photograph & Contact Preference
            </h3>

            <div className="form-group">
              <label className="form-label">Item Photograph * (Used for CLIP AI Similarity)</label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
                    />
                    <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                      Photograph selected. Click to replace.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ fontWeight: 600, color: '#334155' }}>
                      Click or drag image file here to upload
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Contact Method</label>
              <select
                name="contact_preference"
                className="form-control"
                value={formData.contact_preference}
                onChange={handleChange}
              >
                <option value="in_app">In-App Secure Messaging (Recommended)</option>
                <option value="email">Email Notification</option>
                <option value="phone">Phone Call / WhatsApp</option>
                <option value="any">Any Contact Method</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', background: '#ef4444' }}
          >
            {loading ? 'Processing Visual Embeddings...' : 'Submit Lost Report & Run AI Match'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportLostPage;
