import api from './client';

export const login = (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.user);

export const getStats = () => api.get('/stats').then((r) => r.data);

export const getProducts = ({ search = '', category = '', page = 1 } = {}) =>
  api.get('/products', { params: { search, category, page } }).then((r) => r.data);
export const createProduct = (product) => api.post('/products', product).then((r) => r.data);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

export const getOrders = ({ status = '', page = 1, limit = 10 } = {}) =>
  api.get('/orders', { params: { status, page, limit } }).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status }).then((r) => r.data);

export const updateMe = (changes) => api.put('/users/me', changes).then((r) => r.data);
