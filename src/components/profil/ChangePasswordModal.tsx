// ChangePasswordModal.tsx 
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { Button } from '../Button';

interface ChangePasswordModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (ancien: string, nouveau: string, confirmation: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  loading,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!ancien) newErrors.ancien = 'Champ obligatoire';
    if (!nouveau) newErrors.nouveau = 'Champ obligatoire';
    else if (nouveau.length < 6) newErrors.nouveau = 'Minimum 6 caractères';
    if (!confirmation) newErrors.confirmation = 'Champ obligatoire';
    else if (nouveau !== confirmation) newErrors.confirmation = 'Les mots de passe ne correspondent pas';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(ancien, nouveau, confirmation);
    }
  };

  const resetForm = () => {
    setAncien('');
    setNouveau('');
    setConfirmation('');
    setErrors({});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          style={[styles.content, { backgroundColor: theme.surface }]}
          activeOpacity={1}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="lock-closed" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Modifier le mot de passe
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Formulaire */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Input
              label="Mot de passe actuel"
              value={ancien}
              onChangeText={setAncien}
              secureTextEntry
              placeholder="Votre mot de passe actuel"
              required
              error={errors.ancien}
            />

            <Input
              label="Nouveau mot de passe"
              value={nouveau}
              onChangeText={setNouveau}
              secureTextEntry
              placeholder="Minimum 6 caractères"
              required
              error={errors.nouveau}
            />

            <Input
              label="Confirmer le mot de passe"
              value={confirmation}
              onChangeText={setConfirmation}
              secureTextEntry
              placeholder="Répéter le nouveau mot de passe"
              required
              error={errors.confirmation}
            />

            {/* Indicateur de force */}
            {nouveau.length > 0 && (
              <View style={styles.strengthRow}>
                <Text style={[styles.strengthLabel, { color: theme.textSecondary }]}>
                  Force du mot de passe :
                </Text>
                <PasswordStrengthIndicator password={nouveau} theme={theme} />
              </View>
            )}

            {/* Boutons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
                <Text style={[styles.cancelText, { color: theme.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Modification...' : 'Modifier'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Indicateur de force du mot de passe
const PasswordStrengthIndicator: React.FC<{ password: string; theme: any }> = ({ password, theme }) => {
  let strength = 0;
  let label = 'Très faible';
  let color = theme.danger;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  switch (strength) {
    case 0:
    case 1:
      label = 'Faible';
      color = theme.danger;
      break;
    case 2:
      label = 'Moyen';
      color = theme.warning;
      break;
    case 3:
      label = 'Bon';
      color = theme.primary;
      break;
    case 4:
      label = 'Fort';
      color = theme.secondary;
      break;
  }

  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bar}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              strengthStyles.segment,
              { backgroundColor: i < strength ? color : theme.surfaceVariant },
              i === 0 && strengthStyles.segmentFirst,
              i === 3 && strengthStyles.segmentLast,
            ]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

const strengthStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { flexDirection: 'row', gap: 3, flex: 1 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  segmentFirst: {},
  segmentLast: {},
  label: { fontSize: 12, fontWeight: '600', width: 50, textAlign: 'right' },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  strengthLabel: {
    fontSize: 13,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});