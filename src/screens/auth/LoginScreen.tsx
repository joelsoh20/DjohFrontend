import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW_CARD } from '../../utils/designSystem';
import { Image } from 'react-native';

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const identifiantTrimmed = identifiant.trim();

    if (!identifiantTrimmed || !motDePasse) {
      Alert.alert(t('common.error'), 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      // L'API attend un email, donc on l'utilise comme identifiant
      await login(identifiantTrimmed, motDePasse);
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.loginError');
      Alert.alert(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Bouton thème en haut à droite */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.surfaceVariant }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>

        {/* Logo / Titre */}
        <View style={styles.logoContainer}>
  <Image 
    source={require('../../../assets/logo.png')}
    style={styles.logo}
    resizeMode="contain"
  />
  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
    {t('auth.loginTitle')}
  </Text>
</View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Champ Nom d'utilisateur */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Nom d'utilisateur
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.divider }, SHADOW_CARD]}>
              <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Votre nom d'utilisateur"
                placeholderTextColor={theme.textTertiary}
                value={identifiant}
                onChangeText={setIdentifiant}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('auth.password')}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.divider }, SHADOW_CARD]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={theme.textTertiary}
                value={motDePasse}
                onChangeText={setMotDePasse}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton Connexion */}
          <Button
            title={loading ? '' : t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </View>

        {/* Pied de page */}
        <Text style={[styles.footer, { color: theme.textTertiary }]}>
          {t('parametres.version')} 2.2.1
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
  width: 150,
  height: 150,
  marginBottom: 16,
  borderRadius: 75,
},
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
  },
  form: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
  },
  inputIcon: {
    marginRight: SPACING.sm + 2,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZE.lg,
  },
  eyeButton: {
    padding: SPACING.sm,
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  footer: {
    textAlign: 'center',
    marginTop: SPACING.xxxl + 8,
    fontSize: FONT_SIZE.sm,
  },
});