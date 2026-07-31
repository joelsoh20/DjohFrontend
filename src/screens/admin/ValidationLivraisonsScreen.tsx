import React, { useMemo, useState, useEffect } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet,
  RefreshControl, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCommandes } from '../../hooks/useCommandes';
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
  } = useCommandes({ statut: 'recue', limit: 100 });

  const [selectedGroupe, setSelectedGroupe] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [fraisChoisi, setFraisChoisi] = useState(1000);
  const [showAnnulation, setShowAnnulation] = useState(false);
  const [groupeToAnnuler, setGroupeToAnnuler] = useState<any>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [valideesLocales, setValideesLocales] = useState<string[]>([]);

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

  const commandesGroupees = useMemo(() => {
    const groupeMap = new Map<string, any>();
    for (const cmd of commandesFiltrees) {
      if (!cmd) continue;
      const key = (cmd as any).group_id || cmd.id;
      if (!groupeMap.has(key)) {
        groupeMap.set(key, {
          id: key,
          client_nom: cmd.client_nom,
          client_telephone: cmd.client_telephone,
          client_quartier: cmd.client_quartier,
          commercial_nom: (cmd as any).commercial?.nom || 'Inconnu',
          date_creation: cmd.date_creation,
          statut: cmd.statut,
          produits: [],
          total: 0,
          commandes: [],
          firstId: cmd.id,
        });
      }
      const groupe = groupeMap.get(key);
      groupe.commandes.push(cmd);
      groupe.total += Number(cmd.prix_unitaire_reel) * cmd.quantite;
      groupe.produits.push({
        nom: (cmd as any).produit?.nom || 'Inconnu',
        quantite: cmd.quantite,
        prix: Number(cmd.prix_unitaire_reel),
      });
    }
    return Array.from(groupeMap.values())
      .filter(g => g && g.id)
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, [commandesFiltrees]);

  const handleValidee = (item: any) => {
    setValideesLocales(prev => [...prev, item.id]);
    for (const cmd of item.commandes) {
      commandeService.updateStatut(cmd.id, 'validee').catch(() => {});
    }
    const produits = item.produits.map((p: any) => `📌 ${p.nom} x${p.quantite}`).join('\n');
    Clipboard.setStringAsync(`🛍️ *NDJOH AGOGO*\n\n📦 *Nature du produit* :\n${produits}\n\n📞 *Numéro du client* :\n${item.client_telephone || 'N/A'}\n\n📍 *Adresse de livraison*\n${item.client_quartier || 'N/A'}\n\n💰 *Montant à percevoir*\n${formatMonnaie(item.total)}`);
    Alert.alert('✅ Copié !', 'Message WhatsApp prêt à être envoyé.');
    onRefresh();
  };

  const openValidation = (groupe: any) => {
    setSelectedGroupe(groupe);
    setShowValidation(true);
  };

  const handleServiceSelect = async (serviceId: string) => {
    if (selectedGroupe) {
      for (const cmd of selectedGroupe.commandes) {
        try { await handleValider(cmd.id, fraisChoisi, serviceId); } catch {}
      }
    }
    setShowValidation(false);
    setSelectedGroupe(null);
    onRefresh();
  };

  const handleAnnulerGroupe = (groupe: any) => {
    setGroupeToAnnuler(groupe);
    setMotifAnnulation('');
    setShowAnnulation(true);
  };

  const confirmAnnulation = async () => {
    if (groupeToAnnuler) {
      for (const cmd of groupeToAnnuler.commandes) {
        try { await handleAnnuler(cmd.id, motifAnnulation); } catch {}
      }
    }
    setShowAnnulation(false);
    setGroupeToAnnuler(null);
    onRefresh();
  };

  if (loading && commandesFiltrees.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  const enAttente = commandesGroupees.filter(item => item.statut === 'recue');
  const validees = commandesGroupees.filter(item => item.statut === 'validee' || item.statut === 'livree_payee' || item.statut === 'annulee');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={searchText} onChangeText={setSearchText} />
      <TouchableOpacity style={[styles.historyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('ListeCommandes')}>
        <Ionicons name="time-outline" size={20} color={theme.primary} />
        <Text style={[styles.historyBtnText, { color: theme.primary }]}>Voir l'historique</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
      </TouchableOpacity>

      {commandesGroupees.length === 0 ? (
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
                estVert={valideesLocales.includes(item.id)}
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