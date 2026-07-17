// Carte par commercial
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Utilisateur } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommercialCommissionCardProps {
  commercial: Utilisateur;
  onPress: (commercial: Utilisateur) => void;
  onToggleMode: (id: string, mode: 'forfaitaire' | 'par_produit') => void;
}

export const CommercialCommissionCard: React.FC<CommercialCommissionCardProps> = ({
  commercial, onPress, onToggleMode,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const isForfaitaire = commercial.commission_mode === 'forfaitaire';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={() => onPress(commercial)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: theme.secondaryLight }]}>
          <Ionicons name="person" size={20} color={theme.secondary} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{commercial.nom}</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeChip, { backgroundColor: isForfaitaire ? theme.primaryLight : theme.surfaceVariant }]}
              onPress={() => onToggleMode(commercial.id, 'forfaitaire')}
            >
              <Text style={[styles.modeText, { color: isForfaitaire ? theme.primary : theme.textTertiary }]}>
                {t('commission.modeForfaitaire')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeChip, { backgroundColor: !isForfaitaire ? theme.primaryLight : theme.surfaceVariant }]}
              onPress={() => onToggleMode(commercial.id, 'par_produit')}
            >
              <Text style={[styles.modeText, { color: !isForfaitaire ? theme.primary : theme.textTertiary }]}>
                {t('commission.modeParProduit')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.commission, { color: theme.secondary }]}>
            {isForfaitaire
              ? `${formatMonnaie(commercial.commission_defaut)} / produit`
              : 'Commission personnalisée'}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, marginHorizontal: 16, marginTop: 10,
    borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 2, elevation: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  modeChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  modeText: { fontSize: 11, fontWeight: '600' },
  commission: { fontSize: 13, fontWeight: '600', marginTop: 4 },
});