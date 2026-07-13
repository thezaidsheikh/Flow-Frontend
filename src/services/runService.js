import api from './api';

export const runService = {
  getRunDetail: async (runId) => {
    const response = await api.get(`/runs/${runId}`);
    return response.data?.data;
  },

  getRunLogs: async (runId) => {
    const response = await api.get(`/runs/${runId}/logs`);
    return response.data?.data || [];
  },
};
