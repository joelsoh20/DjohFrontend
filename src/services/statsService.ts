import api from './api';

export const statsService = {
  getClassement: async () => {
    const response = await api.get('/stats/classement');
    return response.data;
  },

  getStatsCommercial: async (commercialId: string) => {
  const response = await api.get(`/stats/commercial/${commercialId}`);
  return response.data;
},
};