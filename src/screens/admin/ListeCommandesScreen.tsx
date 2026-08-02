import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useListeCommandes } from '../../hooks/useListeCommandes';
import { Commande } from '../../types';
import { SearchBar } from '../../components/validation/SearchBar';
import { CommandesFilterBar } from '../../components/commandes-liste/CommandesFilterBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { AnnulationModal } from '../../components/validation/AnnulationModal';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateCourte } from '../../utils/formatDate';
import { commandeService } from '../../services/commandeService';
import { CommentModal } from '../../components/commande/CommentModal';

export const ListeCommandesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAdmin, isManager } = useAuth();

  const {
    loading,
    refreshing,
    filters,
    setStatut,
    setSearchText,
    commandesFiltrees,
    onRefresh,
    loadMore,
  } = useListeCommandes();

  const { refresh } = useListeCommandes();
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  // État pour la modale de discussion
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  // État pour la modale d'annulation (motif obligatoire, notifie le commercial)
  const [commandeAAnnuler, setCommandeAAnnuler] = useState<Commande | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [annulationEnCours, setAnnulationEnCours] = useState(false);

  const confirmerAnnulation = async () => {
    if (!commandeAAnnuler) return;
    setAnnulationEnCours(true);
    try {
      await commandeService.updateStatut(commandeAAnnuler.id, 'annulee', undefined, undefined, motifAnnulation);
      Alert.alert('Succès', 'Commande annulée, stock restauré et commercial notifié.');
      setCommandeAAnnuler(null);
      setMotifAnnulation('');
      refresh();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setAnnulationEnCours(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'recue':
        return theme.warning;
      case 'livree_payee':
        return theme.secondary;
      case 'annulee':
        return theme.danger;
      default:
        return theme.textTertiary;
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'recue':
        return 'En attente';
      case 'livree_payee':
        return 'Livrée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  };

  if (loading && commandesFiltrees.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={filters.searchText} onChangeText={setSearchText} />
      <CommandesFilterBar
        statutActif={filters.statut}
        onStatutChange={setStatut}
        total={commandesFiltrees.length}
      />

      <FlatList
        data={commandesFiltrees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Commande }) => {
          const lignes = item.lignes || [];
          const total = item.prix_total ?? lignes.reduce((s, l) => s + Number(l.prix_unitaire_reel) * l.quantite, 0);

          // Admin et manager peuvent annuler une commande livrée à tout
          // moment (pour corriger une erreur) — plus de limite d'1h.
          const peutAnnuler = item.statut === 'livree_payee' && (isAdmin || isManager);

          return (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clientName, { color: theme.text }]}>
                    👤 {item.client_nom}
                  </Text>
                  <Text style={[styles.info, { color: theme.textTertiary }]}>
                    📱 {item.client_telephone || 'N/A'} • 📍{' '}
                    {item.client_quartier || 'N/A'}
                  </Text>
                  <Text style={[styles.info, { color: theme.textTertiary }]}>
                    {formatDateCourte(item.date_creation)}
                  </Text>
                  <Text style={[styles.info, { color: theme.textTertiary }]}>
                    👩‍💼 {item.commercial?.nom || 'Inconnu'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getStatutColor(item.statut) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getStatutColor(item.statut) },
                    ]}
                  >
                    {getStatutLabel(item.statut)}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                📦 Produits :
              </Text>
              {lignes.map((l, i) => (
                <Text key={l.id || i} style={[styles.produit, { color: theme.text }]}>
                  • {l.produit?.nom || 'Inconnu'} x{l.quantite}
                </Text>
              ))}

              {item.statut === 'annulee' && item.motif_annulation && (
                <View style={[styles.motifBox, { backgroundColor: theme.dangerLight }]}>
                  <Text style={[styles.motifLabel, { color: theme.danger }]}>Motif d'annulation :</Text>
                  <Text style={[styles.motifText, { color: theme.text }]}>{item.motif_annulation}</Text>
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: theme.text }]}>
                  {formatMonnaie(total)}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {/* Bouton Modifier (admin/manager, seulement si en attente) */}
                {item.statut === 'recue' && (isAdmin || isManager) && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: theme.primary }]}
                    onPress={() =>
                      Alert.alert(
                        'Modifier',
                        'Redirection vers la modification en cours de développement.'
                      )
                    }
                  >
                    <Ionicons name="create-outline" size={14} color={theme.primary} />
                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                      Modifier
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Bouton Discussion */}
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: theme.primary }]}
                  onPress={() => setShowCommentsFor(item.id)}
                >
                  <Ionicons name="chatbubble-outline" size={14} color={theme.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                    Discussion
                  </Text>
                </TouchableOpacity>

                {/* Bouton Annuler (commande livrée — corrige une erreur) */}
                {peutAnnuler && (
                  <TouchableOpacity
                    style={[styles.annulerBtn, { borderColor: theme.danger }]}
                    onPress={() => {
                      setMotifAnnulation('');
                      setCommandeAAnnuler(item);
                    }}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color={theme.danger}
                    />
                    <Text style={[styles.annulerText, { color: theme.danger }]}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState icon="document-text-outline" title="Aucune commande" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          commandesFiltrees.length === 0 ? styles.emptyContainer : styles.listContent
        }
      />

      {/* Modale de discussion */}
      <CommentModal
        visible={!!showCommentsFor}
        onClose={() => setShowCommentsFor(null)}
        orderId={showCommentsFor || ''}
      />

      {/* Modale d'annulation (commande livrée) — motif obligatoire, envoyé au commercial */}
      <AnnulationModal
        visible={!!commandeAAnnuler}
        motif={motifAnnulation}
        onMotifChange={setMotifAnnulation}
        onConfirm={confirmerAnnulation}
        onClose={() => { if (!annulationEnCours) setCommandeAAnnuler(null); }}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1 },
  card: { padding: 16, borderRadius: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  clientName: { fontSize: 16, fontWeight: 'bold' },
  info: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  produit: { fontSize: 13, paddingVertical: 2 },
  motifBox: { borderRadius: 10, padding: 10, marginTop: 10 },
  motifLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  motifText: { fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  annulerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  annulerText: { fontSize: 13, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
