import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { Langue, ThemeMode } from '../types';
import i18n from '../i18n';

interface UseProfilReturn {
  // Changement mot de passe
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  loadingPassword: boolean;
  changerMotDePasse: (ancien: string, nouveau: string) => Promise<void>;

  // Thème
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // Langue
  langue: Langue;
  setLangue: (langue: Langue) => void;

  // Déconnexion
  handleLogout: () => void;
}

export const useProfil = (): UseProfilReturn => {
  const { utilisateur, logout } = useAuth();
  const { themeMode, setThemeMode, toggleTheme } = useTheme();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Changement de mot de passe
  const changerMotDePasse = useCallback(async (ancien: string, nouveau: string) => {
    if (!ancien || !nouveau) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (nouveau.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoadingPassword(true);
    try {
      await authService.changerMotDePasse(ancien, nouveau);
      Alert.alert('Succès', 'Mot de passe modifié avec succès.');
      setShowPasswordModal(false);
    } catch (err: any) {
      Alert.alert(
        'Erreur',
        err.response?.data?.message || 'Erreur lors du changement de mot de passe.'
      );
    } finally {
      setLoadingPassword(false);
    }
  }, []);

  // Changement de langue
  const [langue, setLangueState] = useState<Langue>(
    (i18n.language?.startsWith('fr') ? 'fr' : 'en') as Langue
  );

  const setLangue = useCallback(async (newLangue: Langue) => {
    setLangueState(newLangue);
    await i18n.changeLanguage(newLangue);
    await AsyncStorage.setItem('langue', newLangue);
  }, []);

  // Déconnexion
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }, [logout]);

  return {
    showPasswordModal,
    setShowPasswordModal,
    loadingPassword,
    changerMotDePasse,
    themeMode,
    setThemeMode,
    langue,
    setLangue,
    handleLogout,
  };
};