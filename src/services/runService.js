import api from './api';

export const runService = {
  getAllRuns: async (page = 0, size = 10) => {
    const response = await api.get('/runs', {
      params: { page, size },
    });
    return response.data?.data;
  },

  getRunDetail: async (runId) => {
    const response = await api.get(`/runs/${runId}`);
    return response.data?.data;
  },

  getRunLogs: async (runId) => {
    const response = await api.get(`/runs/${runId}/logs`);
    return response.data?.data || [];
  },
};
