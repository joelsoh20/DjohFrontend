import axios from 'axios';
import { Platform } from 'react-native';
import { secureStorage } from './secureStorage';

// URL du backend
// - Web testé en local (npm run serve:web / expo start --web) : backend
//   local sur localhost:5000
// - Mobile en développement : adresse IP de votre PC sur le réseau local
// - Production (web déployé ou app mobile publiée) : serveur Render
const getBaseUrl = (): string => {
  // Web servi depuis localhost (build local ou "expo start --web") :
  // on suppose que le backend tourne aussi en local, sur le port 5000.
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  if (__DEV__) {
    // Pendant le développement mobile, on utilise l'IP locale du PC
    return 'http://192.168.6.143:5000/api'; //  192.168.6.180 OU 192.168.1.148, 192.168.43.112 ou 192.168.56.1 lorque je suis hors reseau ← Remplacez par votre IP
  }
  // En production (web déployé ou app mobile publiée)
  return 'https://backenddjoh.onrender.com/api';
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
  const token = await secureStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Désactiver le cache pour toutes les requêtes GET
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }

  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await secureStorage.removeItem('authToken');
      await secureStorage.removeItem('userData');
    }

    return Promise.reject(error);
  }
  );
export default api;