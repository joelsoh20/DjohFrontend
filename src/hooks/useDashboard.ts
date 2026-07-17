// pour charger et gérer les données

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardData } from '../types';

interface UseDashboardReturn {
  dashboard: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  onRefresh: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
        setError(response.message || 'Erreur inconnue');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    chargerDashboard();
  }, [chargerDashboard]);

  const refresh = useCallback(() => chargerDashboard(false), [chargerDashboard]);
  const onRefresh = useCallback(() => chargerDashboard(true), [chargerDashboard]);

  return { dashboard, loading, refreshing, error, refresh, onRefresh };
};