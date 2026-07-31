import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { commandeService } from '../services/commandeService';
import { Commande, StatutCommande } from '../types';

interface UseCommandesOptions {
  statut?: StatutCommande;
  limit?: number;
}

interface UseCommandesReturn {
  commandes: Commande[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  actionLoading: string | null;
  validateAllLoading: boolean;
  refresh: () => void;
  onRefresh: () => void;
  handleValider: (id: string, fraisLivraison?: number, serviceId?: string) => Promise<void>;
  handleAnnuler: (id: string, motif?: string) => void;
  handleValiderGroupe: (ids: string[]) => Promise<void>;
  searchText: string;
  setSearchText: (text: string) => void;
  commandesFiltrees: Commande[];
}

export const useCommandes = (options: UseCommandesOptions = {}): UseCommandesReturn => {
  const { statut = 'recue', limit = 100 } = options;

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [validateAllLoading, setValidateAllLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const chargerCommandes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await commandeService.getAll({ statut, limit });
      if (response.success && response.data) {
        const data = response.data.items || response.data.commandes || [];
        setCommandes(Array.isArray(data) ? data : []);
      } else {
        setError(response.message || 'Erreur inconnue');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statut, limit]);

  useEffect(() => { chargerCommandes(); }, [chargerCommandes]);

  const refresh = useCallback(() => chargerCommandes(false), [chargerCommandes]);
  const onRefresh = useCallback(() => chargerCommandes(true), [chargerCommandes]);

  const handleValider = useCallback(async (id: string, fraisLivraison: number = 1000, serviceId?: string) => {
  setActionLoading(id);
  try {
    await commandeService.updateStatut(id, 'livree_payee', fraisLivraison, serviceId);
    setCommandes(prev => prev.filter(c => c.id !== id));
  } catch (err: any) {
    Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    throw err;
  } finally {
    setActionLoading(null);
  }
}, []);

  const handleAnnuler = useCallback((id: string, motif?: string) => {
  Alert.alert(
    'Annuler la commande',
    'Confirmer l\'annulation ?',
    [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try {
            await commandeService.updateStatut(id, 'annulee', undefined, undefined, motif);
            setCommandes(prev => prev.filter(c => c.id !== id));
          } catch (err: any) {
            Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]
  );
}, []);
  const handleValiderGroupe = useCallback(async (ids: string[]) => {
    setValidateAllLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        await commandeService.updateStatut(id, 'livree_payee', 1000);
        successCount++;
      } catch {
        failCount++;
      }
    }

    await chargerCommandes();
    setValidateAllLoading(false);
    Alert.alert('Résultat', `${successCount} validée(s)${failCount > 0 ? `, ${failCount} échec(s)` : ''}`);
  }, [chargerCommandes]);

  const commandesFiltrees = useMemo(() => {
  const search = (searchText || '').toLowerCase().trim();
  if (!search) return commandes;
  return commandes.filter(cmd => {
    const clientNom = (cmd.client_nom || '').toLowerCase();
    const id = (cmd.id || '').toLowerCase();
    const telephone = (cmd.client_telephone || '').toLowerCase();
    const quartier = (cmd.client_quartier || '').toLowerCase();
    const produitNom = ((cmd as any).produit?.nom || '').toLowerCase();
    return (
      clientNom.includes(search) ||
      id.includes(search) ||
      telephone.includes(search) ||
      quartier.includes(search) ||
      produitNom.includes(search)
    );
  });
}, [commandes, searchText]);

  return {
    commandes, loading, refreshing, error,
    actionLoading, validateAllLoading,
    refresh, onRefresh,
    handleValider, handleAnnuler, handleValiderGroupe,
    searchText, setSearchText,
    commandesFiltrees,
  };
};