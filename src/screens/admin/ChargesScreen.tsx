import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCharges } from '../../hooks/useCharges';
import { ChargeListItem } from '../../components/charges/ChargeListItem';
import { ResumeMensuelCard } from '../../components/charges/ResumeMensuelCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { formatMonnaie } from '../../utils/formatMonnaie';

export const ChargesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    loading, refreshing,
    typeFilter, setTypeFilter,
    charges,
    chargesFiltrees,
    totalCharges,
    resume,
    onRefresh, handleDelete,
  } = useCharges();

  const maintenant = new Date();
const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
const chargesMois = charges.filter(c => new Date(c.date) >= debutMois);
const totalChargesMois = chargesMois.reduce((sum, c) => sum + c.montant, 0);

  const { refresh } = useCharges();
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  const typesUniques = useMemo(() => {
    const types = [...new Set((charges || []).map((c: any) => c.type))];
    return ['tous', ...types];
  }, [charges]);

  const filters = typesUniques.map(type => ({
    value: type,
    label: type === 'tous' ? t('common.all') : type.charAt(0).toUpperCase() + type.slice(1),
    icon: 'pricetag' as const,
    color: typeFilter === type ? theme.primary : theme.textSecondary,
  }));

  if (loading && chargesFiltrees.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Résumé */}
      <View style={[styles.summaryCard, { backgroundColor: theme.primaryLight }]}>
  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total charges du mois</Text>
  <Text style={[styles.summaryValue, { color: theme.text }]}>
    {formatMonnaie(totalChargesMois)}
  </Text>
</View>

      {/* Filtres dynamiques */}
      <View style={styles.filterRow}>
        {filters.map(f => {
          const isActive = typeFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.surfaceVariant }]}
              onPress={() => setTypeFilter(f.value)}
            >
              <Ionicons name={f.icon as any} size={14} color={isActive ? '#FFF' : theme.primary} />
              <Text style={[styles.filterText, { color: isActive ? '#FFF' : theme.textSecondary }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={chargesFiltrees}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ResumeMensuelCard resume={resume} />}
        renderItem={({ item }) => (
          <ChargeListItem
            charge={item}
            onPress={(c) => navigation.navigate('FormulaireCharge', { chargeId: c.id })}
            onDelete={handleDelete}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={<EmptyState icon="cash-outline" title="Aucune charge trouvée" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={chargesFiltrees.length === 0 ? styles.emptyContainer : styles.listContent}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('FormulaireCharge')}
      >
        <Ionicons name="add" size={22} color="#FFF" />
        <Text style={styles.addButtonText}>{t('charge.new')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { paddingHorizontal: 12, paddingTop: 12 },
  summaryCard: { padding: 16, borderRadius: 14, alignItems: 'center' },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18 },
  filterText: { fontSize: 13, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, marginVertical: 10, paddingVertical: 12, borderRadius: 12 },
  addButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  listContent: { paddingBottom: 100 },
  emptyContainer: { flexGrow: 1 },
});