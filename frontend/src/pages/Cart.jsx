import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import cartService from '../services/cartService';
import './Cart.css';

const Cart = () => {
  const { cartItems, subtotal, loading, updateQuantity, removeFromCart, clearCart, voucherCode, voucherDiscount, fetchCart, clearVoucher } = useCart();
  const { showToast } = useToast();
  const [voucherInput, setVoucherInput] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return '—';
    const n = Number(price);
    if (Number.isNaN(n)) return String(price);
    return `₱${n.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
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

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;

    setApplyingVoucher(true);
    try {
      const response = await cartService.applyVoucher(voucherInput.toUpperCase());
      showToast(`Voucher applied! You save ₱${response.discount_amount.toFixed(2)}`, 'success');
      setVoucherInput('');
      await fetchCart();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to apply voucher';
      showToast(errorMessage, 'error');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    try {
      await cartService.removeVoucher();
      clearVoucher(); // Force clear voucher data in context
      showToast('Voucher removed', 'success');
      await fetchCart();
    } catch (error) {
      showToast('Failed to remove voucher', 'error');
    }
  };

  if (loading) {
    return (
      <main className="cart-page container">
        <h1>Your Cart</h1>
        <p>Loading cart...</p>
      </main>
    );
  }

  return (
    <main className="cart-page container">
      <h1>Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="cart-container">
          <div className="cart-items-panel">
            <div className="cart-item-header">
              <div className="header-product">Product</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total">Total</div>
              <div className="header-action"></div>
            </div>

            {cartItems.map((item) => {
              const isSaleActive = item.is_on_sale && item.product_discount_price;
              const currentPrice = isSaleActive ? item.product_discount_price : item.product_price;

              return (
                <div key={item.product_id} className="cart-item-row">
                  <div className="cart-product-info">
                    <img
                      src={item.image ? `/images/products/${item.image}` : `/images/products/default.png`}
                      alt={item.product_name}
                    />
                    <div>
                      <p className="product-name">{item.product_name}</p>
                      
                      <div className="cart-item-price-display">
                        {isSaleActive ? (
                          <>
                            <span className="product-price sale-price">{formatPrice(currentPrice)}</span>
                            <span className="original-price-strikethrough small">{formatPrice(item.product_price)}</span>
                            <span className="cart-sale-tag">Sale</span>
                          </>
                        ) : (
                          <p className="product-price">{formatPrice(item.product_price)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="cart-quantity-selector">
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      min="1"
                      onChange={(e) =>
                        handleQuantityChange(item.product_id, parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="cart-item-total">
                    {formatPrice(item.subtotal)}
                  </div>

                  <div className="cart-item-remove">
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemove(item.product_id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-panel">
            <h2>Order Summary</h2>
            <hr />
            <div className="summary-row">
              <span>Subtotal</span>
              {/* This correctly uses the pre-calculated subtotal from your CartContext */}
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {voucherCode && (
              <div className="summary-row voucher-discount">
                <span>Voucher ({voucherCode})</span>
                <span className="discount-amount">-₱{voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <hr />
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatPrice(subtotal - (voucherDiscount || 0))}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary checkout-btn">
              Continue to checkout
            </Link>
            <button 
              className="btn btn-outline clear-cart-btn" 
              onClick={handleClearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      ) : (
        <div className="cart-empty">
          <h2>Your cart is empty.</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      )}
    </main>
  );
};

export default Cart;
