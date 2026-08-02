import { useState, useEffect, useCallback, useMemo } from 'react';
import { commandeService } from '../services/commandeService';
import { Commande, StatutCommande } from '../types';

interface Filters {
  statut: StatutCommande | 'tous';
  searchText: string;
}

interface UseListeCommandesReturn {
  commandes: Commande[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  filters: Filters;
  setStatut: (statut: StatutCommande | 'tous') => void;
  setSearchText: (text: string) => void;
  commandesFiltrees: Commande[];
  selectedCommande: Commande | null;
  selectCommande: (commande: Commande | null) => void;
  refresh: () => void;
  onRefresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

const LIMIT = 20;

export const useListeCommandes = (): UseListeCommandesReturn => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<Filters>({ statut: 'tous', searchText: '' });
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);

  const chargerCommandes = useCallback(async (pageNum: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);
    
    setError(null);

    try {
      const params: any = { page: pageNum, limit: LIMIT };
      if (filters.statut !== 'tous') params.statut = filters.statut;

      const response = await commandeService.getAll(params);
      
      if (response.success && response.data) {
        const data = response.data.items || response.data.commandes || [];
        const total = response.data.total || 0;
        
        if (pageNum === 1 || isRefresh) {
          setCommandes(Array.isArray(data) ? data : []);
        } else {
          setCommandes(prev => [...prev, ...(Array.isArray(data) ? data : [])]);
        }
        
        setHasMore(pageNum * LIMIT < total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.statut]);

  useEffect(() => {
    setPage(1);
    chargerCommandes(1);
  }, [chargerCommandes]);

  const refresh = useCallback(() => {
    setPage(1);
    chargerCommandes(1, false);
  }, [chargerCommandes]);

  const onRefresh = useCallback(() => {
    setPage(1);
    chargerCommandes(1, true);
  }, [chargerCommandes]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || refreshing) return;
    const nextPage = page + 1;
    setPage(nextPage);
    chargerCommandes(nextPage);
  }, [page, hasMore, loading, refreshing, chargerCommandes]);

  const setStatut = useCallback((statut: StatutCommande | 'tous') => {
    setFilters(prev => ({ ...prev, statut }));
  }, []);

  const setSearchText = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, searchText: text }));
  }, []);

  const selectCommande = useCallback((commande: Commande | null) => {
    setSelectedCommande(commande);
  }, []);

  const commandesFiltrees = useMemo(() => {
  const search = (filters.searchText || '').toLowerCase().trim();
  
  if (!search) return commandes;

  return commandes.filter(cmd =>
    (cmd.client_nom || '').toLowerCase().includes(search) ||
    (cmd.id || '').toLowerCase().includes(search) ||
    (cmd.lignes || []).some(l => (l.produit?.nom || '').toLowerCase().includes(search)) ||
    (cmd.commercial?.nom || '').toLowerCase().includes(search)
  );
}, [commandes, filters.searchText]);

  return {
    commandes,
    loading,
    refreshing,
    error,
    filters,
    setStatut,
    setSearchText,
    commandesFiltrees,
    selectedCommande,
    selectCommande,
    refresh,
    onRefresh,
    loadMore,
    hasMore,
  };
};