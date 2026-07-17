// Carte commandes en attente
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ActionCommandesEnAttente } from '../../types';

interface CommandesEnAttenteCardProps {
  nombreCommandes: number;
  action: ActionCommandesEnAttente;
  onActionChange: (action: ActionCommandesEnAttente) => void;
}

export const CommandesEnAttenteCard: React.FC<CommandesEnAttenteCardProps> = ({
  nombreCommandes,
  action,
  onActionChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color={theme.warning} />
        <Text style={[styles.title, { color: theme.text }]}>
          ⏳ {t('cloture.pendingOrders')}
        </Text>
      </View>

      <View style={[styles.countBadge, { backgroundColor: theme.warningLight }]}>
        <Text style={[styles.countText, { color: theme.warning }]}>
          {nombreCommandes} commande{nombreCommandes > 1 ? 's' : ''} en attente
        </Text>
      </View>

      <Text style={[styles.question, { color: theme.textSecondary }]}>
        Que faire de ces commandes ?
      </Text>

      {/* Option Annuler */}
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: action === 'annulees' ? theme.dangerLight : theme.surfaceVariant,
            borderColor: action === 'annulees' ? theme.danger : theme.border,
          },
        ]}
        onPress={() => onActionChange('annulees')}
      >
        <View style={styles.optionLeft}>
          <Ionicons
            name="close-circle"
            size={22}
            color={action === 'annulees' ? theme.danger : theme.textTertiary}
          />
          <View>
            <Text style={[styles.optionTitle, { color: action === 'annulees' ? theme.danger : theme.text }]}>
              {t('cloture.annulees')}
            </Text>
            <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
              Les commandes seront marquées comme annulées.
            </Text>
          </View>
        </View>
        {action === 'annulees' && (
          <Ionicons name="checkmark-circle" size={22} color={theme.danger} />
        )}
      </TouchableOpacity>

      {/* Option Reporter */}
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: action === 'reportees' ? theme.primaryLight : theme.surfaceVariant,
            borderColor: action === 'reportees' ? theme.primary : theme.border,
          },
        ]}
        onPress={() => onActionChange('reportees')}
      >
        <View style={styles.optionLeft}>
          <Ionicons
            name="arrow-forward-circle"
            size={22}
            color={action === 'reportees' ? theme.primary : theme.textTertiary}
          />
          <View>
            <Text style={[styles.optionTitle, { color: action === 'reportees' ? theme.primary : theme.text }]}>
              {t('cloture.reportees')}
            </Text>
            <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
              Les commandes seront conservées pour le mois suivant.
            </Text>
          </View>
        </View>
        {action === 'reportees' && (
          <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
        )}
      </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  countBadge: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    alignItems: 'center', marginBottom: 14,
  },
  countText: { fontSize: 15, fontWeight: '600' },
  question: { fontSize: 14, marginBottom: 12 },
  option: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 10,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '600' },
  optionDesc: { fontSize: 12, marginTop: 2 },
});