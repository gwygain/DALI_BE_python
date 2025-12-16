import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './CartPage.css';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      const result = await clearCart();
      if (result.success) {
        showToast('Cart cleared successfully', 'success');
      } else {
        showToast(result.error || 'Failed to clear cart', 'error');
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <Link to="/shop" className="back-link">← Continue Shopping</Link>
        
        <h1>Your Cart</h1>

        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items yet.</p>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <div className="cart-header">
                <span className="header-product">Product</span>
                <span className="header-price">Price</span>
                <span className="header-quantity">Quantity</span>
                <span className="header-subtotal">Subtotal</span>
                <span className="header-actions"></span>
              </div>

              {cart.items.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div className="item-product">
                    <img 
                      src={item.image ? `/images/products/${item.image}` : `/images/products/default.png`} 
                      alt={item.product_name}
                    />
                    <span>{item.product_name}</span>
                  </div>
                  <div className="item-price">₱{item.product_price.toFixed(2)}</div>
                  <div className="item-quantity">
                    <button 
                      onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <div className="item-subtotal">₱{item.subtotal.toFixed(2)}</div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(item.product_id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₱{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₱{cart.total.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleClearCart} 
                style={{ marginTop: '40px', padding: '8px 16px', fontSize: '13px' }}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
