import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { ChargeForm } from '../../components/charges/ChargeForm';
import { chargeService } from '../../services/chargeService';

export const FormulaireChargeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();

 const [formData, setFormData] = useState({
  date: new Date().toISOString().split('T')[0],
  type: 'publicite' as string,
  montant: '',
  description: '',
  commercial_id: null as string | null,
});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const isEdit = !!route.params?.chargeId;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'La date est obligatoire';
    if (!formData.montant || parseFloat(formData.montant) <= 0) newErrors.montant = 'Montant invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoadingSubmit(true);
    try {
      const data = {
        date: formData.date,
        type: formData.type,
        montant: parseFloat(formData.montant),
        description: formData.description,
        commercial_id: formData.commercial_id,
      };

      if (isEdit && route.params?.chargeId) {
        await chargeService.update(route.params.chargeId, data);
      } else {
        await chargeService.creer(data);
      }

      Alert.alert('Succès', `Charge ${isEdit ? 'modifiée' : 'créée'} !`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name={isEdit ? 'create' : 'cash'} size={24} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          {isEdit ? t('charge.edit') : t('charge.new')}
        </Text>
      </View>

      <ChargeForm
        formData={formData}
        errors={errors}
        loading={false}
        loadingSubmit={loadingSubmit}
        isEdit={isEdit}
        updateField={updateField}
        handleSubmit={handleSubmit}
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