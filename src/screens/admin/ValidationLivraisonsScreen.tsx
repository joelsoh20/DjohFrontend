import React, { useMemo, useState, useEffect } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet,
  RefreshControl, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCommandes } from '../../hooks/useCommandes';
import { Commande, StatutCommande } from '../../types';
import { SearchBar } from '../../components/validation/SearchBar';
import { EmptyValidation } from '../../components/validation/EmptyValidation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { commandeService } from '../../services/commandeService';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { CommentairesModal } from '../../components/validation/CommentairesModal';
import { CommandeValidationCard } from '../../components/validation/CommandeValidationCard';
import { ValidationModal } from '../../components/validation/ValidationModal';
import { AnnulationModal } from '../../components/validation/AnnulationModal';

export const ValidationLivraisonsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    loading, refreshing,
    onRefresh, handleValider, handleAnnuler,
    searchText, setSearchText, commandesFiltrees,
  } = useCommandes({ limit: 100 });

  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [fraisChoisi, setFraisChoisi] = useState(1000);
  const [showAnnulation, setShowAnnulation] = useState(false);
  const [commandeToAnnuler, setCommandeToAnnuler] = useState<Commande | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [valideesLocales, setValideesLocales] = useState<string[]>([]);
  const [commandesValideesLocales, setCommandesValideesLocales] = useState<Commande[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('commandesValidees').then(data => {
      if (data) setCommandesValideesLocales(JSON.parse(data));
    });
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!loading) onRefresh();
    });
    return unsubscribe;
  }, [navigation, onRefresh, loading]);

  React.useEffect(() => {
    const interval = setInterval(() => onRefresh(), 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleValidee = (item: Commande) => {
    setValideesLocales(prev => [...prev, item.id]);
    const nouvellesValidees = commandesValideesLocales.find(c => c.id === item.id)
      ? commandesValideesLocales
      : [...commandesValideesLocales, { ...item, statut: 'validee' as StatutCommande }];
    setCommandesValideesLocales(nouvellesValidees);
    AsyncStorage.setItem('commandesValidees', JSON.stringify(nouvellesValidees));
    commandeService.updateStatut(item.id, 'validee').catch(() => {});

    const lignes = item.lignes || [];
    const produits = lignes.map(l => `📌 ${l.produit?.nom || 'Inconnu'} x${l.quantite}`).join('\n');
    const montant = item.prix_total ?? lignes.reduce((s, l) => s + Number(l.prix_unitaire_reel) * l.quantite, 0);
    Clipboard.setStringAsync(`🛍️ *NDJOH AGOGO*\n\n📦 *Nature du produit* :\n${produits}\n\n📞 *Numéro du client* :\n${item.client_telephone || 'N/A'}\n\n📍 *Adresse de livraison*\n${item.client_quartier || 'N/A'}\n\n💰 *Montant à percevoir*\n${formatMonnaie(montant)}`);
    Alert.alert('✅ Copié !', 'Message WhatsApp prêt à être envoyé.');
  };

  const openValidation = (commande: Commande) => {
    setSelectedCommande(commande);
    setShowValidation(true);
  };

  const handleServiceSelect = async (serviceId: string) => {
    if (selectedCommande) {
      try { await handleValider(selectedCommande.id, fraisChoisi, serviceId); } catch {}
    }
    setShowValidation(false);
    setSelectedCommande(null);
    onRefresh();
  };

  const handleAnnulerGroupe = (commande: Commande) => {
    setCommandeToAnnuler(commande);
    setMotifAnnulation('');
    setShowAnnulation(true);
  };

  const confirmAnnulation = async () => {
    if (commandeToAnnuler) {
      try { await handleAnnuler(commandeToAnnuler.id, motifAnnulation); } catch {}
    }
    setShowAnnulation(false);
    setCommandeToAnnuler(null);
    onRefresh();
  };

  // ✅ Tous les hooks sont ici, AVANT tout return conditionnel
  const toutesCommandes = useMemo(() => {
    const fusion: Commande[] = [...commandesFiltrees];
    for (const cmd of commandesValideesLocales) {
      if (!fusion.find(c => c.id === cmd.id)) {
        fusion.push(cmd);
      }
    }
    return fusion.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, [commandesFiltrees, commandesValideesLocales]);

  const enAttente = toutesCommandes.filter(item =>
    item.statut === 'recue' || item.statut === 'validee'
  );
  const validees = toutesCommandes.filter(item =>
    item.statut === 'livree_payee' || item.statut === 'annulee'
  );

  if (loading && commandesFiltrees.length === 0 && commandesValideesLocales.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={searchText} onChangeText={setSearchText} />
      <TouchableOpacity style={[styles.historyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('ListeCommandes')}>
        <Ionicons name="time-outline" size={20} color={theme.primary} />
        <Text style={[styles.historyBtnText, { color: theme.primary }]}>Voir l'historique</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
      </TouchableOpacity>

      {toutesCommandes.length === 0 ? (
        <EmptyValidation hasSearchText={searchText.length > 0} />
      ) : (
        <ScrollView
          style={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <View style={[styles.sectionHeader, { backgroundColor: theme.warningLight }]}>
            <Ionicons name="time-outline" size={18} color={theme.warning} />
            <Text style={[styles.sectionTitle, { color: theme.warning }]}>En attente ({enAttente.length})</Text>
          </View>
          {enAttente.length === 0 ? (
            <Text style={[styles.sectionEmpty, { color: theme.textTertiary }]}>Aucune commande en attente</Text>
          ) : (
            enAttente.map(item => (
              <CommandeValidationCard
                key={item.id}
                item={item}
                theme={theme}
                estVert={valideesLocales.includes(item.id) || item.statut === 'validee'}
                onValidee={handleValidee}
                onAnnulerGroupe={handleAnnulerGroupe}
                onOpenValidation={openValidation}
                onShowComments={setShowCommentsFor}
              />
            ))
          )}

          {validees.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { backgroundColor: theme.secondaryLight, marginTop: 8 }]}>
                <Ionicons name="checkmark-done-outline" size={18} color={theme.secondary} />
                <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Historique ({validees.length})</Text>
              </View>
              {validees.map(item => (
                <CommandeValidationCard
                  key={item.id}
                  item={item}
                  theme={theme}
                  estVert={true}
                  onValidee={handleValidee}
                  onAnnulerGroupe={handleAnnulerGroupe}
                  onOpenValidation={openValidation}
                  onShowComments={setShowCommentsFor}
                />
              ))}
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      <ValidationModal
        visible={showValidation}
        onClose={() => setShowValidation(false)}
        fraisChoisi={fraisChoisi}
        onFraisChange={setFraisChoisi}
        onServiceSelect={handleServiceSelect}
        theme={theme}
      />

      <AnnulationModal
        visible={showAnnulation}
        motif={motifAnnulation}
        onMotifChange={setMotifAnnulation}
        onConfirm={confirmAnnulation}
        onClose={() => setShowAnnulation(false)}
        theme={theme}
      />

      <CommentairesModal
        visible={!!showCommentsFor}
        onClose={() => setShowCommentsFor(null)}
        orderId={showCommentsFor || ''}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 30 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 10, padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  historyBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  sectionEmpty: { textAlign: 'center', marginVertical: 12, fontSize: 13 },
});