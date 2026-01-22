import api from './api';

const storeService = {
  // Get all stores (with optional search and Metro Manila filter)
  getStores: async (search = '', metroManilaOnly = false) => {
    const params = {};
    if (search) params.search = search;
    if (metroManilaOnly) params.metro_manila_only = true;
    
    const response = await api.get('/stores', { params });
    return response.data;
  },

  // Get store by ID
  getStore: async (storeId) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },
};

export default storeService;
