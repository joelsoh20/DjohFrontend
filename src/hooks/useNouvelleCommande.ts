import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { produitService } from '../services/produitService';
import { commandeService } from '../services/commandeService';
import { useAuth } from '../context/AuthContext';
import { Produit } from '../types';

interface ProduitSelectionne {
  product_id: string;
  nom: string;
  prix: number;
  quantite: number;
}

interface UseNouvelleCommandeReturn {
  formData: {
    client_telephone: string;
    client_quartier: string;
    prix: string;
  };
  produits: Produit[];
  produitsSelectionnes: ProduitSelectionne[];
  loadingData: boolean;
  loadingSubmit: boolean;
  updateField: (field: string, value: string) => void;
  toggleProduit: (productId: string, nom: string, prix: number) => void;
  updateQuantite: (productId: string, quantite: number) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

const INITIAL_FORM = {
  client_telephone: '',
  client_quartier: '',
  prix: '',
};

export const useNouvelleCommande = (): UseNouvelleCommandeReturn => {
  const { utilisateur } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitsSelectionnes, setProduitsSelectionnes] = useState<ProduitSelectionne[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await produitService.getAll();
        if (res.success && res.data) {
          setProduits(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Erreur chargement produits:', err);
      } finally {
        setLoadingData(false);
      }
    };
    charger();
  }, []);

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleProduit = useCallback((productId: string, nom: string, prix: number) => {
    setProduitsSelectionnes(prev => {
      const existe = prev.find(p => p.product_id === productId);
      if (existe) return prev.filter(p => p.product_id !== productId);
      return [...prev, { product_id: productId, nom, prix, quantite: 1 }];
    });
  }, []);

  const updateQuantite = useCallback((productId: string, quantite: number) => {
    if (quantite < 1) return;
    setProduitsSelectionnes(prev =>
      prev.map(p => p.product_id === productId ? { ...p, quantite } : p)
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (produitsSelectionnes.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins un produit');
      return;
    }

    const prixSaisi = parseFloat(formData.prix) || 0;

    if (prixSaisi <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant à percevoir');
      return;
    }

    setLoadingSubmit(true);
    try {
      await commandeService.creer({
        client_nom: 'NDJOH AGOGO',
        client_telephone: formData.client_telephone.trim() || null,
        client_quartier: formData.client_quartier.trim() || null,
        prix_total: prixSaisi,
        lignes: produitsSelectionnes.map(p => ({
          product_id: p.product_id,
          quantite: p.quantite,
          prix_unitaire_reel: p.prix,
        })),
      });

      Alert.alert('Succès', 'Commande enregistrée !', [
        { text: 'OK', onPress: () => resetForm() }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setLoadingSubmit(false);
    }
  }, [formData, produitsSelectionnes]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setProduitsSelectionnes([]);
  }, []);

  return {
    formData, produits, produitsSelectionnes,
    loadingData, loadingSubmit,
    updateField, toggleProduit, updateQuantite,
    handleSubmit, resetForm,
  };
};