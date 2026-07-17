import { useState, useEffect, useCallback } from 'react';
import { commandeService } from '../services/commandeService';

export interface CommercialStats {
  commandesEnvoyees: number;
  commandesLivrees: number;
  commandesAnnulees: number;
  commissionTotale: number;
  produitsVendus: number;
  totalVentes: number;
  bonus: number;
  totalCommandesMois: number;
  dernieresCommandes: any[];
}

export const useCommercialDashboard = () => {
  const [stats, setStats] = useState<CommercialStats>({
    commandesEnvoyees: 0,
    commandesLivrees: 0,
    commandesAnnulees: 0,
    commissionTotale: 0,
    produitsVendus: 0,
    totalVentes: 0,
    bonus: 0,
    totalCommandesMois: 0,
    dernieresCommandes: []
  });
  const [loading, setLoading] = useState(true);

  const charger = useCallback(async () => {
    try {
      const res = await commandeService.getMonDashboard();
      if (res.success && res.data) {
        setStats({
          commandesEnvoyees: res.data.commandesEnvoyees || 0,
          commandesLivrees: res.data.commandesLivrees || 0,
          commandesAnnulees: res.data.commandesAnnulees || 0,
          commissionTotale: res.data.commissionTotale || 0,
          produitsVendus: res.data.produitsVendus || 0,
          totalVentes: res.data.totalVentes || 0,
          bonus: res.data.bonus || 0,
          totalCommandesMois: res.data.totalCommandesMois || 0,
          dernieresCommandes: res.data.dernieresCommandes || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  return { stats, loading, refresh: charger };
};