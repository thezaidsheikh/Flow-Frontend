import api from './api';

export const credentialService = {
  getAllCredentials: async () => {
    const response = await api.get('/credentials');
    return response.data?.data || [];
  },

  createCredential: async (name, provider, secrets) => {
    const response = await api.post('/credentials', {
      name,
      provider,
      secrets,
    });
    return response.data?.data;
  },

  deleteCredential: async (id) => {
    const response = await api.delete(`/credentials/${id}`);
    return response.data;
  },
};
