// En-tête du groupe (nom, badge, valider tout)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

interface LivreurGroupHeaderProps {
  nom: string;
  count: number;
  onValidateAll: () => void;
  loading: boolean;
}

export const LivreurGroupHeader: React.FC<LivreurGroupHeaderProps> = ({
  nom,
  count,
  onValidateAll,
  loading,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Nom + compteur */}
      <View style={styles.left}>
        <Ionicons name="person" size={18} color={theme.textSecondary} />
        <Text style={[styles.name, { color: theme.text }]}>{nom}</Text>
        <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>{count}</Text>
        </View>
      </View>

      {/* Bouton Valider tout */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.secondaryLight }]}
        onPress={onValidateAll}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: theme.secondary }]}>
          {t('commande.validateAll')}
        </Text>
        <Ionicons name="checkmark-done" size={18} color={theme.secondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});