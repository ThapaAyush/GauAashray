import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gauaashray_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on protected route, clean token
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        localStorage.removeItem('gauaashray_token');
        localStorage.removeItem('gauaashray_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

