import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { utilisateurService } from '../services/utilisateurService';
import { Utilisateur, Role } from '../types';

interface UseUtilisateursReturn {
  utilisateurs: Utilisateur[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  searchText: string;
  setSearchText: (text: string) => void;
  roleFilter: Role | 'tous';
  setRoleFilter: (role: Role | 'tous') => void;
  utilisateursFiltres: Utilisateur[];
  refresh: () => void;
  onRefresh: () => void;
  handleToggleActif: (id: string, nom: string, actif: boolean) => void;
}

export const useUtilisateurs = (): UseUtilisateursReturn => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'tous'>('tous');

  const chargerUtilisateurs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await utilisateurService.getAll();
      if (response.success && response.data) {
        setUtilisateurs(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    chargerUtilisateurs();
  }, [chargerUtilisateurs]);

  const refresh = useCallback(() => chargerUtilisateurs(false), [chargerUtilisateurs]);
  const onRefresh = useCallback(() => chargerUtilisateurs(true), [chargerUtilisateurs]);

  const handleToggleActif = useCallback((id: string, nom: string, actif: boolean) => {
    const action = actif ? 'désactiver' : 'activer';
    Alert.alert(
      `${actif ? 'Désactiver' : 'Activer'} l'utilisateur ?`,
      `Voulez-vous vraiment ${action} "${nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: actif ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await utilisateurService.toggleActif(id);
              setUtilisateurs(prev =>
                prev.map(u => (u.id === id ? { ...u, actif: !u.actif } : u))
              );
            } catch (err: any) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
            }
          },
        },
      ]
    );
  }, []);

  const utilisateursFiltres = useMemo(() => {
    let filtered = utilisateurs;

    if (roleFilter !== 'tous') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    const search = (searchText || '').toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(u =>
        (u.nom || '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [utilisateurs, roleFilter, searchText]);

  return {
    utilisateurs,
    loading,
    refreshing,
    error,
    searchText,
    setSearchText,
    roleFilter,
    setRoleFilter,
    utilisateursFiltres,
    refresh,
    onRefresh,
    handleToggleActif,
  };
};