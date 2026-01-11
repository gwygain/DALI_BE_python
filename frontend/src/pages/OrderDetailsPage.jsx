import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './OrderDetailsPage.css';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [orderId, user, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelling(true);
    try {
      await ordersAPI.cancelOrder(orderId);
      fetchOrder();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COLLECTED':
        return 'success';
      case 'CANCELLED':
      case 'DELIVERY_FAILED':
        return 'error';
      case 'IN_TRANSIT':
        return 'info';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="error-state">
          <h2>Order not found</h2>
          <Link to="/account" className="btn btn-primary">Back to Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <Link to="/account" className="back-link">← Back to Orders</Link>

        <div className="order-header">
          <div>
            <h1>Order #{order.order_id}</h1>
            <p className="order-date">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <span className={`order-status ${getStatusColor(order.shipping_status)}`}>
            {order.shipping_status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="order-content">
          <div className="order-main">
            {/* Order Items */}
            <section className="order-section">
              <h2>Order Items</h2>
              <div className="order-items">
                {order.order_items?.map((item) => (
                  <div key={item.order_item_id} className="order-item">
                    <img 
                      src={item.product?.image || 'https://via.placeholder.com/80x80?text=Product'} 
                      alt={item.product?.product_name}
                    />
                    <div className="item-details">
                      <h4>{item.product?.product_name}</h4>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ₱{(parseFloat(item.product?.product_price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Timeline */}
            {order.order_history?.length > 0 && (
              <section className="order-section">
                <h2>Order Timeline</h2>
                <div className="order-timeline">
                  {order.order_history.map((history, index) => (
                    <div key={history.history_id} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <strong>{history.status.replace(/_/g, ' ')}</strong>
                        <p>{history.notes}</p>
                        <span className="timeline-date">
                          {new Date(history.event_timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="order-sidebar">
            {/* Delivery Info */}
            <section className="sidebar-section">
              <h3>Delivery Information</h3>
              <div className="info-group">
                <label>Method</label>
                <p>{order.delivery_method}</p>
              </div>
              {order.address && (
                <div className="info-group">
                  <label>Address</label>
                  <p>
                    {order.address.additional_info}<br />
                    {order.address.barangay?.barangay_name}, {order.address.city?.city_name}<br />
                    {order.address.province?.province_name}
                  </p>
                </div>
              )}
              {order.order_pickup && (
                <div className="info-group">
                  <label>Pickup Store</label>
                  <p>{order.order_pickup.store?.store_name}</p>
                </div>
              )}
            </section>

            {/* Payment Info */}
            <section className="sidebar-section">
              <h3>Payment Information</h3>
              <div className="info-group">
                <label>Method</label>
                <p>{order.payment_method}</p>
              </div>
              <div className="info-group">
                <label>Status</label>
                <p className={`payment-status ${order.payment_status.toLowerCase()}`}>
                  {order.payment_status}
                </p>
              </div>
            </section>

            {/* Order Summary */}
            <section className="sidebar-section">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₱{(parseFloat(order.total_price) - 50 + parseFloat(order.voucher_discount || 0)).toFixed(2)}</span>
              </div>
              {order.voucher_code && order.voucher_discount > 0 && (
                <div className="summary-row voucher-discount-row">
                  <div className="voucher-summary-info">
                    <span className="voucher-code-chip">{order.voucher_code}</span>
                    <span className="voucher-label">Voucher Applied</span>
                  </div>
                  <span className="voucher-discount-amount">-₱{parseFloat(order.voucher_discount).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>₱50.00</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₱{parseFloat(order.total_price).toFixed(2)}</span>
              </div>
            </section>

            {/* Voucher Information Section */}
            {order.voucher_code && order.voucher_discount > 0 && (
              <section className="sidebar-section voucher-info-section">
                <h3>💳 Voucher Applied</h3>
                <div className="voucher-info-card">
                  <div className="voucher-code-display">
                    <span className="voucher-code-label">Code:</span>
                    <span className="voucher-code-value">{order.voucher_code}</span>
                  </div>
                  <div className="voucher-savings">
                    <span className="savings-label">You saved:</span>
                    <span className="savings-amount">₱{parseFloat(order.voucher_discount).toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Actions */}
            {order.shipping_status === 'PROCESSING' && (
              <button 
                className="btn btn-outline btn-full cancel-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
