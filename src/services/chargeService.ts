import api from './api';

export const chargeService = {
  getAll: async () => {
    const response = await api.get('/charges');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/charges/${id}`);
    return response.data;
  },

  creer: async (data: any) => {
    const response = await api.post('/charges', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/charges/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/charges/${id}`);
    return response.data;
  },

  getResumeMensuel: async () => {
  const response = await api.get('/charges/resume-mensuel');
  return response.data;
},
};