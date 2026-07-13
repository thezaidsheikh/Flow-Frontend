import api from './api';

export const connectorService = {
  getAllConnectors: async () => {
    const response = await api.get('/connectors');
    return response.data?.data || [];
  },

  getConnector: async (provider) => {
    const response = await api.get(`/connectors/${provider}`);
    return response.data?.data;
  },

  executeConnectorAction: async (provider, action, credentialId, inputs) => {
    const response = await api.post(
      `/connectors/${provider}/actions/${action}/execute`,
      {
        credential_id: credentialId,
        inputs,
      },
    );
    return response.data?.data;
  },
};
