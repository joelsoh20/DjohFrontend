// import api from './api';
// import { ApiResponse, DashboardData } from '../types';

// export const dashboardService = {
//   getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
//     const response = await api.get('/dashboard');
//     return response.data;
//   }
// };
import api from './api';

export const dashboardService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};