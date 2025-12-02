import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminAPI.login({ email, password });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <nav className="admin-nav">
        <Link to="/" className="admin-logo">
          <div className="logo-icon">
            <span className="logo-d">!</span>
            <span className="logo-text">D</span>
          </div>
          <span className="logo-name">DALI</span>
        </Link>
        <div className="admin-nav-links">
          <span className="active">Admin Login</span>
          <Link to="/login">User Login</Link>
        </div>
      </nav>

      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1>Admin Login</h1>
          <p>Sign in to access the admin dashboard</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
