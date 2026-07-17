import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../Input';
import { Button } from '../Button';
import { CommissionConfig } from './CommissionConfig';
import { Role, CommissionMode } from '../../types';
import { SelectPicker, PickerItem } from '../commande/SelectPicker';
import { LoadingSpinner } from '../LoadingSpinner';

interface UtilisateurFormProps {
  formData: any;
  errors: Record<string, string>;
  loading: boolean;
  loadingSubmit: boolean;
  isEdit: boolean;
  produits: any[];
  commissionsProduits: any[];
  updateField: (field: string, value: string) => void;
  setCommissionMode: (mode: CommissionMode) => void;
  handleSubmit: () => Promise<boolean>;
  addCommissionProduit: (productId: string, montant: number) => void;
  removeCommissionProduit: (productId: string) => void;
}

export const UtilisateurForm: React.FC<UtilisateurFormProps> = ({
  formData,
  errors,
  loading,
  loadingSubmit,
  isEdit,
  produits,
  commissionsProduits,
  updateField,
  setCommissionMode,
  handleSubmit,
  addCommissionProduit,
  removeCommissionProduit,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const roleItems: PickerItem[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Commercial', value: 'commercial' },
  ];

  const onSubmit = async () => {
    const result = await handleSubmit();
    if (result) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={t('common.loading')} />;
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Informations de base */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Input
              label={t('utilisateur.name')}
              value={formData.nom}
              onChangeText={(val) => updateField('nom', val)}
              placeholder="Nom complet"
              required
              error={errors.nom}
            />

            <Input
              label={t('utilisateur.password')}
              value={formData.mot_de_passe}
              onChangeText={(val) => updateField('mot_de_passe', val)}
              placeholder={isEdit ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
              secureTextEntry
              required={!isEdit}
              error={errors.mot_de_passe}
            />

            {isAdmin && (
              <SelectPicker
                label={t('utilisateur.role')}
                selectedValue={formData.role}
                onValueChange={(val) => updateField('role', val)}
                items={roleItems}
                required
              />
            )}
          </View>

          {/* Configuration commission (Commercial seulement) */}
          {formData.role === 'commercial' && (
            <CommissionConfig
              mode={formData.commission_mode}
              onModeChange={setCommissionMode}
              commissionDefaut={formData.commission_defaut}
              onCommissionDefautChange={(val) => updateField('commission_defaut', val)}
              produits={produits}
              commissionsProduits={commissionsProduits}
              onAddCommission={addCommissionProduit}
              onRemoveCommission={removeCommissionProduit}
            />
          )}

          {/* Bouton */}
          <Button
            title={isEdit ? t('common.edit') : t('common.create')}
            onPress={onSubmit}
            loading={loadingSubmit}
            style={styles.submitButton}
          />

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Toast succès */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.toastOverlay}>
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={48} color="#FFF" />
            <Text style={styles.toastTitle}>
              {isEdit ? 'Utilisateur modifié !' : 'Utilisateur créé !'}
            </Text>
            <Text style={styles.toastMessage}>
              {isEdit
                ? 'Les informations ont été mises à jour.'
                : 'Le nouvel utilisateur a été ajouté.'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
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
  submitButton: { marginTop: 8 },
  toastOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 40,
  },
  toast: {
    width: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  toastMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
});