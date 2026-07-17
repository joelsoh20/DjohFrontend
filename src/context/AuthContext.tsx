import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Utilisateur } from '../types';
import api from '../services/api';

interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isCommercial: boolean;
  login: (identifiant: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { chargerSession(); }, []);

  const chargerSession = async () => {
    try {
      const tokenStocke = await SecureStore.getItemAsync('authToken');
      const userStocke = await SecureStore.getItemAsync('userData');

      if (tokenStocke && userStocke) {
        setToken(tokenStocke);
        setUtilisateur(JSON.parse(userStocke));

        // Vérifier que le token est toujours valide
        try {
          const response = await api.get('/auth/me');
          if (response.data?.success && response.data?.data) {
            setUtilisateur(response.data.data);
            await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data));
          }
        } catch {
          await cleanSession();
        }
      }
    } catch (error) {
      console.error('Erreur session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanSession = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userData');
    setToken(null);
    setUtilisateur(null);
  };

  const login = async (identifiant: string, motDePasse: string) => {
  const response = await api.post('/auth/login', { identifiant, motDePasse });
  
  if (response.data?.success && response.data?.data) {
    const { token: newToken, utilisateur: user } = response.data.data;
    await SecureStore.setItemAsync('authToken', newToken);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
    setToken(newToken);
    setUtilisateur(user);
  } else {
    throw new Error(response.data?.message || 'Erreur de connexion');
  }
};

  const logout = async () => {
    await cleanSession();
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data) {
        setUtilisateur(response.data.data);
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      utilisateur, token, isLoading,
      isAuthenticated: !!utilisateur,
      isAdmin: utilisateur?.role === 'admin',
      isManager: utilisateur?.role === 'manager',
      isCommercial: utilisateur?.role === 'commercial',
      login, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};