import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Charge } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateCourte } from '../../utils/formatDate';

interface ChargeListItemProps {
  charge: Charge;
  onPress: (charge: Charge) => void;
  onDelete: (id: string, description: string) => void;
}

const ICONS: Record<string, string> = {
  publicite: 'megaphone',
  echantillon: 'gift',
  electricite: 'flash',
  loyer: 'home',
  salaire: 'people',
  transport: 'car',
  internet: 'wifi',
};

const COLORS: Record<string, string> = {
  publicite: '#FBBC04',
  echantillon: '#EA4335',
  electricite: '#FFB300',
  loyer: '#7C4DFF',
  salaire: '#00C853',
  transport: '#0091EA',
  internet: '#00BFA5',
};

export const ChargeListItem: React.FC<ChargeListItemProps> = ({ charge, onPress, onDelete }) => {
  const { theme } = useTheme();
  const icon = ICONS[charge.type] || 'cash-outline';
  const color = COLORS[charge.type] || theme.primary;
  const label = charge.type.charAt(0).toUpperCase() + charge.type.slice(1);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={() => onPress(charge)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.type, { color }]}>{label}</Text>
        <Text style={[styles.description, { color: theme.text }]} numberOfLines={1}>
          {charge.description || 'Sans description'}
        </Text>
        <Text style={[styles.date, { color: theme.textTertiary }]}>
          {formatDateCourte(charge.date)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.montant, { color: theme.text }]}>{formatMonnaie(charge.montant)}</Text>
        <TouchableOpacity onPress={() => onDelete(charge.id, charge.description || 'Sans description')}>
          <Ionicons name="trash-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, marginHorizontal: 16, marginTop: 10,
    borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 2, elevation: 1,
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: 12 },
  type: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 8, marginLeft: 8 },
  montant: { fontSize: 15, fontWeight: 'bold' },
});