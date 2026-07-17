import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useExports } from '../../hooks/useExports';
import { ExportCard } from '../../components/exports/ExportCard';

export const ExportsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    loadingFEC, loadingPDF, loadingBalance,
    exportFEC, exportPDF, exportBalance,
  } = useExports();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name="download" size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('export.title')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Sélectionnez le document à exporter
        </Text>

        <ExportCard
          icon="document-text"
          title={t('export.monthlyRecap')}
          description="Récapitulatif complet du mois avec CA, bénéfice et commissions."
          format="PDF"
          loading={loadingPDF}
          onPress={() => exportPDF()}
        />

        <ExportCard
          icon="grid"
          title={t('export.fee')}
          description="Fichier normalisé pour votre expert-comptable (format FEC)."
          format="CSV"
          loading={loadingFEC}
          onPress={exportFEC}
        />

        <ExportCard
          icon="scale"
          title={t('export.balance')}
          description="Balance des comptes tiers (dettes livreurs, commissions dues)."
          format="CSV"
          loading={loadingBalance}
          onPress={exportBalance}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 14, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 4,
  },
});