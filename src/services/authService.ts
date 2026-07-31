import api from './api';

export const authService = {
  login: async (nom: string, motDePasse: string) => {
    const response = await api.post('/auth/login', { nom, motDePasse });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changerMotDePasse: async (ancienMotDePasse: string, nouveauMotDePasse: string) => {
    const response = await api.put('/auth/changer-mot-de-passe', {
      ancienMotDePasse,
      nouveauMotDePasse
    });
    return response.data;
  }
};