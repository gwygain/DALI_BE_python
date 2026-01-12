import api from './api';

const cartService = {
  // Get cart items
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/items', { product_id: productId, quantity });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/cart/items/${productId}?quantity=${quantity}`);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Apply voucher
  applyVoucher: async (voucherCode) => {
    const response = await api.post('/cart/apply-voucher', { voucher_code: voucherCode });
    return response.data;
  },

  // Remove voucher
  removeVoucher: async () => {
    const response = await api.delete('/cart/remove-voucher');
    return response.data;
  },

  // Get voucher info
  getVoucherInfo: async () => {
    const response = await api.get('/cart/voucher-info');
    return response.data;
  },
};

export default cartService;
