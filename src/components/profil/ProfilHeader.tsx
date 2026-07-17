// En-tête avec avatar et infos
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: 'Administrateur', color: '#EA4335' },
  manager: { label: 'Manager', color: '#1A73E8' },
  commercial: { label: 'Commercial', color: '#34A853' },
};

export const ProfilHeader: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { utilisateur } = useAuth();

  const roleConfig = utilisateur?.role
    ? ROLE_LABELS[utilisateur.role] || { label: utilisateur.role, color: theme.textSecondary }
    : { label: '-', color: theme.textSecondary };

  // Initiales pour l'avatar
  const initiales = utilisateur?.nom
    ? utilisateur.nom
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: roleConfig.color + '20' }]}>
        <Text style={[styles.avatarText, { color: roleConfig.color }]}>{initiales}</Text>
      </View>

      {/* Nom */}
      <Text style={[styles.name, { color: theme.text }]}>
        {utilisateur?.nom || 'Utilisateur'}
      </Text>

      {/* Rôle */}
      <View style={[styles.roleBadge, { backgroundColor: roleConfig.color + '15' }]}>
        <Ionicons name="shield-checkmark" size={14} color={roleConfig.color} />
        <Text style={[styles.roleText, { color: roleConfig.color }]}>
          {roleConfig.label}
        </Text>
      </View>

      {/* Email */}
      <View style={styles.emailRow}>
        <Ionicons name="mail-outline" size={16} color={theme.textTertiary} />
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {/* {utilisateur?.email || '-'} */}
        </Text>
      </View>

      {/* Date de création */}
      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color={theme.textTertiary} />
        <Text style={[styles.date, { color: theme.textTertiary }]}>
          Membre depuis le{' '}
          {utilisateur?.date_creation
            ? new Date(utilisateur.date_creation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '-'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  email: {
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 13,
  },
});