// Section produit et prix
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { SelectPicker, PickerItem } from './SelectPicker';
import { CommandeFormData, FormErrors } from '../../types/commande';

interface SectionProduitProps {
  data: CommandeFormData;
  errors: FormErrors;
  produitItems: PickerItem[];
  selectedProduit: any;
  onChange: (field: keyof CommandeFormData, value: string) => void;
}

export const SectionProduit: React.FC<SectionProduitProps> = ({
  data,
  errors,
  produitItems,
  selectedProduit,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      {/* Titre section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="cube" size={20} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('commande.product')}
        </Text>
      </View>

      <SelectPicker
        label={t('commande.product')}
        selectedValue={data.product_id}
        onValueChange={(val) => onChange('product_id', val)}
        items={produitItems}
        placeholder="Sélectionner un produit..."
        required
        error={errors.product_id}
        searchable
      />

      <Input
        label={t('commande.quantity')}
        value={data.quantite}
        onChangeText={(val) => onChange('quantite', val)}
        keyboardType="numeric"
        required
      />

      <Input
        label={t('commande.unitPrice')}
        value={data.prix_unitaire_reel}
        onChangeText={(val) => onChange('prix_unitaire_reel', val)}
        keyboardType="numeric"
        placeholder="Modifiable si négocié"
        required
        error={errors.prix_unitaire_reel}
      />

      {/* Indication prix catalogue */}
      {selectedProduit && (
        <Text style={[styles.hint, { color: theme.textTertiary }]}>
          {t('commande.catalogPrice')} : {selectedProduit.prix_catalogue?.toLocaleString()} FCFA
        </Text>
      )}
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
  hint: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});