import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request debugging
api.interceptors.request.use(
  (config) => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log('Request intercept - Token exists:', !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header added');
      }
    }
    return config;
  },
  (error) => {
    console.error('Request intercept error:', error);
    return Promise.reject(error);
  }
);

// Add response debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response successful:', response.status);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.message);
    const originalRequest = error.config;

    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Unauthorized error - clearing token');
      
      // Clear invalid token
      localStorage.removeItem('accessToken');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;