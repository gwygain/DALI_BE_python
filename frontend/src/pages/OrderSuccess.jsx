import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'N/A';

  return (
    <div className="order-success-page">
      <div className="success-card">
        <img src="/images/order-success.png" alt="Order Successful" />
        <h2>Order Successfully Placed!</h2>
        <p>
          Thank you for your purchase. Your order ID is{' '}
          <strong>#{orderId}</strong>.
        </p>
        <div className="success-actions">
          <Link to="/shop" className="btn btn-secondary">
            Continue Shopping
          </Link>
          <Link to="/profile" className="btn btn-primary">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
