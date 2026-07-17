// Formulaire produit
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface ProduitFormProps {
  formData: { nom: string; prix_catalogue: string; cout_revient: string };
  errors: Record<string, string>;
  loading: boolean;
  loadingSubmit: boolean;
  isEdit: boolean;
  updateField: (field: 'nom' | 'prix_catalogue' | 'cout_revient', value: string) => void;
  handleSubmit: () => Promise<boolean | void>;
}

export const ProduitForm: React.FC<ProduitFormProps> = ({
  formData,
  errors,
  loading,
  loadingSubmit,
  isEdit,
  updateField,
  handleSubmit,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingSpinner fullScreen message={t('common.loading')} />;
  }

  // Aperçu marge
  const prix = parseFloat(formData.prix_catalogue) || 0;
  const cout = parseFloat(formData.cout_revient) || 0;
  const marge = prix - cout;
  const margePourcent = prix > 0 ? Math.round((marge / prix) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Input
            label={t('produit.name')}
            value={formData.nom}
            onChangeText={(val) => updateField('nom', val)}
            placeholder="Nom du produit"
            required
            error={errors.nom}
          />

          <Input
            label={t('produit.catalogPrice')}
            value={formData.prix_catalogue}
            onChangeText={(val) => updateField('prix_catalogue', val)}
            keyboardType="numeric"
            placeholder="Ex: 10000"
            required
            error={errors.prix_catalogue}
          />

          <Input
            label={t('produit.costPrice')}
            value={formData.cout_revient}
            onChangeText={(val) => updateField('cout_revient', val)}
            keyboardType="numeric"
            placeholder="Ex: 6000"
            error={errors.cout_revient}
          />

          {/* Aperçu marge */}
          {prix > 0 && (
            <View style={[styles.margeBox, { backgroundColor: marge >= 0 ? theme.secondaryLight : theme.dangerLight }]}>
              <View style={styles.margeRow}>
                <Text style={[styles.margeLabel, { color: theme.textSecondary }]}>Marge estimée</Text>
                <Text style={[styles.margeValue, { color: marge >= 0 ? theme.secondary : theme.danger }]}>
                  {marge.toLocaleString()} FCFA
                </Text>
              </View>
              <View style={styles.margeRow}>
                <Text style={[styles.margeLabel, { color: theme.textSecondary }]}>Taux de marge</Text>
                <Text style={[styles.margeValue, { color: marge >= 0 ? theme.secondary : theme.danger }]}>
                  {margePourcent}%
                </Text>
              </View>
            </View>
          )}
        </View>

        <Button
          title={isEdit ? t('common.edit') : t('common.create')}
          onPress={() => handleSubmit()}
          loading={loadingSubmit}
          style={styles.submitButton}
        />

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: {
    padding: 18, borderRadius: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  margeBox: {
    marginTop: 14, padding: 14, borderRadius: 12,
  },
  margeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  margeLabel: { fontSize: 14 },
  margeValue: { fontSize: 14, fontWeight: 'bold' },
  submitButton: { marginTop: 8 },
});