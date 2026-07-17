import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { produitService } from '../services/produitService';
import { Produit } from '../types';

interface UseProduitsReturn {
  produits: Produit[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  searchText: string;
  setSearchText: (text: string) => void;
  filterActif: 'tous' | 'actif' | 'inactif';
  setFilterActif: (filter: 'tous' | 'actif' | 'inactif') => void;
  produitsFiltres: Produit[];
  refresh: () => void;
  onRefresh: () => void;
  handleToggleActif: (id: string, nom: string, actif: boolean) => void;
}

export const useProduits = (): UseProduitsReturn => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterActif, setFilterActif] = useState<'tous' | 'actif' | 'inactif'>('tous');

  const chargerProduits = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await produitService.getAll();
      if (response.success && response.data) {
        setProduits(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { chargerProduits(); }, [chargerProduits]);

  const refresh = useCallback(() => chargerProduits(false), [chargerProduits]);
  const onRefresh = useCallback(() => chargerProduits(true), [chargerProduits]);

  const handleToggleActif = useCallback((id: string, nom: string, actif: boolean) => {
    const action = actif ? 'désactiver' : 'activer';
    Alert.alert(
      `${actif ? 'Désactiver' : 'Activer'} le produit ?`,
      `Voulez-vous vraiment ${action} "${nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: actif ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await produitService.toggleActif(id);
              setProduits(prev => prev.map(p => p.id === id ? { ...p, actif: !p.actif } : p));
            } catch (err: any) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
            }
          },
        },
      ]
    );
  }, []);

  const produitsFiltres = useMemo(() => {
    let filtered = produits;

    if (filterActif === 'actif') filtered = filtered.filter(p => p.actif);
    if (filterActif === 'inactif') filtered = filtered.filter(p => !p.actif);

    const search = (searchText || '').toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(p => (p.nom || '').toLowerCase().includes(search));
    }

    return filtered;
  }, [produits, filterActif, searchText]);

  return {
    produits, loading, refreshing, error,
    searchText, setSearchText,
    filterActif, setFilterActif,
    produitsFiltres,
    refresh, onRefresh,
    handleToggleActif,
  };
};