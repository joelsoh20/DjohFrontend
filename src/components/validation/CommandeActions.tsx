import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { LoadingSpinner } from '../LoadingSpinner';
import { Button } from '../Button';
import { serviceLivraisonService } from '../../services/serviceLivraisonService';

interface CommandeActionsProps {
  onValider: (fraisLivraison: number, serviceId?: string) => void;
  onAnnuler: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const CommandeActions: React.FC<CommandeActionsProps> = ({
  onValider, onAnnuler, loading, disabled = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [fraisChoisi, setFraisChoisi] = useState(1000);

  useEffect(() => {
    if (showServices) {
      serviceLivraisonService.getAll().then(res => {
        if (res.success) setServices((res.data || []).filter((s: any) => s.actif));
      });
    }
  }, [showServices]);

  const handleSelectService = (serviceId: string) => {
    setShowServices(false);
    setShowOptions(false);
    onValider(fraisChoisi, serviceId);
  };

  return (
    <View>
      {showServices ? (
        <View>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Sélectionner le service</Text>
          {services.map((s: any) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.serviceItem, { borderBottomColor: theme.divider }]}
              onPress={() => handleSelectService(s.id)}
            >
              <Text style={[styles.serviceName, { color: theme.text }]}>{s.nom}</Text>
              <Text style={[styles.serviceZone, { color: theme.textSecondary }]}>{s.zone || ''}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
          <Button title="Annuler" onPress={() => setShowServices(false)} variant="outline" style={{ marginTop: 10 }} />
        </View>
      ) : showOptions ? (
        <View style={styles.optionsRow}>
          <TouchableOpacity style={[styles.optionBtn, { backgroundColor: theme.secondary }]} onPress={() => { setFraisChoisi(1000); setShowServices(true); }}>
            <Text style={styles.optionText}>1000 F</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionBtn, { backgroundColor: theme.secondary }]} onPress={() => { setFraisChoisi(1500); setShowServices(true); }}>
            <Text style={styles.optionText}>1500 F</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionBtn, { backgroundColor: theme.surfaceVariant }]} onPress={() => setShowOptions(false)}>
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity style={[styles.button, styles.cancelButton, { borderColor: theme.danger }]} onPress={onAnnuler} disabled={loading || disabled}>
            <Ionicons name="close-circle-outline" size={20} color={theme.danger} />
            <Text style={[styles.text, { color: theme.danger }]}>{t('commande.cancelOrder')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.validateButton, { backgroundColor: theme.secondary }]} onPress={() => setShowOptions(true)} disabled={loading || disabled}>
            {loading ? <LoadingSpinner /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={[styles.text, { color: '#FFF' }]}>{t('commande.validate')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, marginTop: 14 },
  button: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 10, minHeight: 46,
  },
  cancelButton: { borderWidth: 1.5, backgroundColor: 'transparent' },
  validateButton: {},
  text: { fontSize: 14, fontWeight: '600' },
  optionsRow: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'center' },
  optionBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', minWidth: 80 },
  optionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceZone: { fontSize: 12 },
});