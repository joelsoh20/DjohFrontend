// Modal de confirmation finale
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../Button';

interface ClotureConfirmModalProps {
  visible: boolean;
  moisNom: string;
  annee: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClotureConfirmModal: React.FC<ClotureConfirmModalProps> = ({
  visible,
  moisNom,
  annee,
  loading,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          {/* Icône avertissement */}
          <View style={[styles.iconCircle, { backgroundColor: theme.warningLight }]}>
            <Ionicons name="warning" size={48} color={theme.warning} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {t('cloture.confirmCloture')}
          </Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {moisNom} {annee}
          </Text>

          <View style={[styles.warningBox, { backgroundColor: theme.dangerLight }]}>
            <Ionicons name="alert-circle" size={18} color={theme.danger} />
            <Text style={[styles.warningText, { color: theme.danger }]}>
              {t('cloture.warning')}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.cancelText, { color: theme.text }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Ionicons name="lock-closed" size={18} color="#FFF" />
              <Text style={styles.confirmText}>
                {loading ? 'Clôture...' : t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 20,
  },
  content: {
    width: '100%', borderRadius: 20, padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 16 },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, marginBottom: 20, width: '100%',
  },
  warningText: { fontSize: 13, flex: 1, fontWeight: '500' },
  actions: {
    flexDirection: 'row', gap: 10, width: '100%',
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600' },
  confirmBtn: {
    flex: 1.5, flexDirection: 'row', gap: 8,
    paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});