import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
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
  { value: 'other', label: 'Other Items' },
];

const FilterBar = ({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  city,
  setCity,
  color,
  setColor,
  onReset,
}) => {
  return (
    <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
        {/* Search Input */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={14} /> Search Keywords
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Item name, brand, sticker, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} /> Category
          </label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="form-label">City / Location</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Hyderabad, Bengaluru..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Color Filter */}
        <div>
          <label className="form-label">Color</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Black, Grey, Brown..."
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        {/* Reset Filter Button */}
        <div>
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={15} /> Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
