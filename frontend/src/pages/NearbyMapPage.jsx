import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService, MEDIA_BASE_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Navigation, Filter, Tag, Calendar, ArrowRight } from 'lucide-react';

// Fix for default Leaflet marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;

const lostMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const foundMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component to center map smoothly
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const NearbyMapPage = () => {
  const [center, setCenter] = useState([17.4435, 78.3772]); // Default Hyderabad
  const [radius, setRadius] = useState(25); // km
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'lost', 'found'
  const [cityFilter, setCityFilter] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const fetchNearby = (lat = center[0], lon = center[1], r = radius, type = typeFilter) => {
    setLoading(true);
    const params = {
      lat,
      lon,
      radius: r,
      type,
    };
    if (cityFilter) params.city = cityFilter;

    locationService.getNearbyItems(params)
      .then((res) => {
        setItems(res.data.items || []);
      })
      .catch((err) => console.error('Fetch nearby error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNearby(center[0], center[1], radius, typeFilter);
  }, [radius, typeFilter]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = [pos.coords.latitude, pos.coords.longitude];
        setCenter(newCoords);
        fetchNearby(newCoords[0], newCoords[1], radius, typeFilter);
        setLocating(false);
      },
      (err) => {
        alert('Could not retrieve current location.');
        setLocating(false);
      }
    );
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    fetchNearby(center[0], center[1], radius, typeFilter);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', color: '#047857', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <MapPin size={15} /> GEOLOCATION & MAP DISCOVERY
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Interactive Lost & Found Map
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Locate lost and found reports nearby using OpenStreetMap markers and Haversine distance calculations.
          </p>
        </div>

        <button
          onClick={handleUseLocation}
          disabled={locating}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Navigation size={16} /> {locating ? 'Detecting Location...' : 'Center on My GPS Location'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Item Type Filter</label>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Items (Lost & Found)</option>
              <option value="lost">Lost Belongings Only</option>
              <option value="found">Found Items Only</option>
            </select>
          </div>

          <div>
            <label className="form-label">Search Radius: {radius} km</label>
            <input
              type="range"
              min="2"
              max="100"
              step="1"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>

          <div>
            <label className="form-label">Filter by City</label>
            <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Hyderabad"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Apply
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
              <strong>Lost Item</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
              <strong>Found Item</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ height: '560px', width: '100%', position: 'relative' }}>
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeMapView center={center} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {items.map((item) => {
              if (!item.latitude || !item.longitude) return null;
              const isLost = item.type === 'lost';
              const icon = isLost ? lostMarkerIcon : foundMarkerIcon;
              const fullImg = item.image_url?.startsWith('http')
                ? item.image_url
                : `${MEDIA_BASE_URL}${item.image_url}`;

              return (
                <Marker
                  key={`marker-${item.type}-${item.id}`}
                  position={[item.latitude, item.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <div style={{ maxWidth: '240px', padding: '0.2rem' }}>
                      {item.image_url && (
                        <div style={{ height: '120px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem', background: '#f1f5f9' }}>
                          <img
                            src={fullImg}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: isLost ? '#fee2e2' : '#d1fae5',
                          color: isLost ? '#b91c1c' : '#047857',
                          marginBottom: '0.35rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isLost ? 'Lost Item' : 'Found Item'}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#0f172a' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                        {item.location_name}, {item.city}
                      </p>
                      {item.distance_km !== null && (
                        <p style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, margin: '0 0 0.6rem' }}>
                          Distance: ~{item.distance_km} km away
                        </p>
                      )}
                      <Link
                        to={`/items/${item.type}/${item.id}`}
                        style={{
                          display: 'inline-block',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#fff',
                          background: '#3b82f6',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        Inspect Details &rarr;
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Results List under map */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Nearby Reports Found ({items.length})
        </h3>

        {items.length > 0 ? (
          <div className="grid-cols-3">
            {items.map((item) => {
              const fullImg = item.image_url?.startsWith('http')
                ? item.image_url
                : `${MEDIA_BASE_URL}${item.image_url}`;
              const isLost = item.type === 'lost';

              return (
                <div key={`list-${item.type}-${item.id}`} className="card card-hover" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                      <img
                        src={fullImg}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.7rem' }}>
                        {isLost ? 'Lost' : 'Found'}
                      </span>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0.35rem 0 0.25rem', color: '#1e293b' }}>
                        {item.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {item.city} {item.distance_km !== null ? `(${item.distance_km} km)` : ''}
                      </div>
                      <Link to={`/items/${item.type}/${item.id}`} style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: '0.4rem', display: 'inline-block' }}>
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            No items found within {radius} km. Try increasing the search radius.
          </p>
        )}
      </div>
    </div>
  );
};

export default NearbyMapPage;
