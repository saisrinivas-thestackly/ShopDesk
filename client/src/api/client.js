import axios from 'axios';

export const TOKEN_KEY = 'shopdesk-token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginCall) onUnauthorized();
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The server took too long to answer. Please try again.';
  if (error.request && !error.response) return 'Cannot reach the server. Check your connection and try again.';
  return error.message || 'Something went wrong';
}

export function getFieldErrors(error) {
  return error.response?.data?.errors || {};
}

export default api;
