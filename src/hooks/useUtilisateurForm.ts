import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { utilisateurService } from '../services/utilisateurService';
import { produitService } from '../services/produitService';
import { Utilisateur, Role, CommissionMode, Produit, ProductCommission } from '../types';

interface FormData {
  nom: string;
  mot_de_passe: string;
  role: Role;
  commission_mode: CommissionMode;
  commission_defaut: string;
}

interface UseUtilisateurFormReturn {
  formData: FormData;
  errors: Record<string, string>;
  loading: boolean;
  loadingSubmit: boolean;
  isEdit: boolean;
  utilisateur: Utilisateur | null;
  produits: Produit[];
  commissionsProduits: ProductCommission[];
  updateField: (field: keyof FormData, value: string) => void;
  setCommissionMode: (mode: CommissionMode) => void;
  validateForm: () => boolean;
  handleSubmit: () => Promise<boolean>;
  addCommissionProduit: (productId: string, montant: number) => void;
  removeCommissionProduit: (productId: string) => void;
}

const INITIAL_FORM: FormData = {
  nom: '',
  mot_de_passe: '',
  role: 'commercial',
  commission_mode: 'forfaitaire',
  commission_defaut: '1000',
};

export const useUtilisateurForm = (userId?: string): UseUtilisateurFormReturn => {
  const isEdit = !!userId;

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [commissionsProduits, setCommissionsProduits] = useState<ProductCommission[]>([]);

  useEffect(() => {
    const charger = async () => {
      try {
        const produitsRes = await produitService.getAll();
        if (produitsRes.success && produitsRes.data) {
          setProduits(Array.isArray(produitsRes.data) ? produitsRes.data : []);
        }

        if (isEdit && userId) {
          const userRes = await utilisateurService.getById(userId);
          if (userRes.success && userRes.data) {
            const user = userRes.data;
            setUtilisateur(user);
            setFormData({
              nom: user.nom,
              mot_de_passe: '',
              role: user.role,
              commission_mode: user.commission_mode,
              commission_defaut: user.commission_defaut?.toString() || '1000',
            });
            setCommissionsProduits(user.commissions_produits || []);
          }
        }
      } catch (err) {
        console.error('Erreur chargement formulaire:', err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [userId, isEdit]);


  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const setCommissionMode = useCallback((mode: CommissionMode) => {
    setFormData(prev => ({ ...prev, commission_mode: mode }));
    if (mode === 'forfaitaire') setCommissionsProduits([]);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!isEdit && !formData.mot_de_passe) newErrors.mot_de_passe = 'Le mot de passe est obligatoire';
    if (isEdit && formData.mot_de_passe && formData.mot_de_passe.length < 6)
      newErrors.mot_de_passe = 'Minimum 6 caractères';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEdit]);

const handleSubmit = useCallback(async (): Promise<boolean> => {
  if (!validateForm()) return false;

  setLoadingSubmit(true);
  try {
    const data: any = {
      nom: formData.nom.trim(),
      role: formData.role,
      commission_mode: formData.commission_mode,
      commission_defaut: parseFloat(formData.commission_defaut) || 1000,
    };

    if (formData.mot_de_passe) data.mot_de_passe = formData.mot_de_passe;

    console.log('Données envoyées:', data);  // ← ICI

    if (isEdit && userId) {
      const response = await utilisateurService.update(userId, data);
      console.log('Réponse update:', response);  // ← ICI
    } else {
      const response = await utilisateurService.creer(data);
      console.log('Réponse create:', response);  // ← ICI
    }

    return true;
  } catch (err: any) {
    console.log('Erreur:', err.response?.data || err.message);  // ← ICI
    Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    return false;
  } finally {
    setLoadingSubmit(false);
  }
}, [formData, isEdit, userId, validateForm]);
  const addCommissionProduit = useCallback((productId: string, montant: number) => {
    setCommissionsProduits(prev => {
      const existing = prev.find(c => c.product_id === productId);
      if (existing) return prev.map(c => c.product_id === productId ? { ...c, montant } : c);
      return [...prev, { id: '', user_id: userId || '', product_id: productId, montant }];
    });
  }, [userId]);

  const removeCommissionProduit = useCallback((productId: string) => {
    setCommissionsProduits(prev => prev.filter(c => c.product_id !== productId));
  }, []);

  return {
    formData, errors, loading, loadingSubmit, isEdit, utilisateur,
    produits, commissionsProduits,
    updateField, setCommissionMode, validateForm, handleSubmit,
    addCommissionProduit, removeCommissionProduit,
  };
};