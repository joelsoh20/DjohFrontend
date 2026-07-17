import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { statsService } from '../services/statsService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatMonnaie } from '../utils/formatMonnaie';

export const ClassementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const [classement, setClassement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mois' | 'precedent'>('mois');

  useEffect(() => {
  statsService.getClassement().then(res => {
    console.log('Classement reçu:', JSON.stringify(res));
    if (res.success) setClassement(res.data);
    setLoading(false);
  }).catch(err => {
    console.log('Erreur classement:', err.message);
    setLoading(false);
  });
}, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const data = tab === 'mois' ? classement?.mois : classement?.moisPrecedent;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name="trophy" size={28} color="#FFD700" />
        <Text style={[styles.title, { color: theme.text }]}>🏆 Classement</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'mois' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]} onPress={() => setTab('mois')}>
          <Text style={[styles.tabText, { color: tab === 'mois' ? theme.primary : theme.textTertiary }]}>Ce mois</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'precedent' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]} onPress={() => setTab('precedent')}>
          <Text style={[styles.tabText, { color: tab === 'precedent' ? theme.primary : theme.textTertiary }]}>Mois passé</Text>
        </TouchableOpacity>
      </View>

      <FlatList
  data={data || []}
  keyExtractor={(item: any) => item.id}
 renderItem={({ item, index }) => (
  <TouchableOpacity
    style={[styles.row, { backgroundColor: index === 0 ? '#FFF8E1' : theme.surface }]}
    onPress={() => navigation.navigate('Dashboard', { 
  screen: 'StatsCommercial', 
  params: { commercialId: item.id, nom: item.nom } 
})}
  >
    <View style={styles.rank}>
      <Text style={[styles.rankText, { color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.textSecondary }]}>
        {index + 1}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.name, { color: theme.text }]}>{item.nom}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
        <Text style={[styles.statBadge, { backgroundColor: theme.primaryLight, color: theme.primary }]}>
          🛍️ {item.nb_commandes || 0} cmd
        </Text>
        <Text style={[styles.statBadge, { backgroundColor: theme.secondaryLight, color: theme.secondary }]}>
          📦 {item.produits_vendus || 0} produits
        </Text>
      </View>
    </View>
    <Text style={[styles.totalVentes, { color: theme.text, fontWeight: 'bold', fontSize: 15 }]}>
      {formatMonnaie(item.total_ventes || 0)}
    </Text>
  </TouchableOpacity>
)}
  contentContainerStyle={{ padding: 16 }}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: 'bold' },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8 },
  rank: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { fontSize: 16, fontWeight: 'bold' },
  name: { fontSize: 15, fontWeight: '600' },
 statBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 13, fontWeight: '600' },
  totalVentes: { fontSize: 15, fontWeight: 'bold' },
});