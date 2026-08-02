import api from './api';

export const serviceLivraisonService = {
  getAll: async () => {
    const response = await api.get('/services-livraison');
    return response.data;
  },
  create: async (data: { nom: string; contact?: string; zone?: string }) => {
    const response = await api.post('/services-livraison', data);
    return response.data;
  },
  delete: async (id: string) => {
  const res = await api.delete(`/services-livraison/${id}`);
  return res.data;
},
  toggleActif: async (id: string) => {
    const response = await api.patch(`/services-livraison/${id}/toggle`);
    return response.data;
  },
  ajouterStock: async (service_id: string, product_id: string, quantite: number) => {
    const response = await api.post('/services-livraison/stock', { service_id, product_id, quantite });
    return response.data;
  },
  getStocks: async (serviceId: string) => {
    const response = await api.get(`/services-livraison/${serviceId}/stocks`);
    return response.data;
  },
  getStats: async (periode: 'jour' | 'semaine' | 'mois' | 'tout' = 'jour') => {
    const response = await api.get('/services-livraison/stats', { params: { periode } });
    return response.data;
  },
  getStatsJourHier: async () => {
    const response = await api.get('/services-livraison/stats-jour-hier');
    return response.data;
  },
  getStatsPourDate: async (date: string) => {
    const response = await api.get('/services-livraison/stats-jour', { params: { date } });
    return response.data;
  }
};