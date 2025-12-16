import api from './api';

const productService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get subcategories for a category
  getSubcategories: async (category) => {
    const response = await api.get(`/products/categories/${encodeURIComponent(category)}/subcategories`);
    return response.data;
  },

  // Search products with query and category filter
  searchProducts: async (query = '', category = '') => {
    const params = {};
    if (query) params.search = query;
    if (category) params.category = category;
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Admin: Get inventory
  getInventory: async (params = {}) => {
    const response = await api.get('/admin/inventory', { params });
    return response.data;
  },

  // Admin: Get product detail
  getAdminProduct: async (productId) => {
    const response = await api.get(`/admin/products/${productId}`);
    return response.data;
  },

  // Admin: Update product stock
  updateStock: async (productId, quantity) => {
    const response = await api.put(`/admin/products/${productId}/stock`, {
      quantity,
    });
    return response.data;
  },
};

export default productService;
