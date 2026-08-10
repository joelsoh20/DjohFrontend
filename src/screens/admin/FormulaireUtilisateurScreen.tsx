import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUtilisateurForm } from '../../hooks/useUtilisateurForm';
import { UtilisateurForm } from '../../components/utilisateurs/UtilisateurForm';

export const FormulaireUtilisateurScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const userId = route.params?.userId;

  const {
    formData, errors, loading, loadingSubmit, isEdit,
    produits, commissionsProduits,
    updateField, setCommissionMode, handleSubmit,
    addCommissionProduit, removeCommissionProduit,
  } = useUtilisateurForm(userId);

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="lock-closed" size={48} color={theme.textTertiary} />
        <Text style={[styles.title, { color: theme.textSecondary, marginTop: 16 }]}>Accès réservé à l'administrateur</Text>
      </View>
    );
  }

  const onSubmit = async (): Promise<boolean> => {
  const success = await handleSubmit();
  if (success) {
    setTimeout(() => navigation.goBack(), 1500);
  }
  return success;
};

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name={isEdit ? 'create' : 'person-add'} size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEdit ? t('utilisateur.edit') : t('utilisateur.new')}
        </Text>
      </View>

      <UtilisateurForm
        formData={formData}
        errors={errors}
        loading={loading}
        loadingSubmit={loadingSubmit}
        isEdit={isEdit}
        produits={produits}
        commissionsProduits={commissionsProduits}
        updateField={updateField}
        setCommissionMode={setCommissionMode}
        handleSubmit={onSubmit}
        addCommissionProduit={addCommissionProduit}
        removeCommissionProduit={removeCommissionProduit}
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
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  title: { fontSize: 16, textAlign: 'center' },
});