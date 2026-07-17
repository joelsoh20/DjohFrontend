import api from './api';
import { ApiResponse } from '../types';

export const exportService = {
  getFEC: async (): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.get('/exports/fec');
    return response.data;
  },

  getPDF: async (mois?: number, annee?: number): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.get('/exports/pdf', { params: { mois, annee } });
    return response.data;
  },

  getBalance: async (): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.get('/exports/balance');
    return response.data;
  },
};