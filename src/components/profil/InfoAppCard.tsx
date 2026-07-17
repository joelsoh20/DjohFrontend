import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export const InfoAppCard: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>
        {t('parametres.about')}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="calculator" size={18} color={theme.primary} />
          </View>
          <Text style={[styles.label, { color: theme.text }]}>
            {t('common.appName')}
          </Text>
          <Text style={[styles.value, { color: theme.textSecondary }]}>
            v1.0.0
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: theme.secondaryLight }]}>
            <Ionicons name="code-slash" size={18} color={theme.secondary} />
          </View>
          <Text style={[styles.label, { color: theme.text }]}>
            Développé avec
          </Text>
          <Text style={[styles.value, { color: theme.textSecondary }]}>
            Expo React Native
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: theme.warningLight }]}>
            <Ionicons name="globe" size={18} color={theme.warning} />
          </View>
          <Text style={[styles.label, { color: theme.text }]}>
            Site web
          </Text>
          <Text style={[styles.value, { color: theme.primary }]}>
            www.monapp.com
          </Text>
        </View>
      </View>

      <Text style={[styles.copyright, { color: theme.textTertiary }]}>
        © 2026 Compta Social Commerce. Tous droits réservés.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
  },
  divider: {
    height: 1,
  },
  copyright: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
});