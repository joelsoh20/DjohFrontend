import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCommissions } from '../../hooks/useCommissions';
import { CommissionGlobale } from '../../components/commissions/CommissionGlobale';
import { CommercialCommissionCard } from '../../components/commissions/CommercialCommissionCard';
import { CommissionProduitModal } from '../../components/commissions/CommissionProduitModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export const CommissionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const {
    commerciaux, produits, commissionGlobale, loading,
    setCommissionGlobale, updateCommissionGlobale,
    selectedCommercial, selectCommercial,
    commissionsProduits, bonusPaliers,
    updateCommissionMode,
    addCommissionProduit, removeCommissionProduit,
    addBonusPalier, removeBonusPalier,
    updateCommissionDefaut,
  } = useCommissions();

  if (!isAdmin) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="lock-closed" size={48} color={theme.textTertiary} />
        <Text style={[styles.title, { color: theme.textSecondary, marginTop: 16 }]}>Accès réservé à l'administrateur</Text>
      </View>
    );
  }

  if (loading && commerciaux.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={commerciaux}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <CommissionGlobale
            value={commissionGlobale}
            onChange={setCommissionGlobale}
            onUpdate={updateCommissionGlobale}
            loading={false}
          />
        }
        renderItem={({ item }) => (
          <CommercialCommissionCard
            commercial={item}
            onPress={selectCommercial}
            onToggleMode={updateCommissionMode}
          />
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Aucun commercial trouvé" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={commerciaux.length === 0 ? styles.emptyContainer : styles.listContent}
      />

      <CommissionProduitModal
        visible={!!selectedCommercial}
        onClose={() => selectCommercial(null)}
        commercial={selectedCommercial}
        produits={produits}
        commissionsProduits={commissionsProduits}
        bonusPaliers={bonusPaliers}
        onAdd={addCommissionProduit}
        onRemove={removeCommissionProduit}
        onUpdateDefaut={updateCommissionDefaut}
        onAddBonus={addBonusPalier}
        onRemoveBonus={removeBonusPalier}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 30 },
  emptyContainer: { flexGrow: 1 },
  title: { fontSize: 16, textAlign: 'center' },
});