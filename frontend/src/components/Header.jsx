import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  
  // State to track if we are in the "confirmation" phase
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false); // Reset state after logging out
  };

  const cancelLogout = () => {
    setShowConfirm(false); // Go back to showing the "Logout" button
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/images/dali-logo.png" alt="DALI Logo" />
          </Link>
        </div>
        
        <nav className="nav">
          <Link to="/shop">Shop</Link>
          <Link to="/stores">Stores</Link>
        </nav>

        <div className="header-actions">
          <Link to="/cart">Cart ({cartCount})</Link>

          {!isAuthenticated ? (
            <Link to="/login">Login</Link>
          ) : (
            <>
              <Link to="/profile">Profile</Link>
              
              <div className="logout-container" style={{ display: 'inline-block', marginLeft: '10px' }}>
                {!showConfirm ? (
                  /* Initial Logout Button */
                  <button 
                    onClick={() => setShowConfirm(true)} 
                    className="logout-button-linkstyle"
                  >
                    Logout
                  </button>
                ) : (
                  /* Confirmation State */
                  <span style={{ fontSize: '0.9rem' }}>
                    Confirm? 
                    <button 
                      onClick={handleLogout} 
                      className="logout-button-linkstyle" 
                      style={{ color: 'green', fontWeight: 'bold', marginLeft: '8px' }}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={cancelLogout} 
                      className="logout-button-linkstyle" 
                      style={{ color: 'red', fontWeight: 'bold', marginLeft: '8px' }}
                    >
                      No
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;