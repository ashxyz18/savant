const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('roseo_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  getProfile() {
    return this.get('/auth/profile');
  }

  updateProfile(data) {
    return this.put('/auth/profile', data);
  }

  forgotPassword(email) {
    return this.post('/auth/forgot-password', { email });
  }

  resetPassword(token, password) {
    return this.post('/auth/reset-password', { token, password });
  }

  // Products
  getProducts(params = {}) {
    return this.get('/products', params);
  }

  getProduct(id) {
    return this.get(`/products/${id}`);
  }

  createProduct(formData) {
    return this.request('/products', {
      method: 'POST',
      body: formData,
    });
  }

  updateProduct(id, formData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  toggleProductStatus(id) {
    return this.patch(`/products/${id}/toggle-status`);
  }

  getLowStockProducts(threshold = 10) {
    return this.get('/products/low-stock', { threshold });
  }

  // Orders
  getMyOrders(params = {}) {
    return this.get('/orders/my-orders', params);
  }

  getOrders(params = {}) {
    return this.get('/orders', params);
  }

  getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  updateOrderStatus(id, status) {
    return this.patch(`/orders/${id}/status`, { status });
  }

  updatePaymentStatus(id, paymentStatus) {
    return this.patch(`/orders/${id}/payment`, { paymentStatus });
  }

  addTrackingNumber(id, trackingNumber) {
    return this.patch(`/orders/${id}/tracking`, { trackingNumber });
  }

  deleteOrder(id) {
    return this.delete(`/orders/${id}`);
  }

  // Categories
  getCategories() {
    return this.get('/categories');
  }

  createCategory(formData) {
    return this.request('/categories', {
      method: 'POST',
      body: formData,
    });
  }

  updateCategory(id, formData) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  // Banners
  getBanners(params = {}) {
    return this.get('/banners', params);
  }

  createBanner(formData) {
    return this.request('/banners', {
      method: 'POST',
      body: formData,
    });
  }

  updateBanner(id, formData) {
    return this.request(`/banners/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  deleteBanner(id) {
    return this.delete(`/banners/${id}`);
  }

  toggleBannerStatus(id) {
    return this.patch(`/banners/${id}/toggle-status`);
  }

  // Brands
  getBrands(params = {}) {
    return this.get('/brands', params);
  }

  getBrand(id) {
    return this.get(`/brands/${id}`);
  }

  createBrand(formData) {
    return this.request('/brands', {
      method: 'POST',
      body: formData,
    });
  }

  updateBrand(id, formData) {
    return this.request(`/brands/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  deleteBrand(id) {
    return this.delete(`/brands/${id}`);
  }

  toggleBrandStatus(id) {
    return this.patch(`/brands/${id}/toggle`);
  }

  // Dashboard
  getDashboardStats() {
    return this.get('/dashboard');
  }

  // Chat
  getMyChat() {
    return this.get('/chat/mine');
  }

  createChat(subject, message) {
    return this.post('/chat', { subject, message });
  }

  getAllChats(params = {}) {
    return this.get('/chat', params);
  }

  getChat(id) {
    return this.get(`/chat/${id}`);
  }

  adminReply(id, message) {
    return this.post(`/chat/${id}/reply`, { message });
  }

  closeChat(id) {
    return this.patch(`/chat/${id}/close`);
  }

  // Auth - Register
  register(data) {
    return this.post('/auth/register', data);
  }

  // Site Settings
  getSettings() {
    return this.get('/settings');
  }

  updateSettings(data) {
    return this.put('/settings', data);
  }
}

const api = new ApiClient();
export default api;
