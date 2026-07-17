import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
//import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportService } from '../services/exportService';
import { documentDirectory, downloadAsync } from 'expo-file-system';

interface UseExportsReturn {
  loadingFEC: boolean;
  loadingPDF: boolean;
  loadingBalance: boolean;
  exportFEC: () => Promise<void>;
  exportPDF: (mois?: number, annee?: number) => Promise<void>;
  exportBalance: () => Promise<void>;
}

export const useExports = (): UseExportsReturn => {
  const [loadingFEC, setLoadingFEC] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const telechargerEtPartager = async (url: string, nomFichier: string) => {
    try {
      const fileUri = documentDirectory + nomFichier;
      
      const downloadResult = await downloadAsync(url, fileUri);
      
      if (downloadResult.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: nomFichier.endsWith('.pdf') ? 'application/pdf' : 'text/csv',
            dialogTitle: 'Partager le fichier',
          });
        } else {
          Alert.alert('Succès', `Fichier téléchargé : ${nomFichier}`);
        }
      }
    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de télécharger le fichier');
    }
  };

  const exportFEC = useCallback(async () => {
    setLoadingFEC(true);
    try {
      const response = await exportService.getFEC();
      if (response.success && response.data?.url) {
        await telechargerEtPartager(response.data.url, 'FEC.csv');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur export FEC');
    } finally {
      setLoadingFEC(false);
    }
  }, []);

  const exportPDF = useCallback(async (mois?: number, annee?: number) => {
    setLoadingPDF(true);
    try {
      const response = await exportService.getPDF(mois, annee);
      if (response.success && response.data?.url) {
        await telechargerEtPartager(response.data.url, `Rapport_${mois || 'mois'}_${annee || 'annee'}.pdf`);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur export PDF');
    } finally {
      setLoadingPDF(false);
    }
  }, []);

  const exportBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const response = await exportService.getBalance();
      if (response.success && response.data?.url) {
        await telechargerEtPartager(response.data.url, 'Balance.csv');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur export Balance');
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  return {
    loadingFEC, loadingPDF, loadingBalance,
    exportFEC, exportPDF, exportBalance,
  };
};