import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchInventory();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (search = '') => {
    try {
      const response = await adminAPI.getOrders(search || undefined);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await adminAPI.getInventory({ search: searchQuery, category: selectedCategory });
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleLogout = async () => {
    await adminAPI.logout();
    navigate('/admin/login');
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleUpdateStock = async (productId, quantity) => {
    try {
      await adminAPI.updateStock(productId, quantity);
      fetchInventory();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update stock');
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
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">
            <span>!</span>
            <span>D</span>
          </div>
          <span>DALI Admin</span>
        </div>

        <nav className="admin-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
            </svg>
            Orders
          </button>
          <button
            className={activeTab === 'inventory' ? 'active' : ''}
            onClick={() => setActiveTab('inventory')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            Inventory
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <h1>Dashboard</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon orders-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>{stats?.total_orders || 0}</h3>
                  <p>Total Orders</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>{stats?.pending_orders || 0}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon products-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>{stats?.total_products || 0}</h3>
                  <p>Total Products</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon revenue-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>₱{stats?.total_revenue?.toFixed(2) || '0.00'}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="recent-orders">
              <h2>Recent Orders</h2>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.order_id}>
                      <td>#{order.order_id}</td>
                      <td>{order.account?.first_name} {order.account?.last_name}</td>
                      <td>₱{parseFloat(order.total_price).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(order.shipping_status)}`}>
                          {order.shipping_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="tab-header">
              <h1>Orders</h1>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchOrders(e.target.value);
                }}
              />
            </div>

            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>#{order.order_id}</td>
                    <td>
                      {order.account?.first_name} {order.account?.last_name}
                      <br />
                      <small>{order.account?.email}</small>
                    </td>
                    <td>{order.order_items?.length || 0} items</td>
                    <td>₱{parseFloat(order.total_price).toFixed(2)}</td>
                    <td>{order.payment_status}</td>
                    <td>
                      <select
                        value={order.shipping_status}
                        onChange={(e) => handleUpdateStatus(order.order_id, e.target.value)}
                        className={`status-select ${getStatusColor(order.shipping_status)}`}
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="PREPARING_FOR_SHIPMENT">Preparing for Shipment</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="COLLECTED">Collected</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="DELIVERY_FAILED">Delivery Failed</option>
                      </select>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.order_id}`} className="view-btn">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            <div className="tab-header">
              <h1>Inventory</h1>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
              />
            </div>

            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((product) => (
                  <tr key={product.product_id}>
                    <td>
                      <div className="product-cell">
                        <img 
                          src={product.image || 'https://via.placeholder.com/40x40?text=P'} 
                          alt={product.product_name}
                        />
                        <span>{product.product_name}</span>
                      </div>
                    </td>
                    <td>{product.product_category}</td>
                    <td>₱{parseFloat(product.product_price).toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        className="stock-input"
                        value={product.product_quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          handleUpdateStock(product.product_id, newQuantity);
                        }}
                        min="0"
                      />
                    </td>
                    <td>
                      <button className="edit-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
