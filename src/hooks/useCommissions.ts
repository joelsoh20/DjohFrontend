import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { utilisateurService } from '../services/utilisateurService';
import { produitService } from '../services/produitService';
import { Utilisateur, Produit, ProductCommission, CommissionMode } from '../types';

interface UseCommissionsReturn {
  commerciaux: Utilisateur[];
  produits: Produit[];
  commissionGlobale: string;
  loading: boolean;
  setCommissionGlobale: (val: string) => void;
  updateCommissionGlobale: () => Promise<void>;
  selectedCommercial: Utilisateur | null;
  selectCommercial: (user: Utilisateur | null) => void;
  commissionsProduits: ProductCommission[];
  updateCommissionMode: (userId: string, mode: CommissionMode) => Promise<void>;
  updateCommissionDefaut: (userId: string, montant: number) => Promise<void>;
  addCommissionProduit: (userId: string, productId: string, montant: number) => Promise<void>;
  removeCommissionProduit: (userId: string, productId: string) => Promise<void>;
  refresh: () => void;
}

export const useCommissions = (): UseCommissionsReturn => {
  const [commerciaux, setCommerciaux] = useState<Utilisateur[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [commissionGlobale, setCommissionGlobale] = useState('1000');
  const [loading, setLoading] = useState(true);
  const [selectedCommercial, setSelectedCommercial] = useState<Utilisateur | null>(null);
  const [commissionsProduits, setCommissionsProduits] = useState<ProductCommission[]>([]);

  const chargerDonnees = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, produitsRes] = await Promise.all([
        utilisateurService.getAll(),
        produitService.getAll(),
      ]);

      if (usersRes.success && usersRes.data) {
        const users = usersRes.data.filter((u: Utilisateur) => u.role === 'commercial');
        setCommerciaux(users);
        // Prendre la commission du premier comme défaut global
        if (users.length > 0 && users[0].commission_defaut) {
          setCommissionGlobale(users[0].commission_defaut.toString());
        }
        // Mettre à jour le commercial sélectionné
        if (selectedCommercial) {
          const updated = users.find((u: Utilisateur) => u.id === selectedCommercial.id);
          if (updated) setSelectedCommercial(updated);
        }
      }

      if (produitsRes.success && produitsRes.data) {
        setProduits(produitsRes.data.filter((p: Produit) => p.actif));
      }
    } catch (err) {
      console.error('Erreur chargement commissions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCommercial?.id]);

  useEffect(() => { chargerDonnees(); }, []);

  const refresh = useCallback(() => chargerDonnees(), [chargerDonnees]);

  const updateCommissionGlobale = useCallback(async () => {
    const montant = parseFloat(commissionGlobale);
    if (isNaN(montant) || montant < 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }

    try {
      // Mettre à jour tous les commerciaux en mode forfaitaire
      for (const commercial of commerciaux) {
        if (commercial.commission_mode === 'forfaitaire') {
          await utilisateurService.update(commercial.id, {
            commission_defaut: montant,
          } as any);
        }
      }
      Alert.alert('Succès', 'Commission par défaut mise à jour');
      await chargerDonnees();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  }, [commissionGlobale, commerciaux, chargerDonnees]);

  const selectCommercial = useCallback((user: Utilisateur | null) => {
    setSelectedCommercial(user);
    if (user?.commissions_produits) {
      setCommissionsProduits(user.commissions_produits);
    } else {
      setCommissionsProduits([]);
    }
  }, []);

  const updateCommissionMode = useCallback(async (userId: string, mode: CommissionMode) => {
    try {
      await utilisateurService.update(userId, { commission_mode: mode } as any);
      Alert.alert('Succès', `Mode changé en "${mode === 'forfaitaire' ? 'Forfaitaire' : 'Par produit'}"`);
      await chargerDonnees();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  }, [chargerDonnees]);

  const updateCommissionDefaut = useCallback(async (userId: string, montant: number) => {
    try {
      await utilisateurService.update(userId, { commission_defaut: montant } as any);
      await chargerDonnees();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  }, [chargerDonnees]);

  const addCommissionProduit = useCallback(async (userId: string, productId: string, montant: number) => {
    try {
      // Cette fonction dépendra de l'API backend pour gérer les ProductCommission
      await utilisateurService.addCommissionProduit(userId, productId, montant);
      await chargerDonnees();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  }, [chargerDonnees]);

  const removeCommissionProduit = useCallback(async (userId: string, productId: string) => {
    try {
      await utilisateurService.removeCommissionProduit(userId, productId);
      await chargerDonnees();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    }
  }, [chargerDonnees]);

  return {
    commerciaux, produits, commissionGlobale, loading,
    setCommissionGlobale, updateCommissionGlobale,
    selectedCommercial, selectCommercial,
    commissionsProduits,
    updateCommissionMode, updateCommissionDefaut,
    addCommissionProduit, removeCommissionProduit,
    refresh,
  };
};