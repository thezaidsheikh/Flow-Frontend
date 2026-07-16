import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      // Avoid a redirect loop if we're already on an auth page
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup'
      ) {
        window.location.href = '/login';
      }
    }

    if (error.response?.data) {
      const errorData = error.response.data;
      error.apiError = {
        message: errorData.message || 'An error occurred',
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        details: errorData.error?.details || null,
        statusCode: error.response.status,
      };
    }

    return Promise.reject(error);
  },
);

export default api;
