import api from './api';

export const produitService = {
  getAll: async () => {
    const response = await api.get('/produits');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/produits/${id}`);
    return response.data;
  },

  creer: async (data: any) => {
    const response = await api.post('/produits', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/produits/${id}`, data);
    return response.data;
  },

  toggleActif: async (id: string) => {
    const response = await api.patch(`/produits/${id}/toggle-actif`);
    return response.data;
  }
};