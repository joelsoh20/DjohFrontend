import { useState, useEffect, useCallback } from 'react';
import { serviceLivraisonService } from '../services/serviceLivraisonService';
import { StatsServiceLivraison } from '../types';

interface UseStatsLivraisonJourReturn {
  jour: StatsServiceLivraison[];
  hier: StatsServiceLivraison[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  chargerPourDate: (date: Date) => Promise<StatsServiceLivraison[]>;
  loadingDate: boolean;
}

const formatDateISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const useStatsLivraisonJour = (): UseStatsLivraisonJourReturn => {
  const [jour, setJour] = useState<StatsServiceLivraison[]>([]);
  const [hier, setHier] = useState<StatsServiceLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDate, setLoadingDate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charger = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await serviceLivraisonService.getStatsJourHier();
      if (res.success && res.data) {
        setJour(res.data.jour || []);
        setHier(res.data.hier || []);
      } else {
        setError(res.message || 'Erreur inconnue');
      }
    } catch (err: any) {
      const message = err.response?.data?.message
        || (err.response ? `Erreur serveur (${err.response.status})` : 'Impossible de joindre le serveur (vérifiez la connexion ou que le serveur est bien démarré)');
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const onRefresh = useCallback(() => charger(true), [charger]);

  const chargerPourDate = useCallback(async (date: Date): Promise<StatsServiceLivraison[]> => {
    setLoadingDate(true);
    try {
      const res = await serviceLivraisonService.getStatsPourDate(formatDateISO(date));
      if (res.success && res.data) {
        return res.data.services || [];
      }
      return [];
    } catch {
      return [];
    } finally {
      setLoadingDate(false);
    }
  }, []);

  return { jour, hier, loading, refreshing, error, onRefresh, chargerPourDate, loadingDate };
};
