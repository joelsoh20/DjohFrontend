// Section informations client
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { CommandeFormData, FormErrors } from '../../types/commande';

interface SectionClientProps {
  data: CommandeFormData;
  errors: FormErrors;
  onChange: (field: string, value: string) => void;
}

interface SectionClientProps {
  data: CommandeFormData;
  errors: FormErrors;
  onChange: (field: keyof CommandeFormData, value: string) => void;
}

export const SectionClient: React.FC<SectionClientProps> = ({ data, errors, onChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      {/* Titre section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="person" size={20} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('commande.client')}
        </Text>
      </View>

      <Input
        label={t('commande.clientName')}
        value={data.client_nom}
        onChangeText={(val) => onChange('client_nom', val)}
        placeholder="Ex: Marie Koné"
        required
        error={errors.client_nom}
      />

      <Input
        label={t('commande.clientPhone')}
        value={data.client_telephone}
        onChangeText={(val) => onChange('client_telephone', val)}
        placeholder="07 XX XX XX XX"
        keyboardType="phone-pad"
      />

      <Input
        label={t('commande.clientQuartier')}
        value={data.client_quartier}
        onChangeText={(val) => onChange('client_quartier', val)}
        placeholder="Ex: Cocody"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});