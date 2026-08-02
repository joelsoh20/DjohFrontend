import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { produitService } from '../services/produitService';
import { commandeService } from '../services/commandeService';
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
  isEditMode: boolean;
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

/**
 * @param commandeIdToEdit id de la commande à éditer. La commande complète
 * (avec toutes ses lignes) est rechargée depuis l'API plutôt que reçue via
 * les paramètres de navigation, pour ne jamais éditer un objet partiel.
 */
export const useNouvelleCommande = (commandeIdToEdit?: string): UseNouvelleCommandeReturn => {
  const isEditMode = !!commandeIdToEdit;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitsSelectionnes, setProduitsSelectionnes] = useState<ProduitSelectionne[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await produitService.getAll();

        let produitsList: Produit[] = [];
        if (Array.isArray(res)) {
          produitsList = res;
        } else if (res?.success && Array.isArray(res.data)) {
          produitsList = res.data;
        } else if (res?.data && Array.isArray(res.data)) {
          produitsList = res.data;
        } else if (Array.isArray(res?.produits)) {
          produitsList = res.produits;
        }

        setProduits(produitsList);

        if (commandeIdToEdit) {
          const detailRes = await commandeService.getById(commandeIdToEdit);
          const commande = detailRes?.data;
          if (commande) {
            setFormData({
              client_telephone: commande.client_telephone || '',
              client_quartier: commande.client_quartier || '',
              prix: commande.prix_total?.toString() || '',
            });

            const lignes = commande.lignes || [];
            setProduitsSelectionnes(lignes.map((l: any) => {
              const produitTrouve = produitsList.find(p => p.id === l.product_id);
              return {
                product_id: l.product_id,
                nom: l.produit?.nom || produitTrouve?.nom || '',
                prix: Number(l.prix_unitaire_reel),
                quantite: l.quantite,
              };
            }));
          }
        }
      } catch (err) {
        console.error('Erreur chargement produits/commande:', err);
      } finally {
        setLoadingData(false);
      }
    };
    charger();
  }, [commandeIdToEdit]);

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

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setProduitsSelectionnes([]);
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
      const lignes = produitsSelectionnes.map(p => ({
        product_id: p.product_id,
        quantite: p.quantite,
        prix_unitaire_reel: p.prix,
      }));

      if (isEditMode && commandeIdToEdit) {
        await commandeService.update(commandeIdToEdit, {
          client_telephone: formData.client_telephone.trim() || null,
          client_quartier: formData.client_quartier.trim() || null,
          lignes,
        });

        Alert.alert('Succès', 'Commande modifiée !', [
          { text: 'OK', onPress: () => resetForm() }
        ]);
      } else {
        await commandeService.creer({
          client_nom: 'NDJOH AGOGO',
          client_telephone: formData.client_telephone.trim() || null,
          client_quartier: formData.client_quartier.trim() || null,
          prix_total: prixSaisi,
          lignes,
        });

        Alert.alert('Succès', 'Commande enregistrée !', [
          { text: 'OK', onPress: () => resetForm() }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setLoadingSubmit(false);
    }
  }, [formData, produitsSelectionnes, isEditMode, commandeIdToEdit]);

  return {
    formData, produits, produitsSelectionnes,
    loadingData, loadingSubmit, isEditMode,
    updateField, toggleProduit, updateQuantite,
    handleSubmit, resetForm,
  };
};
