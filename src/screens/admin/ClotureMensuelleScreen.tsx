import React from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCloture } from '../../hooks/useCloture';
import { ClotureRecapCard } from '../../components/cloture/ClotureRecapCard';
import { CommissionsClotureCard } from '../../components/cloture/CommissionsClotureCard';
import { CommandesEnAttenteCard } from '../../components/cloture/CommandesEnAttenteCard';
import { ClotureConfirmModal } from '../../components/cloture/ClotureConfirmModal';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ClotureMensuelleScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    dashboard,
    commissionsMois,
    totalCommissionsMois,
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
  } = useCloture();

  if (loading && !dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      </View>
    );
  }

  const nombreCommandesEnAttente = dashboard.jour.nombreCommandes || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <Ionicons name="calendar" size={28} color={theme.primary} />
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {t('cloture.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {moisActuel.nom} {moisActuel.annee}
            </Text>
          </View>
        </View>

        {/* Message si déjà clôturé */}
        {moisDejaCloture && (
          <View style={[styles.clotureBadge, { backgroundColor: theme.secondaryLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.secondary} />
            <Text style={[styles.clotureBadgeText, { color: theme.secondary }]}>
              {t('cloture.alreadyClosed')}
            </Text>
          </View>
        )}

        {/* Message d'erreur */}
        {!peutCloturer && !moisDejaCloture && (
          <View style={[styles.errorBadge, { backgroundColor: theme.dangerLight }]}>
            <Ionicons name="alert-circle" size={20} color={theme.danger} />
            <Text style={[styles.errorBadgeText, { color: theme.danger }]}>
              {messageErreur}
            </Text>
          </View>
        )}

        {/* Récapitulatif */}
        <ClotureRecapCard
          dashboard={dashboard}
          moisNom={moisActuel.nom}
          annee={moisActuel.annee}
        />

        {/* Commissions */}
        <CommissionsClotureCard commissions={commissionsMois} total={totalCommissionsMois} />

        {/* Commandes en attente */}
        {peutCloturer && !moisDejaCloture && (
          <CommandesEnAttenteCard
            nombreCommandes={nombreCommandesEnAttente}
            action={commandesEnAttenteAction}
            onActionChange={setCommandesEnAttenteAction}
          />
        )}

        {/* Bouton de clôture */}
        {peutCloturer && !moisDejaCloture && (
          <View style={styles.buttonContainer}>
            <Button
              title="🔒 Clôturer définitivement"
              onPress={() => setShowConfirmModal(true)}
              variant="primary"
              style={styles.clotureButton}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de confirmation */}
      <ClotureConfirmModal
        visible={showConfirmModal}
        moisNom={moisActuel.nom}
        annee={moisActuel.annee}
        loading={loadingCloture}
        onConfirm={handleCloturer}
        onCancel={() => setShowConfirmModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  clotureBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12,
  },
  clotureBadgeText: { fontSize: 14, fontWeight: '600' },
  errorBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12,
  },
  errorBadgeText: { fontSize: 14, fontWeight: '500', flex: 1 },
  buttonContainer: { paddingHorizontal: 16, marginTop: 20 },
  clotureButton: { backgroundColor: '#FF6B35' },
});