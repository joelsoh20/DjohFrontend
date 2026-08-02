import { useState, useEffect, useCallback } from 'react';
import { serviceLivraisonService } from '../services/serviceLivraisonService';
import { StatsServiceLivraison } from '../types';

export type PeriodeStatsLivraison = 'jour' | 'semaine' | 'mois' | 'tout';

interface UseStatsLivraisonReturn {
  services: StatsServiceLivraison[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  periode: PeriodeStatsLivraison;
  setPeriode: (p: PeriodeStatsLivraison) => void;
  onRefresh: () => void;
}

export const useStatsLivraison = (): UseStatsLivraisonReturn => {
  const [services, setServices] = useState<StatsServiceLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState<PeriodeStatsLivraison>('jour');

  const charger = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await serviceLivraisonService.getStats(periode);
      if (res.success && res.data) {
        setServices(res.data.services || []);
      } else {
        setError(res.message || 'Erreur inconnue');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periode]);

  useEffect(() => { charger(); }, [charger]);

  const onRefresh = useCallback(() => charger(true), [charger]);

  return { services, loading, refreshing, error, periode, setPeriode, onRefresh };
};
