import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusCircle, Search } from 'lucide-react';

const FoundListingPage = () => {
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

    itemService.getFoundItems(params)
      .then((res) => {
        setItems(res.data.results || res.data.items || res.data || []);
      })
      .catch((err) => console.error('Error fetching found items:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [category, city, color, myReportsParam]);

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
            {myReportsParam ? 'Items I Reported Found' : 'Found Belongings Directory'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {myReportsParam
              ? 'Found items you are currently safe-keeping or reported.'
              : 'Items recovered in the community. If you recognize your belonging, submit an ownership claim.'}
          </p>
        </div>

        <Link to="/report-found" className="btn btn-primary" style={{ background: '#10b981' }}>
          <PlusCircle size={16} /> Report a Found Item
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
        <LoadingSpinner message="Searching found items repository..." />
      ) : items.length > 0 ? (
        <div className="grid-cols-3">
          {items.map((item) => (
            <ItemCard key={`found-${item.id}`} item={item} type="found" />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Search size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            No Matching Found Items
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            No found items matched your search filters. Try clearing filters or check back later as new items are added daily.
          </p>
          <button onClick={handleReset} className="btn btn-secondary" style={{ marginRight: '0.75rem' }}>
            Reset Filters
          </button>
          <Link to="/report-found" className="btn btn-primary" style={{ background: '#10b981' }}>
            <PlusCircle size={15} /> Report Found Item
          </Link>
        </div>
      )}
    </div>
  );
};

export default FoundListingPage;
