import { Link, useParams } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1>Order Placed Successfully!</h1>
        <p className="order-id">Order #{orderId}</p>
        <p className="success-message">
          Thank you for your order. We've received your order and will begin processing it right away.
          You will receive an email confirmation shortly.
        </p>

        <div className="success-actions">
          <Link to={`/orders/${orderId}`} className="btn btn-primary">
            View Order Details
          </Link>
          <Link to="/shop" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
