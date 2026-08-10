// Écran formulaire (création/modification)
import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useProduitForm } from '../../hooks/useProduitForm';
import { ProduitForm } from '../../components/produits/ProduitForm';

export const FormulaireProduitScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const productId = route.params?.productId;

  const {
    formData, errors, loading, loadingSubmit, isEdit,
    updateField, handleSubmit,
  } = useProduitForm(productId);

  const onSubmit = async () => {
    const success = await handleSubmit();
    if (success) navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name={isEdit ? 'create' : 'cube'} size={24} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          {isEdit ? t('produit.edit') : t('produit.new')}
        </Text>
      </View>

      <ProduitForm
        formData={formData}
        errors={errors}
        loading={loading}
        loadingSubmit={loadingSubmit}
        isEdit={isEdit}
        updateField={updateField}
        handleSubmit={onSubmit}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
});