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

interface CommandeToEdit {
  id: string;
  client_telephone?: string;
  client_quartier?: string;
  prix_unitaire_reel?: number;
  product_id?: string;
  quantite?: number;
  produit?: { id: string; nom: string; prix_catalogue?: number };
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

export const useNouvelleCommande = (commandeToEdit?: CommandeToEdit): UseNouvelleCommandeReturn => {
  const { utilisateur } = useAuth();
  const isEditMode = !!commandeToEdit;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitsSelectionnes, setProduitsSelectionnes] = useState<ProduitSelectionne[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Chargement des produits + pré-remplissage si mode édition
  useEffect(() => {
    const charger = async () => {
      try {
        const res = await produitService.getAll();
        const produitsList: Produit[] = res.success && res.data
          ? (Array.isArray(res.data) ? res.data : [])
          : [];
        setProduits(produitsList);

        // Pré-remplissage si mode édition
        if (commandeToEdit) {
          setFormData({
            client_telephone: commandeToEdit.client_telephone || '',
            client_quartier: commandeToEdit.client_quartier || '',
            prix: commandeToEdit.prix_unitaire_reel?.toString() || '',
          });

          if (commandeToEdit.product_id && commandeToEdit.produit) {
            const produitTrouve = produitsList.find(p => p.id === commandeToEdit.product_id);
            const prix = produitTrouve?.prix_catalogue || commandeToEdit.produit.prix_catalogue || 0;
            setProduitsSelectionnes([{
              product_id: commandeToEdit.product_id,
              nom: commandeToEdit.produit.nom || '',
              prix,
              quantite: commandeToEdit.quantite || 1,
            }]);
          }
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
      if (isEditMode && commandeToEdit) {
        // Mode édition : mise à jour
        const ligne = produitsSelectionnes[0];
        await commandeService.update(commandeToEdit.id, {
          client_telephone: formData.client_telephone.trim() || null,
          client_quartier: formData.client_quartier.trim() || null,
          product_id: ligne.product_id,
          quantite: ligne.quantite,
          prix_unitaire_reel: prixSaisi,
        });

        Alert.alert('Succès', 'Commande modifiée !', [
          { text: 'OK', onPress: () => resetForm() }
        ]);
      } else {
        // Mode création
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
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setLoadingSubmit(false);
    }
  }, [formData, produitsSelectionnes, isEditMode, commandeToEdit]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setProduitsSelectionnes([]);
  }, []);

  return {
    formData, produits, produitsSelectionnes,
    loadingData, loadingSubmit, isEditMode,
    updateField, toggleProduit, updateQuantite,
    handleSubmit, resetForm,
  };
};