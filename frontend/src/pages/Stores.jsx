import { useState, useEffect } from 'react';
import { storeService } from '../services';
import { StoreMap } from '../components';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const data = await storeService.getStores();
        setStores(data);
        setFilteredStores(data);
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  // Search stores
  useEffect(() => {
    if (!query.trim()) {
      setFilteredStores(stores);
      return;
    }

    const searchStores = async () => {
      try {
        const data = await storeService.getStores(query);
        setFilteredStores(data);
      } catch (error) {
        console.error('Error searching stores:', error);
      }
    };

    const timeoutId = setTimeout(searchStores, 200);
    return () => clearTimeout(timeoutId);
  }, [query, stores]);

  const handleStoreClick = (store) => {
    setSelectedStore(store);
  };

  return (
    <main className="store-finder-container">
      <div className="store-list-panel">
        <h1>Find a DALI Store</h1>
        <div className="search-bar">
          <input
            type="search"
            name="query"
            placeholder="Search store name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div id="store-list-container">
          {loading ? (
            <p>Loading stores...</p>
          ) : (
            <>
              <p className="store-count">{filteredStores.length} stores found</p>
              {filteredStores.map((store) => (
                <div
                  key={store.store_id}
                  className="store-item"
                  onClick={() => handleStoreClick(store)}
                  style={{
                    backgroundColor:
                      selectedStore?.store_id === store.store_id ? '#f8f9fa' : 'transparent',
                    paddingLeft: selectedStore?.store_id === store.store_id ? '10px' : '0',
                    borderLeft:
                      selectedStore?.store_id === store.store_id
                        ? '4px solid #b21984'
                        : 'none',
                  }}
                >
                  <h3>{store.store_name}</h3>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div id="stores-map" className="map-panel">
        <StoreMap
          stores={filteredStores}
          selectedStore={selectedStore}
          onStoreSelect={handleStoreClick}
        />
      </div>
    </main>
  );
};

export default Stores;
