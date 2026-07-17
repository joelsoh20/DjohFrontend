import api from './api';

export const commandeService = {
  getAll: async (params?: any) => {
    const response = await api.get('/commandes', { params });
    return response.data;
  },

  getMesCommandes: async () => {
    const response = await api.get('/commandes/mes-commandes');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/commandes/${id}`);
    return response.data;
  },

  creer: async (data: any) => {
    const response = await api.post('/commandes', data);
    return response.data;
  },

 updateStatut: async (id: string, statut: string, frais_livraison?: number, service_livraison_id?: string, motif?: string) => {
  const response = await api.patch(`/commandes/${id}/statut`, { statut, frais_livraison, service_livraison_id, motif });
  return response.data;
},

getMonDashboard: async () => {
  const response = await api.get('/commandes/mon-dashboard');
  return response.data;
},

};