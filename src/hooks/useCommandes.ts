import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { commandeService } from '../services/commandeService';
import { Commande } from '../types';

interface UseCommandesOptions {
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

/**
 * Récupère TOUTES les commandes (statut='tous') plutôt que de se limiter
 * à statut='recue' — indispensable pour que "en attente" (recue+validee)
 * et "historique" (livree_payee+annulee) reflètent le vrai état serveur.
 * Après toute action, on recharge depuis le serveur (refresh) au lieu de
 * retirer l'élément localement — sinon une commande dont le nouveau
 * statut n'est pas celui attendu (ex: une livraison annulée qui repart
 * en "validée" et non en "annulée") disparaît à tort de l'écran.
 */
export const useCommandes = (options: UseCommandesOptions = {}): UseCommandesReturn => {
  const { limit = 100 } = options;

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
      const response = await commandeService.getAll({ statut: 'tous', limit });
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
  }, [limit]);

  useEffect(() => { chargerCommandes(); }, [chargerCommandes]);

  const refresh = useCallback(() => chargerCommandes(false), [chargerCommandes]);
  const onRefresh = useCallback(() => chargerCommandes(true), [chargerCommandes]);

  const handleValider = useCallback(async (id: string, fraisLivraison: number = 1000, serviceId?: string) => {
    setActionLoading(id);
    try {
      await commandeService.updateStatut(id, 'livree_payee', fraisLivraison, serviceId);
      await chargerCommandes();
    } catch (err: any) {
      // Une rupture de stock (err.response.data.manquants) est affichée
      // par l'appelant via une modale dédiée listant les produits
      // manquants — pas de double affichage avec cette Alert générique.
      if (!err.response?.data?.manquants) {
        Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
      }
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [chargerCommandes]);

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
              await chargerCommandes();
            } catch (err: any) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  }, [chargerCommandes]);

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
      const produitNom = (cmd.lignes || []).map(l => l.produit?.nom || '').join(' ').toLowerCase();
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
