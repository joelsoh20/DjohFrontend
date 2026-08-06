import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { secureStorage } from '../services/secureStorage';
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
      const tokenStocke = await secureStorage.getItem('authToken');
      const userStocke = await secureStorage.getItem('userData');

      if (tokenStocke && userStocke) {
        setToken(tokenStocke);
        setUtilisateur(JSON.parse(userStocke));

        // Vérifier que le token est toujours valide
        try {
          const response = await api.get('/auth/me');
          if (response.data?.success && response.data?.data) {
            setUtilisateur(response.data.data);
            await secureStorage.setItem('userData', JSON.stringify(response.data.data));
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
    await secureStorage.removeItem('authToken');
    await secureStorage.removeItem('userData');
    setToken(null);
    setUtilisateur(null);
  };

  const login = async (identifiant: string, motDePasse: string) => {
  const response = await api.post('/auth/login', { identifiant, motDePasse });
  
  if (response.data?.success && response.data?.data) {
    const { token: newToken, utilisateur: user } = response.data.data;
    await secureStorage.setItem('authToken', newToken);
    await secureStorage.setItem('userData', JSON.stringify(user));
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
        await secureStorage.setItem('userData', JSON.stringify(response.data.data));
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