import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { clotureService } from '../services/clotureService';
import { dashboardService } from '../services/dashboardService';
import { MonthlyClosing, DashboardData, ActionCommandesEnAttente } from '../types';

interface UseClotureReturn {
  dashboard: DashboardData | null;
  clotures: MonthlyClosing[];
  loading: boolean;
  loadingCloture: boolean;
  error: string | null;
  moisActuel: { mois: number; annee: number; nom: string };
  commandesEnAttenteAction: ActionCommandesEnAttente;
  setCommandesEnAttenteAction: (action: ActionCommandesEnAttente) => void;
  showConfirmModal: boolean;
  setShowConfirmModal: (show: boolean) => void;
  moisDejaCloture: boolean;
  peutCloturer: boolean;
  messageErreur: string;
  handleCloturer: () => Promise<void>;
  refresh: () => void;
}

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const useCloture = (): UseClotureReturn => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [clotures, setClotures] = useState<MonthlyClosing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCloture, setLoadingCloture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commandesEnAttenteAction, setCommandesEnAttenteAction] = useState<ActionCommandesEnAttente>('reportees');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const maintenant = new Date();
  const moisActuel = {
    mois: maintenant.getMonth() + 1,
    annee: maintenant.getFullYear(),
    nom: MOIS_NOMS[maintenant.getMonth()],
  };

  const chargerDonnees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashRes, cloturesRes] = await Promise.all([
        dashboardService.getDashboard(),
        clotureService.getAll(),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboard(dashRes.data);
      }

      if (cloturesRes.success && cloturesRes.data) {
        setClotures(Array.isArray(cloturesRes.data) ? cloturesRes.data : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerDonnees(); }, [chargerDonnees]);
  const refresh = useCallback(() => chargerDonnees(), [chargerDonnees]);

  // Vérifier si le mois est déjà clôturé
  const moisDejaCloture = useMemo(() => {
    return clotures.some(c => c.mois === moisActuel.mois && c.annee === moisActuel.annee);
  }, [clotures, moisActuel]);

  // Vérifier l'ordre chronologique
  const peutCloturer = useMemo(() => {
    if (moisDejaCloture) return false;

    // Vérifier qu'aucun mois postérieur n'est clôturé
    const cloturePosterieure = clotures.find(c => {
      if (c.annee > moisActuel.annee) return true;
      if (c.annee === moisActuel.annee && c.mois > moisActuel.mois) return true;
      return false;
    });

    return !cloturePosterieure;
  }, [clotures, moisActuel, moisDejaCloture]);

  const messageErreur = useMemo(() => {
    if (moisDejaCloture) return 'Ce mois est déjà clôturé.';
    if (!peutCloturer) return 'Un mois postérieur est déjà clôturé. Veuillez respecter l\'ordre chronologique.';
    return '';
  }, [moisDejaCloture, peutCloturer]);

  const handleCloturer = useCallback(async () => {
    setLoadingCloture(true);
    try {
      const response = await clotureService.cloturer({
        mois: moisActuel.mois,
        annee: moisActuel.annee,
        commandes_en_attente_action: commandesEnAttenteAction,
      });

      if (response.success) {
        Alert.alert('Succès', 'Mois clôturé avec succès !');
        setShowConfirmModal(false);
        await chargerDonnees();
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de la clôture');
    } finally {
      setLoadingCloture(false);
    }
  }, [moisActuel, commandesEnAttenteAction, chargerDonnees]);

  return {
    dashboard,
    clotures,
    loading,
    loadingCloture,
    error,
    moisActuel,
    commandesEnAttenteAction,
    setCommandesEnAttenteAction,
    showConfirmModal,
    setShowConfirmModal,
    moisDejaCloture,
    peutCloturer,
    messageErreur,
    handleCloturer,
    refresh,
  };
};