import React, { useMemo, useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, TextInput, StyleSheet, RefreshControl, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCommandes } from '../../hooks/useCommandes';
import { SearchBar } from '../../components/validation/SearchBar';
import { EmptyValidation } from '../../components/validation/EmptyValidation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { serviceLivraisonService } from '../../services/serviceLivraisonService';
import { formatMonnaie } from '../../utils/formatMonnaie';

export const ValidationLivraisonsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    loading, refreshing,
    onRefresh, handleValider, handleAnnuler,
    searchText, setSearchText, commandesFiltrees,
  } = useCommandes({ statut: 'recue', limit: 100 });

  const { refresh } = useCommandes({ statut: 'recue', limit: 100 });
  const [selectedGroupe, setSelectedGroupe] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [fraisChoisi, setFraisChoisi] = useState(1000);
  const [services, setServices] = useState<any[]>([]);
  const [showAnnulation, setShowAnnulation] = useState(false);
  const [groupeToAnnuler, setGroupeToAnnuler] = useState<any>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [traitees, setTraitees] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem('traitees').then(data => {
      if (data) setTraitees(new Set(JSON.parse(data)));
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => onRefresh(), 5000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  const commandesGroupees = useMemo(() => {
    const groupeMap = new Map<string, any>();
    for (const cmd of commandesFiltrees) {
      const key = (cmd as any).group_id || cmd.id;
      if (!groupeMap.has(key)) {
        groupeMap.set(key, {
          id: key,
          client_nom: cmd.client_nom,
          client_telephone: cmd.client_telephone,
          client_quartier: cmd.client_quartier,
          commercial_nom: (cmd as any).commercial?.nom || 'Inconnu',
          date_creation: cmd.date_creation,
          statut: cmd.statut,
          produits: [],
          total: 0,
          commandes: [],
        });
      }
      const groupe = groupeMap.get(key);
      groupe.commandes.push(cmd);
      groupe.total += Number(cmd.prix_unitaire_reel) * cmd.quantite;
      groupe.produits.push({
        nom: (cmd as any).produit?.nom || 'Inconnu',
        quantite: cmd.quantite,
        prix: Number(cmd.prix_unitaire_reel),
      });
    }
    return Array.from(groupeMap.values())
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, [commandesFiltrees]);

  const handleCopyWhatsApp = (groupe: any) => {
    const produits = groupe.produits.map((p: any) => `📌 ${p.nom} x${p.quantite}`).join('\n');
    const message = `🛍️ *NDJOH AGOGO*\n\n📦 *Nature du produit* :\n${produits}\n\n📞 *Numéro du client* :\n${groupe.client_telephone || 'N/A'}\n\n📍 *Adresse de livraison*\n${groupe.client_quartier || 'N/A'}\n\n💰 *Montant à percevoir*\n${formatMonnaie(groupe.total)}`;
    Clipboard.setStringAsync(message);
    Alert.alert('✅ Copié !', 'Message WhatsApp prêt à être envoyé.');
  };

  const handleValidee = async (item: any) => {
    handleCopyWhatsApp(item);
    const newSet = new Set(traitees).add(item.id);
    setTraitees(newSet);
    await AsyncStorage.setItem('traitees', JSON.stringify([...newSet]));
  };

  const openValidation = async (groupe: any) => {
    setSelectedGroupe(groupe);
    const res = await serviceLivraisonService.getAll();
    if (res.success) setServices((res.data || []).filter((s: any) => s.actif));
    setShowValidation(true);
  };

  const handleValidateWithService = (serviceId: string) => {
    if (selectedGroupe) {
      selectedGroupe.commandes.forEach((cmd: any) => handleValider(cmd.id, fraisChoisi, serviceId));
    }
    setShowValidation(false);
    setSelectedGroupe(null);
  };

  const handleAnnulerGroupe = (groupe: any) => {
    setGroupeToAnnuler(groupe);
    setMotifAnnulation('');
    setShowAnnulation(true);
  };

  const confirmAnnulation = () => {
    if (groupeToAnnuler) {
      groupeToAnnuler.commandes.forEach((cmd: any) => handleAnnuler(cmd.id, motifAnnulation));
    }
    setShowAnnulation(false);
    setGroupeToAnnuler(null);
  };

  if (loading && commandesFiltrees.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={searchText} onChangeText={setSearchText} />
      <TouchableOpacity style={[styles.historyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('ListeCommandes')}>
        <Ionicons name="time-outline" size={20} color={theme.primary} />
        <Text style={[styles.historyBtnText, { color: theme.primary }]}>Voir l'historique</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
      </TouchableOpacity>

      <FlatList
        data={commandesGroupees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const estTraitee = traitees.has(item.id);
          return (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clientName, { color: theme.text }]}>👤 {item.client_nom}</Text>
                  <Text style={[styles.info, { color: theme.textTertiary }]}>📱 {item.client_telephone || 'N/A'}</Text>
                  <Text style={[styles.info, { color: theme.textTertiary }]}>📍 {item.client_quartier || 'N/A'}</Text>
                  <Text style={[styles.info, { color: theme.textTertiary }]}>👩‍💼 {item.commercial_nom}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: estTraitee ? theme.secondaryLight : theme.warningLight }]}>
                  <Text style={[styles.badgeText, { color: estTraitee ? theme.secondary : theme.warning }]}>
                    {estTraitee ? 'Validée' : 'En attente'}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <Text style={[styles.label, { color: theme.textSecondary }]}>📦 Nature du produit :</Text>
              {item.produits.map((p: any, i: number) => (
                <Text key={i} style={[styles.produit, { color: theme.text }]}>• {p.nom} x{p.quantite} — {formatMonnaie(p.prix * p.quantite)}</Text>
              ))}
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>💰 Montant à percevoir</Text>
                <Text style={[styles.totalValue, { color: theme.text }]}>{formatMonnaie(item.total)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.copyBtn, {
                    borderColor: estTraitee ? theme.secondary : theme.primary,
                    backgroundColor: estTraitee ? theme.secondaryLight : 'transparent'
                  }]}
                  onPress={() => handleValidee(item)}
                >
                  <Ionicons name={estTraitee ? 'checkmark-circle' : 'copy-outline'} size={16} color={estTraitee ? theme.secondary : theme.primary} />
                  <Text style={[styles.actionText, { color: estTraitee ? theme.secondary : theme.primary }]}>Validée</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.danger }]} onPress={() => handleAnnulerGroupe(item)}>
                  <Ionicons name="close-circle-outline" size={16} color={theme.danger} />
                  <Text style={[styles.actionText, { color: theme.danger }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.validateBtn, { backgroundColor: theme.secondary }]} onPress={() => openValidation(item)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                  <Text style={[styles.actionText, { color: '#FFF' }]}>Livré</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={<EmptyValidation hasSearchText={searchText.length > 0} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={commandesGroupees.length === 0 ? styles.emptyContainer : styles.listContent}
      />

      <Modal visible={showValidation} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Valider la commande</Text>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Frais de livraison</Text>
            <View style={styles.fraisRow}>
              {[0, 500, 1000, 1500, 2000, 2500].map(frais => (
                <TouchableOpacity key={frais} style={[styles.fraisBtn, { backgroundColor: fraisChoisi === frais ? theme.primary : theme.surfaceVariant }]} onPress={() => setFraisChoisi(frais)}>
                  <Text style={{ color: fraisChoisi === frais ? '#FFF' : theme.text, fontWeight: '600' }}>{frais} F</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Service de livraison</Text>
            {services.map((s: any) => (
              <TouchableOpacity key={s.id} style={[styles.serviceItem, { borderBottomColor: theme.divider }]} onPress={() => handleValidateWithService(s.id)}>
                <View><Text style={[styles.serviceName, { color: theme.text }]}>{s.nom}</Text><Text style={[styles.serviceZone, { color: theme.textSecondary }]}>{s.zone || ''}</Text></View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ))}
            <Button title="Annuler" onPress={() => setShowValidation(false)} variant="outline" style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>

      <Modal visible={showAnnulation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.danger }]}>❌ Annuler la commande</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Veuillez indiquer le motif de l'annulation pour le commercial.</Text>
            <TextInput
              style={[styles.motifInput, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border }]}
              placeholder="Motif de l'annulation..."
              placeholderTextColor={theme.textTertiary}
              value={motifAnnulation}
              onChangeText={setMotifAnnulation}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalBtns}>
              <Button title="Annuler" onPress={() => setShowAnnulation(false)} variant="outline" />
              <Button title="Confirmer l'annulation" onPress={confirmAnnulation} variant="danger" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 10, padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  historyBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  card: { padding: 16, borderRadius: 14, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  clientName: { fontSize: 17, fontWeight: 'bold' },
  info: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  produit: { fontSize: 14, paddingVertical: 3 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  copyBtn: { flex: 0.8 },
  validateBtn: { borderWidth: 0 },
  actionText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  modalSubtitle: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  fraisRow: { flexDirection: 'row', gap: 10 },
  fraisBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceZone: { fontSize: 12 },
  motifInput: { padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
});