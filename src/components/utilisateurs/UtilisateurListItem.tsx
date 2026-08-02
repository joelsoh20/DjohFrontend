// Une ligne utilisateur
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Utilisateur } from '../../types';

interface UtilisateurListItemProps {
  utilisateur: Utilisateur;
  onPress: (utilisateur: Utilisateur) => void;
  onToggleActif: (id: string, nom: string, actif: boolean) => void;
  isAdmin: boolean;
}

export const UtilisateurListItem: React.FC<UtilisateurListItemProps> = ({
  utilisateur,
  onPress,
  onToggleActif,
  isAdmin,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Admin', color: theme.danger, icon: 'shield' as const };
      case 'manager': return { label: 'Manager', color: theme.primary, icon: 'star' as const };
      case 'commercial': return { label: 'Commercial', color: theme.secondary, icon: 'person' as const };
      default: return { label: role, color: theme.textSecondary, icon: 'help-circle' as const };
    }
  };

  const roleConfig = getRoleConfig(utilisateur.role);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={() => onPress(utilisateur)}
      activeOpacity={0.7}
    >
      {/* Avatar + Infos */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: roleConfig.color + '20' }]}>
          <Ionicons name={roleConfig.icon} size={22} color={roleConfig.color} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{utilisateur.nom}</Text>
            {!utilisateur.actif && (
              <View style={[styles.inactifBadge, { backgroundColor: theme.dangerLight }]}>
                <Text style={[styles.inactifText, { color: theme.danger }]}>Inactif</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.roleBadge, { backgroundColor: roleConfig.color + '15' }]}>
              <Text style={[styles.roleText, { color: roleConfig.color }]}>{roleConfig.label}</Text>
            </View>
            <Text style={[styles.commission, { color: theme.textTertiary }]}>
              Com: {utilisateur.commission_defaut?.toLocaleString()} FCFA
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: utilisateur.actif ? theme.dangerLight : theme.secondaryLight }]}
          onPress={() => onToggleActif(utilisateur.id, utilisateur.nom, utilisateur.actif)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={utilisateur.actif ? 'close-circle' : 'checkmark-circle'}
            size={20}
            color={utilisateur.actif ? theme.danger : theme.secondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  inactifBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactifText: {
    fontSize: 10,
    fontWeight: '600',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  commission: {
    fontSize: 11,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});