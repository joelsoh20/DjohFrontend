import api from './api';

export const stockService = {
  getAll: async () => {
    const response = await api.get('/stocks');
    return response.data;
  },

  ajouter: async (product_id: string, quantite: number) => {
    const response = await api.post('/stocks/ajouter', { product_id, quantite });
    return response.data;
  },

  getMouvements: async (productId: string) => {
    const response = await api.get(`/stocks/${productId}/mouvements`);
    return response.data;
  },

  modifierMouvement: async (mouvementId: string, quantite: number) => {
    const response = await api.patch(`/stocks/mouvements/${mouvementId}`, { quantite });
    return response.data;
  }
};