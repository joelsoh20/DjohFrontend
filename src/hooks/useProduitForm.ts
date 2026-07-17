import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { produitService } from '../services/produitService';
import { Produit } from '../types';

interface FormData {
  nom: string;
  prix_catalogue: string;
  cout_revient: string;
}

interface UseProduitFormReturn {
  formData: FormData;
  errors: Record<string, string>;
  loading: boolean;
  loadingSubmit: boolean;
  isEdit: boolean;
  produit: Produit | null;
  updateField: (field: keyof FormData, value: string) => void;
  validateForm: () => boolean;
  handleSubmit: () => Promise<boolean | void>;
}

const INITIAL_FORM: FormData = {
  nom: '',
  prix_catalogue: '',
  cout_revient: '',
};

export const useProduitForm = (productId?: string): UseProduitFormReturn => {
  const isEdit = !!productId;

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [produit, setProduit] = useState<Produit | null>(null);

  useEffect(() => {
    if (isEdit && productId) {
      const chargerProduit = async () => {
        try {
          const res = await produitService.getById(productId);
          if (res.success && res.data) {
            const p = res.data;
            setProduit(p);
            setFormData({
              nom: p.nom,
              prix_catalogue: p.prix_catalogue?.toString() || '',
              cout_revient: p.cout_revient?.toString() || '',
            });
          }
        } catch (err) {
          console.error('Erreur chargement produit:', err);
        } finally {
          setLoading(false);
        }
      };
      chargerProduit();
    }
  }, [productId, isEdit]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.prix_catalogue || parseFloat(formData.prix_catalogue) < 0)
      newErrors.prix_catalogue = 'Prix invalide';
    if (formData.cout_revient && parseFloat(formData.cout_revient) < 0)
      newErrors.cout_revient = 'Coût invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoadingSubmit(true);
    try {
      const data = {
        nom: formData.nom.trim(),
        prix_catalogue: parseFloat(formData.prix_catalogue) || 0,
        cout_revient: parseFloat(formData.cout_revient) || 0,
      };

      if (isEdit && productId) {
        await produitService.update(productId, data);
      } else {
        await produitService.creer(data);
      }

      Alert.alert('Succès', `Produit ${isEdit ? 'modifié' : 'créé'} avec succès !`);
      return true;
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
      return false;
    } finally {
      setLoadingSubmit(false);
    }
  }, [formData, isEdit, productId, validateForm]);

  return {
    formData, errors, loading, loadingSubmit, isEdit, produit,
    updateField, validateForm, handleSubmit,
  };
};