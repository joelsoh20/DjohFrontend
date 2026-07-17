// Section récapitulatif
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface SectionRecapProps {
  totalCommande: number;
  commissionEstimee: number;
}

export const SectionRecap: React.FC<SectionRecapProps> = ({
  totalCommande,
  commissionEstimee,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { utilisateur } = useAuth();

  return (
    <View style={[styles.section, { backgroundColor: theme.primaryLight }]}>
      {/* Titre */}
      <View style={styles.sectionHeader}>
        <Ionicons name="receipt" size={20} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {t('commande.recap')}
        </Text>
      </View>

      {/* Ligne Commercial */}
      <RecapRow
        icon="person-circle-outline"
        label={t('commande.commercial')}
        value={utilisateur?.nom || '-'}
        theme={theme}
      />
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      {/* Ligne Total */}
      <RecapRow
        icon="cash-outline"
        label={t('commande.total')}
        value={formatMonnaie(totalCommande)}
        valueBold
        valueLarge
        theme={theme}
      />
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      {/* Ligne Commission */}
      <RecapRow
        icon="gift-outline"
        label={t('commande.commission')}
        value={`~${formatMonnaie(commissionEstimee)}`}
        valueColor={theme.secondary}
        valueBold
        theme={theme}
      />
    </View>
  );
};

// Sous-composant ligne récap
interface RecapRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueBold?: boolean;
  valueLarge?: boolean;
  valueColor?: string;
  theme: any;
}

const RecapRow: React.FC<RecapRowProps> = ({
  icon,
  label,
  value,
  valueBold = false,
  valueLarge = false,
  valueColor,
  theme,
}) => {
  return (
    <View style={recapStyles.row}>
      <View style={recapStyles.left}>
        <Ionicons name={icon} size={18} color={theme.textSecondary} />
        <Text style={[recapStyles.label, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <Text
        style={[
          recapStyles.value,
          { color: valueColor || theme.text },
          valueBold && recapStyles.bold,
          valueLarge && recapStyles.large,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const recapStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
  },
  bold: {
    fontWeight: '600',
  },
  large: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  section: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});