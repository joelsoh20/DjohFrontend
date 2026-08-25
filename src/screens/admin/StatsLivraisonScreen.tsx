import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useStatsLivraison, PeriodeStatsLivraison } from '../../hooks/useStatsLivraison';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { formatMonnaie } from '../../utils/formatMonnaie';

const PERIODES: { value: PeriodeStatsLivraison; label: string }[] = [
  { value: 'jour', label: "Aujourd'hui" },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois', label: 'Ce mois' },
  { value: 'tout', label: 'Depuis le début' },
];

export const StatsLivraisonScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const { services, loading, refreshing, error, periode, setPeriode, onRefresh } = useStatsLivraison();

  const totaux = services.reduce(
    (acc, s) => ({
      commandes: acc.commandes + s.nombreCommandes,
      valeur: acc.valeur + s.valeurProduitsLivres,
      frais: acc.frais + s.fraisLivraisonTotal,
      benefice: acc.benefice + s.beneficeNet,
    }),
    { commandes: 0, valeur: 0, frais: 0, benefice: 0 }
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name="bicycle" size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Stats services de livraison</Text>
      </View>

      <View style={styles.periodeRow}>
        {PERIODES.map(p => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodeChip, { backgroundColor: periode === p.value ? theme.primary : theme.surfaceVariant }]}
            onPress={() => setPeriode(p.value)}
          >
            <Text style={{ color: periode === p.value ? '#FFF' : theme.text, fontSize: 12, fontWeight: '600' }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && services.length === 0 ? (
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
          {services.length === 0 ? (
            <EmptyState icon="bicycle-outline" title="Aucune donnée" message="Aucune commande livrée sur cette période." />
          ) : (
            <>
              {/* Total global */}
              <View style={[styles.totalCard, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.totalCardTitle, { color: theme.primary }]}>Total ({totaux.commandes} commande{totaux.commandes > 1 ? 's' : ''})</Text>
                <View style={styles.totalCardRow}>
                  <View>
                    <Text style={[styles.totalCardLabel, { color: theme.textSecondary }]}>Produits livrés</Text>
                    <Text style={[styles.totalCardValue, { color: theme.text }]}>{formatMonnaie(totaux.valeur)}</Text>
                  </View>
                  <View>
                    <Text style={[styles.totalCardLabel, { color: theme.textSecondary }]}>Frais de livraison</Text>
                    <Text style={[styles.totalCardValue, { color: theme.warning }]}>{formatMonnaie(totaux.frais)}</Text>
                  </View>
                  {isAdmin && (
                    <View>
                      <Text style={[styles.totalCardLabel, { color: theme.textSecondary }]}>Bénéfice net</Text>
                      <Text style={[styles.totalCardValue, { color: totaux.benefice >= 0 ? theme.secondary : theme.danger }]}>
                        {formatMonnaie(totaux.benefice)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Détail par service */}
              {services.map(s => (
                <View key={s.serviceId} style={[styles.card, { backgroundColor: theme.surface }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.serviceName, { color: theme.text }]} numberOfLines={1}>{s.nom}</Text>
                    {!s.actif && (
                      <View style={[styles.inactifBadge, { backgroundColor: theme.dangerLight }]}>
                        <Text style={[styles.inactifText, { color: theme.danger }]}>Inactif</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.nombreCommandes, { color: theme.textTertiary }]}>
                    {s.nombreCommandes} commande{s.nombreCommandes > 1 ? 's' : ''} livrée{s.nombreCommandes > 1 ? 's' : ''}
                  </Text>

                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>💰 Valeur produits livrés</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>{formatMonnaie(s.valeurProduitsLivres)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>🚚 Frais de livraison payés</Text>
                    <Text style={[styles.statValue, { color: theme.warning }]}>{formatMonnaie(s.fraisLivraisonTotal)}</Text>
                  </View>
                  {isAdmin && (
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>📈 Bénéfice net</Text>
                      <Text style={[styles.statValue, { color: s.beneficeNet >= 0 ? theme.secondary : theme.danger, fontWeight: 'bold' }]}>
                        {formatMonnaie(s.beneficeNet)}
                      </Text>
                    </View>
                  )}

                  {/* Répartition du nombre de livraisons par montant de
                      frais (1000 FCFA, 1500 FCFA...) pour ce service. */}
                  {s.repartitionFrais && s.repartitionFrais.length > 0 && (
                    <>
                      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                      <Text style={[styles.repartitionTitle, { color: theme.textSecondary }]}>
                        Livraisons par montant de frais
                      </Text>
                      {s.repartitionFrais.map(r => (
                        <View key={r.montant} style={styles.statRow}>
                          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            {formatMonnaie(r.montant)}
                          </Text>
                          <Text style={[styles.statValue, { color: theme.text }]}>
                            {r.nombre} livraison{r.nombre > 1 ? 's' : ''}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
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
  periodeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 4 },
  periodeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
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
  nombreCommandes: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 10 },
  repartitionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 14, fontWeight: '600' },
});
