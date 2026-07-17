import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useProfil } from '../hooks/useProfil';

import { ProfilHeader } from '../components/profil/ProfilHeader';
import { SectionParametre } from '../components/profil/SectionParametre';
import { ChangePasswordModal } from '../components/profil/ChangePasswordModal';
import { InfoAppCard } from '../components/profil/InfoAppCard';
import { Button } from '../components/Button';
import { Langue, ThemeMode } from '../types';

export const ProfilParametresScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const {
    showPasswordModal,
    setShowPasswordModal,
    loadingPassword,
    changerMotDePasse,
    themeMode,
    setThemeMode,
    langue,
    setLangue,
    handleLogout,
  } = useProfil();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfilHeader />

        {/* Admin peut changer son mot de passe, pas le manager */}
        {isAdmin && (
          <SectionParametre
            title="Sécurité"
            options={[{
              type: 'navigation',
              icon: 'lock-closed',
              label: 'Modifier le mot de passe',
              color: theme.warning,
              onPress: () => setShowPasswordModal(true),
            }]}
          />
        )}

        <SectionParametre
          title="Préférences"
          options={[
            {
              type: 'select',
              icon: 'color-palette',
              label: t('parametres.theme'),
              value: themeMode,
              options: [
                { label: '☀️ Clair', value: 'clair' },
                { label: '🌙 Sombre', value: 'sombre' },
              ],
              color: theme.primary,
              onSelect: (value: string) => setThemeMode(value as ThemeMode),
            },
            {
              type: 'select',
              icon: 'language',
              label: t('parametres.language'),
              value: langue,
              options: [
                { label: '🇫🇷 FR', value: 'fr' },
                { label: '🇬🇧 EN', value: 'en' },
              ],
              color: theme.secondary,
              onSelect: (value: string) => setLangue(value as Langue),
            },
            {
              type: 'switch',
              icon: 'notifications',
              label: t('parametres.notifications'),
              value: false,
              color: theme.primary,
              onToggle: (value: boolean) => console.log('Notifications:', value),
            },
          ]}
        />

      {/* Section Gestion (Admin et Manager) */}
<SectionParametre
  title="Gestion"
  options={[
    {
      type: 'navigation' as const,
      icon: 'cube',
      label: 'Stock',
      color: theme.secondary,
      onPress: () => navigation.navigate('Gestion', { screen: 'Stock' }),
    },
    {
      type: 'navigation' as const,
      icon: 'bicycle',
      label: 'Services de livraison',
      color: '#FF6B35',
      onPress: () => navigation.navigate('Gestion', { screen: 'ServicesLivraison' }),
    },
    ...(isAdmin ? [
      {
        type: 'navigation' as const,
        icon: 'people',
        label: 'Utilisateurs',
        color: theme.primary,
        onPress: () => navigation.navigate('Gestion', { screen: 'Utilisateurs' }),
      },
      {
        type: 'navigation' as const,
        icon: 'cube'  as any,
        label: 'Produits',
        color: theme.secondary,
        onPress: () => navigation.navigate('Gestion', { screen: 'Produits' }),
      },
      {
        type: 'navigation' as const,
        icon: 'settings',
        label: 'Commissions',
        color: '#FF6B35',
        onPress: () => navigation.navigate('Gestion', { screen: 'Commissions' }),
      },
    ] : []),
  ]}
/>

        <InfoAppCard />

        <View style={styles.logoutContainer}>
          <Button title="Se déconnecter" onPress={handleLogout} variant="danger" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ChangePasswordModal
        visible={showPasswordModal}
        loading={loadingPassword}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={async (ancien, nouveau) => {
          await changerMotDePasse(ancien, nouveau);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  logoutContainer: { paddingHorizontal: 16, marginTop: 24 },
});