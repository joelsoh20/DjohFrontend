import api from './api';
// import { ApiResponse, MonthlyClosing, ActionCommandesEnAttente } from '../types';

// interface CloturerParams {
//   mois: number;
//   annee: number;
//   commandes_en_attente_action: ActionCommandesEnAttente;
// }

// export const clotureService = {
//   getAll: async (): Promise<ApiResponse<MonthlyClosing[]>> => {
//     const response = await api.get('/clotures');
//     return response.data;
//   },

//   getById: async (id: string): Promise<ApiResponse<MonthlyClosing>> => {
//     const response = await api.get(`/clotures/${id}`);
//     return response.data;
//   },

//   cloturer: async (data: CloturerParams): Promise<ApiResponse<MonthlyClosing>> => {
//     const response = await api.post('/clotures', data);
//     return response.data;
//   },
// };

export const clotureService = {
  getAll: async () => {
    const response = await api.get('/clotures');
    return response.data;
  },

  cloturer: async (data: { mois: number; annee: number; commandes_en_attente_action: string }) => {
    const response = await api.post('/clotures', data);
    return response.data;
  }
};