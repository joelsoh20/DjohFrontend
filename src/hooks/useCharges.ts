import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { chargeService } from '../services/chargeService';
import { Charge, TypeCharge } from '../types';

interface ResumeMensuel {
  commissionsMois: { nom: string; montant: number }[];
  totalCommissionsMois: number;
  totalLivraisonMois: number;
  historiquePaiements: {
    mois: number;
    annee: number;
    totalCommissions: number;
    commissions: { nom: string; montant_du: number }[];
  }[];
}

interface UseChargesReturn {
  charges: Charge[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  typeFilter: TypeCharge | 'tous';
  setTypeFilter: (type: TypeCharge | 'tous') => void;
  chargesFiltrees: Charge[];
  totalPublicite: number;
  totalEchantillons: number;
  totalCharges: number;
  resume: ResumeMensuel | null;
  refresh: () => void;
  onRefresh: () => void;
  handleDelete: (id: string, description: string) => void;
}

export const useCharges = (): UseChargesReturn => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeCharge | 'tous'>('tous');
  const [resume, setResume] = useState<ResumeMensuel | null>(null);

  const chargerCharges = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await chargeService.getAll();
      if (response.success && response.data) {
        setCharges(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { chargerCharges(); }, [chargerCharges]);

  // Charger le résumé mensuel
  useEffect(() => {
  const chargerResume = async () => {
    try {
      const res = await chargeService.getResumeMensuel();
      if (res?.success) setResume(res.data);
    } catch (err) {
      // Ignorer l'erreur silencieusement
      console.log('Resume mensuel non disponible');
    }
  };
  chargerResume();
}, [charges]);

  const refresh = useCallback(() => chargerCharges(false), [chargerCharges]);
  const onRefresh = useCallback(() => chargerCharges(true), [chargerCharges]);

  const handleDelete = useCallback((id: string, description: string) => {
    Alert.alert(
      'Supprimer la charge ?',
      `"${description}" sera supprimée définitivement.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await chargeService.delete(id);
              setCharges(prev => prev.filter(c => c.id !== id));
            } catch (err: any) {
              Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
            }
          },
        },
      ]
    );
  }, []);

  const chargesFiltrees = useMemo(() => {
    if (typeFilter === 'tous') return charges;
    return charges.filter(c => c.type === typeFilter);
  }, [charges, typeFilter]);

  const totalPublicite = useMemo(
    () => charges.filter(c => c.type === 'publicite').reduce((sum, c) => sum + c.montant, 0),
    [charges]
  );

  const totalEchantillons = useMemo(
    () => charges.filter(c => c.type === 'echantillon').reduce((sum, c) => sum + c.montant, 0),
    [charges]
  );

  const totalCharges = totalPublicite + totalEchantillons;

  return {
    charges, loading, refreshing, error,
    typeFilter, setTypeFilter,
    chargesFiltrees,
    totalPublicite, totalEchantillons, totalCharges,
    resume,
    refresh, onRefresh,
    handleDelete,
  };
};