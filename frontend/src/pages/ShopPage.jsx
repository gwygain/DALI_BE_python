import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../api/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import './ShopPage.css';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popular');
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        try {
          const response = await productsAPI.getSubcategories(selectedCategory);
          setSubcategories(response.data.subcategories || []);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      } else {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubcategories.length > 0) params.subcategory = selectedSubcategories[0];
        if (searchParams.get('search')) params.search = searchParams.get('search');

        const response = await productsAPI.getProducts(params);
        let productList = response.data || [];

        // Apply price filter
        if (priceRange.min || priceRange.max) {
          productList = productList.filter(p => {
            const price = parseFloat(p.product_price);
            if (priceRange.min && price < parseFloat(priceRange.min)) return false;
            if (priceRange.max && price > parseFloat(priceRange.max)) return false;
            return true;
          });
        }

        // Sort products
        if (sortBy === 'price-low') {
          productList.sort((a, b) => parseFloat(a.product_price) - parseFloat(b.product_price));
        } else if (sortBy === 'price-high') {
          productList.sort((a, b) => parseFloat(b.product_price) - parseFloat(a.product_price));
        } else if (sortBy === 'name') {
          productList.sort((a, b) => a.product_name.localeCompare(b.product_name));
        }

        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedSubcategories, searchParams, priceRange, sortBy]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategories([]);
    setSearchParams(category ? { category } : {});
  };

  const handleSubcategoryToggle = (subcategory) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(s => s !== subcategory);
      }
      return [...prev, subcategory];
    });
  };

  const handleAddToCart = async (productId, productName) => {
    setAddingToCart(productId);
    try {
      const result = await addToCart(productId, 1);
      if (result.success) {
        showToast(`${productName} added to cart!`, 'success');
      } else {
        showToast(result.error || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategories([]);
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <Link to="/" className="back-link">← Back</Link>
        <div className="shop-header-content">
          {selectedCategory ? (
            <>
              <h1>Shop {selectedCategory}</h1>
              <p>Browse our selection of {selectedCategory.toLowerCase()} products.</p>
            </>
          ) : (
            <>
              <h1>DALI Online</h1>
              <p>The same hard-to-beat prices you love, now just a click away. Shop smart and save big on your everyday groceries with DALI Online</p>
            </>
          )}
        </div>
      </div>

      {!selectedCategory ? (
        // Category Selection View
        <div className="categories-view">
          <h2>Popular Categories</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <div 
                key={category} 
                className="category-card"
                onClick={() => handleCategorySelect(category)}
              >
                <img 
                  src={`https://via.placeholder.com/200x150?text=${encodeURIComponent(category)}`} 
                  alt={category}
                  className="category-image"
                />
                <h4>{category}</h4>
                <button className="btn btn-primary btn-small">Shop now</button>
              </div>
            ))}
          </div>
          <button className="btn btn-outline load-more">
            Load more categories
          </button>
        </div>
      ) : (
        // Products View
        <div className="shop-content">
          <aside className="shop-filters">
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="clear-filters" onClick={clearFilters}>Clear All</button>
            </div>

            {subcategories.length > 0 && (
              <div className="filter-section">
                <h4>Subcategories</h4>
                {subcategories.map((sub) => (
                  <label key={sub} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.includes(sub)}
                      onChange={() => handleSubcategoryToggle(sub)}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            )}

            <div className="filter-section">
              <h4>Price</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
            </div>
          </aside>

          <main className="shop-products">
            <div className="products-header">
              <div className="sort-select">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <span className="product-count">Showing {products.length} products</span>
            </div>

            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.product_id} className="product-card">
                    <img
                      src={product.image ? `/images/products/${product.image}` : `/images/products/default.png`}
                      alt={product.product_name}
                      className="product-image"
                    />
                    <h4 className="product-name">{product.product_name}</h4>
                    <p className="product-price">₱ {parseFloat(product.product_price).toFixed(0)}</p>
                    <button
                      className={`btn btn-primary btn-small ${product.product_quantity <= 0 ? 'out-of-stock' : ''}`}
                      onClick={() => handleAddToCart(product.product_id, product.product_name)}
                      disabled={product.product_quantity <= 0 || addingToCart === product.product_id}
                    >
                      {product.product_quantity <= 0 
                        ? 'Out of Stock' 
                        : addingToCart === product.product_id 
                          ? 'Adding...' 
                          : 'Add to Cart'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {products.length > 0 && (
              <button className="btn btn-primary load-more-products">
                Load more products
              </button>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
