// Commission par défaut globale
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { Button } from '../Button';

interface CommissionGlobaleProps {
  value: string;
  onChange: (val: string) => void;
  onUpdate: () => Promise<void>;
  loading: boolean;
}

export const CommissionGlobale: React.FC<CommissionGlobaleProps> = ({
  value, onChange, onUpdate, loading,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Ionicons name="settings" size={20} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          {t('commission.defaultCommission')}
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]}>
        S'applique à tous les nouveaux commerciaux et aux produits sans commission spécifique.
      </Text>

      <Input
        label="Montant (FCFA)"
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        required
      />

      <Button
        title={t('commission.updateDefault')}
        onPress={onUpdate}
        loading={loading}
        variant="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18, borderRadius: 16, marginBottom: 16,
    marginHorizontal: 16, marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 13, marginBottom: 14, lineHeight: 18 },
});