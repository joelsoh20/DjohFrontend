import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useStatsLivraisonJour } from '../../hooks/useStatsLivraisonJour';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { CalendrierModal } from '../../components/CalendrierModal';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { StatsServiceLivraison } from '../../types';

type Onglet = 'jour' | 'hier' | 'date';

const formatDateAffichage = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const StatsLivraisonJourScreen: React.FC = () => {
  const { theme } = useTheme();
  const { jour, hier, loading, refreshing, error, onRefresh, chargerPourDate, loadingDate } = useStatsLivraisonJour();
  const [onglet, setOnglet] = useState<Onglet>('jour');
  const [showCalendrier, setShowCalendrier] = useState(false);
  const [dateChoisie, setDateChoisie] = useState<Date | null>(null);
  const [donneesDate, setDonneesDate] = useState<StatsServiceLivraison[]>([]);

  const handleDateSelect = async (date: Date) => {
    setDateChoisie(date);
    setOnglet('date');
    const services = await chargerPourDate(date);
    setDonneesDate(services);
  };

  const donnees = onglet === 'jour' ? jour : onglet === 'hier' ? hier : donneesDate;
  const totaux = donnees.reduce(
    (acc, s) => ({
      produits: acc.produits + s.nombreProduitsLivres,
      valeur: acc.valeur + s.valeurProduitsLivres,
      frais: acc.frais + s.fraisLivraisonTotal,
      aPercevoir: acc.aPercevoir + s.montantAPercevoir,
    }),
    { produits: 0, valeur: 0, frais: 0, aPercevoir: 0 }
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name="cash" size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Encaissements livraison</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: onglet === 'jour' ? theme.primary : theme.surfaceVariant }]}
          onPress={() => setOnglet('jour')}
        >
          <Text style={{ color: onglet === 'jour' ? '#FFF' : theme.text, fontWeight: '600', fontSize: 13 }}>Aujourd'hui</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: onglet === 'hier' ? theme.primary : theme.surfaceVariant }]}
          onPress={() => setOnglet('hier')}
        >
          <Text style={{ color: onglet === 'hier' ? '#FFF' : theme.text, fontWeight: '600', fontSize: 13 }}>Hier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabCalendrier, { backgroundColor: onglet === 'date' ? theme.primary : theme.surfaceVariant }]}
          onPress={() => setShowCalendrier(true)}
        >
          <Ionicons name="calendar-outline" size={16} color={onglet === 'date' ? '#FFF' : theme.text} />
        </TouchableOpacity>
      </View>

      {onglet === 'date' && dateChoisie && (
        <View style={styles.dateChoisieRow}>
          <Text style={[styles.dateChoisieText, { color: theme.textSecondary }]}>
            📅 {formatDateAffichage(dateChoisie)}
          </Text>
          <TouchableOpacity onPress={() => setShowCalendrier(true)}>
            <Text style={[styles.dateChoisieLien, { color: theme.primary }]}>Changer</Text>
          </TouchableOpacity>
        </View>
      )}

      <CalendrierModal
        visible={showCalendrier}
        onClose={() => setShowCalendrier(false)}
        onSelect={handleDateSelect}
        dateInitiale={dateChoisie || undefined}
      />

      {(loading && jour.length === 0 && hier.length === 0) || (onglet === 'date' && loadingDate) ? (
        <LoadingSpinner fullScreen message="Chargement..." />
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: theme.danger }}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {donnees.length === 0 ? (
            <EmptyState icon="cash-outline" title="Aucune donnée" message="Aucune commande livrée sur cette journée." />
          ) : (
            <>
              <View style={[styles.totalCard, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.totalCardTitle, { color: theme.primary }]}>
                  Total {onglet === 'jour' ? "d'aujourd'hui" : onglet === 'hier' ? "d'hier" : `du ${dateChoisie ? formatDateAffichage(dateChoisie) : ''}`}
                </Text>
                <View style={styles.totalCardRow}>
                  <View>
                    <Text style={[styles.totalCardLabel, { color: theme.textSecondary }]}>Produits livrés</Text>
                    <Text style={[styles.totalCardValue, { color: theme.text }]}>{totaux.produits}</Text>
                  </View>
                  <View>
                    <Text style={[styles.totalCardLabel, { color: theme.textSecondary }]}>Ventes</Text>
                    <Text style={[styles.totalCardValue, { color: theme.text }]}>{formatMonnaie(totaux.valeur)}</Text>
                  </View>
                  <View>
                    <Text style={[styles.totalCardLabel, { color: theme.textSecondary }]}>À percevoir</Text>
                    <Text style={[styles.totalCardValue, { color: theme.secondary }]}>{formatMonnaie(totaux.aPercevoir)}</Text>
                  </View>
                </View>
              </View>

              {donnees.map((s: StatsServiceLivraison) => (
                <View key={s.serviceId} style={[styles.card, { backgroundColor: theme.surface }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.serviceName, { color: theme.text }]} numberOfLines={1}>{s.nom}</Text>
                    {!s.actif && (
                      <View style={[styles.inactifBadge, { backgroundColor: theme.dangerLight }]}>
                        <Text style={[styles.inactifText, { color: theme.danger }]}>Inactif</Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>📦 Produits livrés</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>{s.nombreProduitsLivres} ({s.nombreCommandes} cmd)</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>💰 Montant des commandes</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>{formatMonnaie(s.valeurProduitsLivres)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>🚚 Frais de livraison</Text>
                    <Text style={[styles.statValue, { color: theme.warning }]}>− {formatMonnaie(s.fraisLivraisonTotal)}</Text>
                  </View>
                  <View style={[styles.statRow, styles.statRowFinal, { borderTopColor: theme.divider }]}>
                    <Text style={[styles.statLabel, { color: theme.text, fontWeight: '700' }]}>À percevoir</Text>
                    <Text style={[styles.statValue, { color: theme.secondary, fontSize: 16, fontWeight: 'bold' }]}>
                      {formatMonnaie(s.montantAPercevoir)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabCalendrier: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dateChoisieRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  dateChoisieText: { fontSize: 13, fontWeight: '600' },
  dateChoisieLien: { fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  totalCard: { borderRadius: 14, padding: 16, marginBottom: 16 },
  totalCardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  totalCardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalCardLabel: { fontSize: 11, marginBottom: 4 },
  totalCardValue: { fontSize: 15, fontWeight: 'bold' },
  card: { borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  inactifBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  inactifText: { fontSize: 10, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statRowFinal: { marginTop: 6, paddingTop: 10, borderTopWidth: 1 },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 14, fontWeight: '600' },
});
