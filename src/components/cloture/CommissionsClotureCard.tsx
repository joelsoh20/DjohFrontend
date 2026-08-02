// Carte commissions commerciales
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommissionMois {
  nom: string;
  montant: number;
}

interface CommissionsClotureCardProps {
  commissions: CommissionMois[];
  total: number;
}

export const CommissionsClotureCard: React.FC<CommissionsClotureCardProps> = ({ commissions, total }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        👥 {t('cloture.commissions')}
      </Text>

      {commissions.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>Aucune commission ce mois</Text>
      ) : (
        <>
          {commissions.map((comm, index) => (
            <View key={index} style={[styles.row, { borderBottomColor: theme.divider }]}>
              <View style={styles.left}>
                <Ionicons name="person-circle-outline" size={20} color={theme.textSecondary} />
                <Text style={[styles.name, { color: theme.text }]}>{comm.nom}</Text>
              </View>
              <Text style={[styles.montant, { color: theme.primary }]}>
                {formatMonnaie(comm.montant)}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: theme.divider }]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              {t('cloture.totalToPay')}
            </Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>
              {formatMonnaie(total)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16, marginTop: 16,
    padding: 18, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
  empty: { textAlign: 'center', paddingVertical: 16, fontSize: 14 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '500' },
  montant: { fontSize: 14, fontWeight: 'bold' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 2,
  },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
});
