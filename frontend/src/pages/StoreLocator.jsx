import { useState, useEffect } from 'react';
import { storesAPI } from '../api/api';
import './StoreLocator.css';

const StoreLocator = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (search = '') => {
    setLoading(true);
    try {
      const response = await storesAPI.getStores(search || undefined);
      setStores(response.data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(searchQuery);
  };

  const handleStoreClick = (store) => {
    setSelectedStore(store);
  };

  return (
    <div className="store-locator-page">
      <div className="store-locator-container">
        <div className="store-list-section">
          <h1>Find a DALI Store</h1>
          
          <form className="store-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <div className="store-list-header">
            <span>{stores.length} Stores near you</span>
            <button className="filter-btn">
              Filter
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading stores...</div>
          ) : (
            <div className="store-list">
              {stores.map((store) => (
                <div 
                  key={store.store_id} 
                  className={`store-item ${selectedStore?.store_id === store.store_id ? 'selected' : ''}`}
                  onClick={() => handleStoreClick(store)}
                >
                  <h3>DALI Everyday Grocery – {store.store_name}</h3>
                  <p className="store-address">Location details here</p>
                  <div className="store-status">
                    <span className="status-open">Open</span>
                    <span className="status-hours">• Closes at 10:00PM</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="view-all-btn">View all stores</button>
        </div>

        <div className="store-map-section">
          <div className="map-placeholder">
            {/* In production, integrate with Google Maps or similar */}
            <div className="map-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a1127c" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <p>Map will be displayed here</p>
              <p className="map-note">Integrate with Google Maps API</p>
            </div>
          </div>

          {selectedStore && (
            <div className="store-info-popup">
              <h3>DALI Everyday Grocery – {selectedStore.store_name}</h3>
              <p className="popup-address">Store Address Here</p>
              <p className="popup-distance">1.5km</p>
              <div className="popup-hours">
                <span className="status-open">Open</span>
                <span>| 9am – 10pm</span>
              </div>
              <button className="btn btn-primary">Shop now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
