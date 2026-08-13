import api from './api';

export const utilisateurService = {
  getAll: async () => {
    const response = await api.get('/utilisateurs');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/utilisateurs/${id}`);
    return response.data;
  },

  creer: async (data: any) => {
  const response = await api.post('/utilisateurs', {
    nom: data.nom,
    motDePasse: data.mot_de_passe,
    role: data.role,
    commission_mode: data.commission_mode,
    commission_defaut: data.commission_defaut,
  });
  return response.data;
},

  update: async (id: string, data: any) => {
    const response = await api.put(`/utilisateurs/${id}`, {
      nom: data.nom,
      motDePasse: data.mot_de_passe,
      role: data.role,
      commission_mode: data.commission_mode,
      commission_defaut: data.commission_defaut,
    });
    return response.data;
  },

  toggleActif: async (id: string) => {
    const response = await api.patch(`/utilisateurs/${id}/toggle-actif`);
    return response.data;
  },

  changerMotDePasse: async (id: string, motDePasse: string) => {
    const response = await api.patch(`/utilisateurs/${id}/mot-de-passe`, { mot_de_passe: motDePasse });
    return response.data;
  },

  addCommissionProduit: async (userId: string, productId: string, montant: number) => {
    const response = await api.post(`/utilisateurs/${userId}/commissions-produits`, { product_id: productId, montant });
    return response.data;
  },

  removeCommissionProduit: async (userId: string, productId: string) => {
    const response = await api.delete(`/utilisateurs/${userId}/commissions-produits/${productId}`);
    return response.data;
  },

  addBonusPalier: async (userId: string, nombreCommandes: number, montant: number) => {
    const response = await api.post(`/utilisateurs/${userId}/bonus-paliers`, { nombre_commandes: nombreCommandes, montant });
    return response.data;
  },

  removeBonusPalier: async (userId: string, palierId: string) => {
    const response = await api.delete(`/utilisateurs/${userId}/bonus-paliers/${palierId}`);
    return response.data;
  }
};