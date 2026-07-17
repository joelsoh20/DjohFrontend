import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Utilisateur } from '../../types';
import { utilisateurService } from '../../services/utilisateurService';

interface ChargeFormProps {
  formData: {
    date: string;
    type: string;
    montant: string;
    description: string;
    commercial_id: string | null;
  };
  errors: Record<string, string>;
  loading: boolean;
  loadingSubmit: boolean;
  isEdit: boolean;
  updateField: (field: string, value: string) => void;
  handleSubmit: () => Promise<boolean | void>;
  onDelete?: () => void;
}

export const ChargeForm: React.FC<ChargeFormProps> = ({
  formData, errors, loading, loadingSubmit, isEdit,
  updateField, handleSubmit, onDelete,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [commerciaux, setCommerciaux] = useState<Utilisateur[]>([]);
  const [typesPerso, setTypesPerso] = useState<string[]>([
    'publicite', 'electricite', 'loyer', 'transport', 'internet', 'autre'
  ]);
  const [showCustomType, setShowCustomType] = useState(false);
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await utilisateurService.getAll();
        if (res.success && res.data) {
          setCommerciaux(res.data.filter((u: any) => u.role === 'commercial' && u.actif));
        }
      } catch {}
    };
    charger();
  }, []);

  if (loading) return <LoadingSpinner fullScreen message={t('common.loading')} />;


  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          {/* Type de charge personnalisable */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: theme.text }]}>Type de charge *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {typesPerso.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, { backgroundColor: formData.type === t ? theme.primary : theme.surfaceVariant }]}
                  onPress={() => updateField('type', t)}
                >
                  <Text style={{ color: formData.type === t ? '#FFF' : theme.text, fontSize: 13, fontWeight: '500' }}>{t}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.typeChip, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => setShowCustomType(true)}
              >
                <Ionicons name="add" size={18} color={theme.primary} />
              </TouchableOpacity>
            </ScrollView>
            {showCustomType && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TextInput
                  style={[styles.customInput, { backgroundColor: theme.surfaceVariant, color: theme.text }]}
                  placeholder="Nouveau type..."
                  placeholderTextColor={theme.textTertiary}
                  value={customType}
                  onChangeText={setCustomType}
                />
                <Button title="Ajouter" onPress={() => {
                  if (customType.trim()) {
                    const newType = customType.trim().toLowerCase();
                    setTypesPerso(prev => [...prev, newType]);
                    updateField('type', newType);
                    setCustomType('');
                    setShowCustomType(false);
                  }
                }} />
              </View>
            )}
          </View>

          <Input label={t('charge.date')} value={formData.date} onChangeText={(v) => updateField('date', v)} placeholder="AAAA-MM-JJ" required error={errors.date} />
          <Input label={t('charge.amount')} value={formData.montant} onChangeText={(v) => updateField('montant', v)} keyboardType="numeric" required error={errors.montant} />
          <Input label={t('charge.description')} value={formData.description} onChangeText={(v) => updateField('description', v)} placeholder="Description..." multiline />

        </View>

        <Button title={isEdit ? t('common.edit') : t('common.create')} onPress={() => handleSubmit()} loading={loadingSubmit} style={styles.submitButton} />

        {isEdit && onDelete && (
          <TouchableOpacity style={[styles.deleteButton, { borderColor: theme.danger }]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
            <Text style={[styles.deleteText, { color: theme.danger }]}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: { padding: 18, borderRadius: 16, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  customInput: { padding: 10, borderRadius: 8, fontSize: 14, flex: 1 },
  submitButton: { marginTop: 8 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5,
  },
  deleteText: { fontSize: 15, fontWeight: '600' },
});