import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// URL du backend
// En développement : adresse IP de votre PC sur le réseau local
// En production : URL de votre serveur déployé
const getBaseUrl = (): string => {
  if (__DEV__) {
    // Pendant le développement, on utilise aussi le backend Render
    return 'http://192.168.6.158:5000/api'; //  192.168.6.180 OU 192.168.1.148, 192.168.43.112 ou 192.168.56.1 lorque je suis hors reseau ← Remplacez par votre IP
  }
  // En production
  return 'https://backenddjoh-1.onrender/api';
};

// const getBaseUrl = (): string => {
//   return 'https://backenddjoh-1.onrender.com/api';
// };

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter automatiquement le token JWT
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    }

    return Promise.reject(error);
  }
);

export default api;