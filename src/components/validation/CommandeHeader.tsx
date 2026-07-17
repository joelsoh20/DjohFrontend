// En-tête de la carte (ID, date, statut)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { formatTempsRelatif } from '../../utils/formatDate';

interface CommandeHeaderProps {
  id: string;
  dateCreation: string;
}

export const CommandeHeader: React.FC<CommandeHeaderProps> = ({ id, dateCreation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* ID à gauche */}
      <View style={styles.left}>
        <Text style={[styles.id, { color: theme.primary }]}>
          #{id.substring(0, 8)}
        </Text>
        <Text style={[styles.date, { color: theme.textTertiary }]}>
          {formatTempsRelatif(dateCreation)}
        </Text>
      </View>

      {/* Badge statut à droite */}
      <View style={[styles.badge, { backgroundColor: theme.warningLight }]}>
        <View style={[styles.dot, { backgroundColor: theme.warning }]} />
        <Text style={[styles.badgeText, { color: theme.warning }]}>
          {t('commande.statutRecue')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  id: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});