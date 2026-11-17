import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusCircle, Search } from 'lucide-react';

const LostListingPage = () => {
  const [searchParams] = useSearchParams();
  const myReportsParam = searchParams.get('my_reports');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [color, setColor] = useState('');

  const fetchItems = () => {
    setLoading(true);
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (category) params.category = category;
    if (city) params.city = city;
    if (color) params.color = color;
    if (myReportsParam) params.my_reports = 'true';

    itemService.getLostItems(params)
      .then((res) => {
        setItems(res.data.results || res.data.items || res.data || []);
      })
      .catch((err) => console.error('Error fetching lost items:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [category, city, color, myReportsParam]);

  // Handle Enter key or debounce on searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
    setCategory('');
    setCity('');
    setColor('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            {myReportsParam ? 'My Lost Reports' : 'Lost Belongings Directory'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {myReportsParam
              ? 'Belongings you have reported lost.'
              : 'Browse items reported missing in your community.'}
          </p>
        </div>

        <Link to="/report-lost" className="btn btn-primary" style={{ background: '#ef4444' }}>
          <PlusCircle size={16} /> Report a Lost Item
        </Link>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
        city={city}
        setCity={setCity}
        color={color}
        setColor={setColor}
        onReset={handleReset}
      />

      {loading ? (
        <LoadingSpinner message="Searching lost items directory..." />
      ) : items.length > 0 ? (
        <div className="grid-cols-3">
          {items.map((item) => (
            <ItemCard key={`lost-${item.id}`} item={item} type="lost" />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Search size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            No Matching Lost Items Found
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            We couldn't find any lost items matching your current filters. Try resetting the filters or report a new lost item.
          </p>
          <button onClick={handleReset} className="btn btn-secondary" style={{ marginRight: '0.75rem' }}>
            Reset Filters
          </button>
          <Link to="/report-lost" className="btn btn-primary" style={{ background: '#ef4444' }}>
            <PlusCircle size={15} /> Report New Lost Item
          </Link>
        </div>
      )}
    </div>
  );
};

export default LostListingPage;
