import api from './api';

export const stockService = {
  getAll: async () => {
    const response = await api.get('/stocks');
    return response.data;
  },

  ajouter: async (product_id: string, quantite: number) => {
    const response = await api.post('/stocks/ajouter', { product_id, quantite });
    return response.data;
  }
};