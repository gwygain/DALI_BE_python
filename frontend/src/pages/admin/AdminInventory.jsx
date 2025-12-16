import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../../services';

const AdminInventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.searchProducts(query, selectedCategory);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  }, [query, selectedCategory, setSearchParams]);

  const formatPrice = (price) => {
    return `₱${price.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="shop-container container">
      {/* Filter Sidebar */}
      <aside className="filter-sidebar">
        <h4>Filters</h4>
        <div className="filter-group">
          <h5>CATEGORY</h5>
          <ul>
            <li>
              <input
                type="radio"
                name="category"
                value=""
                id="cat-all"
                checked={selectedCategory === ''}
                onChange={() => setSelectedCategory('')}
              />
              <label htmlFor="cat-all">All</label>
            </li>
            {categories.map((cat, index) => (
              <li key={cat}>
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  id={`cat-${index}`}
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                />
                <label htmlFor={`cat-${index}`}>{cat}</label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="product-grid-container">
        <section className="search-banner admin-inventory-banner">
          <div className="banner-flash-wrapper">
            {successMessage && <div className="auth-success">{successMessage}</div>}
            {errorMessage && <div className="auth-error">{errorMessage}</div>}
          </div>

          <input
            type="search"
            id="search-input"
            name="query"
            className="main-search-input"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </section>

        {/* Product Grid Results */}
        <div id="product-grid-results">
          {loading ? (
            <p style={{ padding: '20px' }}>Loading products...</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.product_id} className="product-card">
                  <Link
                    className="product-card-body"
                    to={`/admin/inventory/${product.product_id}`}
                  >
                    <div className="product-image-container">
                      <img
                        src={`/images/products/${product.image}`}
                        alt={product.product_name}
                      />
                    </div>
                    <div className="product-card-info">
                      <p className="product-card-category">{product.product_category}</p>
                      <h3 className="product-card-name">{product.product_name}</h3>
                      <p className="product-price">{formatPrice(product.product_price)}</p>
                    </div>
                  </Link>
                  <div className="product-card-actions">
                    <div className="product-stock-level">
                      Stock: {product.product_quantity}
                    </div>
                    <Link
                      to={`/admin/inventory/${product.product_id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      Manage Stock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminInventory;
