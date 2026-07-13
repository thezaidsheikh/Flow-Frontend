import api from './api';

export const authService = {
  register: async (email, password, first_name, last_name) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      first_name,
      last_name,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  refreshToken: async (refresh_token) => {
    const response = await api.post('/auth/refresh', { refresh_token });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
