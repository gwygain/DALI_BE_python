import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import StoreLocator from './pages/StoreLocator';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Auth pages without navbar/footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Main pages with navbar/footer */}
            <Route
              path="/*"
              element={
                <div className="app-layout">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/stores" element={<StoreLocator />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
