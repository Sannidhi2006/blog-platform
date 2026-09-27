import axios from 'axios';

export const TOKEN_KEY = 'blog_token';

// ── Axios Instance ──────────────────────────────────────────────────
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: auto-attaches JWT ───────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: normalize backend errors ───────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    
    // Create an Error object containing the backend's message
    const err = new Error(message);
    err.response = error.response;
    err.status = error.response?.status;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

export const getHealthStatus = async () => {
  const response = await API.get('/health');
  return response.data;
};

export default API;
