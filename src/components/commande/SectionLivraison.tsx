// Section livreur et frais
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { SelectPicker, PickerItem } from './SelectPicker';
import { CommandeFormData, FormErrors } from '../../types/commande';

interface SectionLivraisonProps {
  frais_livraison: string;
  onChange: (value: string) => void;
  error?: string;
}

export const SectionLivraison: React.FC<SectionLivraisonProps> = ({ frais_livraison, onChange, error }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

   return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bicycle" size={20} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Livraison</Text>
      </View>
      <Input
        label="Frais de livraison (FCFA)"
        value={frais_livraison}
        onChangeText={onChange}
        keyboardType="numeric"
        required
        error={error}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { padding: 18, borderRadius: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
});