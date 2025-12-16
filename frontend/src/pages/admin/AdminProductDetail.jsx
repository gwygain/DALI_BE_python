import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProduct(id);
        setProduct(response.product);
        setNewStock(response.product.product_quantity);
      } catch (err) {
        setError('Failed to load product');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const updatedProduct = await productService.updateStock(id, newStock);
      setProduct(updatedProduct);
      setSuccess('Stock updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return `₱${price.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="product-detail-container container">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="product-detail-container container">
        <div className="auth-error">{error}</div>
        <Link to="/admin/inventory" className="btn btn-primary">
          Back to Inventory
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container container">
        <p>Product not found.</p>
        <Link to="/admin/inventory" className="btn btn-primary">
          Back to Inventory
        </Link>
      </div>
    );
  }

  return (
    <main className="product-detail-container container">
      {/* Product Image */}
      <div className="product-detail-image">
        <img src={`/images/products/${product.image}`} alt={product.product_name} />
      </div>

      {/* Product Info */}
      <div className="product-detail-info">
        <Link
          to="/admin/inventory"
          style={{
            display: 'inline-block',
            marginBottom: '20px',
            color: '#555',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          ← Back to Inventory
        </Link>

        <h1>{product.product_name}</h1>
        <p className="product-detail-price">{formatPrice(product.product_price)}</p>

        {success && <div className="auth-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        {/* Stock Management */}
        <div className="product-actions">
          <div className="product-stock-level" style={{ marginBottom: '20px' }}>
            Current Stock: <strong>{product.product_quantity}</strong>
          </div>

          <form onSubmit={handleUpdateStock}>
            <div className="stock-update-group">
              <label htmlFor="newStock" style={{ fontWeight: 600, marginRight: '15px' }}>
                Set New Stock:
              </label>
              <input
                type="number"
                id="newStock"
                name="newStock"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                min="0"
                className="stock-update-input"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
                style={{ marginLeft: '15px' }}
              >
                {updating ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </form>
        </div>

        <div className="product-description" style={{ marginTop: '30px' }}>
          <h3>Product Details</h3>
          <p>
            <strong>Category:</strong> {product.product_category}
          </p>
          {product.product_subcategory && (
            <p>
              <strong>Subcategory:</strong> {product.product_subcategory}
            </p>
          )}
          <p>
            <strong>Description:</strong>{' '}
            {product.product_description || 'No description available.'}
          </p>
        </div>
      </div>
    </main>
  );
};

export default AdminProductDetail;
