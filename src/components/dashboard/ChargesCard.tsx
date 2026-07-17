import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface ChargesCardProps {
  totalCharges: number;
  details?: { type: string; montant: number }[];
}

export const ChargesCard: React.FC<ChargesCardProps> = ({ totalCharges, details = [] }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <TouchableOpacity style={styles.header} onPress={() => setShowDetails(!showDetails)}>
        <Text style={[styles.title, { color: theme.text }]}>💰 {t('dashboard.charges')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.value, { color: theme.danger }]}>{formatMonnaie(totalCharges || 0)}</Text>
          <Ionicons name={showDetails ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>

      {showDetails && details.length > 0 && (
        <View style={[styles.details, { borderTopColor: theme.divider }]}>
          {details.map((d, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                {d.type.charAt(0).toUpperCase() + d.type.slice(1)}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{formatMonnaie(d.montant)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  value: { fontSize: 20, fontWeight: 'bold' },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '600' },
});