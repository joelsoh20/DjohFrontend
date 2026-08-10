import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface EcranAvecClavierProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Décalage supplémentaire si un en-tête de navigation est présent */
  offset?: number;
  /** Désactive le défilement (pour un contenu déjà scrollable) */
  sansScroll?: boolean;
}

/**
 * Remonte automatiquement le contenu au-dessus du clavier pour que le champ
 * en cours de saisie reste visible.
 *
 * Sans ça, sur beaucoup d'écrans le clavier recouvre l'input : on tape sans
 * voir ce qu'on écrit.
 *
 * Détails de comportement :
 * - iOS utilise 'padding' (le clavier se superpose au contenu).
 * - Android utilise 'height' (le système redimensionne déjà la fenêtre).
 * - Sur le web, aucun ajustement n'est nécessaire : le navigateur fait
 *   défiler automatiquement jusqu'au champ actif.
 * - Un appui hors des champs referme le clavier (mobile uniquement).
 */
export const EcranAvecClavier: React.FC<EcranAvecClavierProps> = ({
  children,
  style,
  contentContainerStyle,
  offset = 0,
  sansScroll = false,
}) => {
  const contenu = sansScroll ? (
    children
  ) : (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return <>{contenu}</>;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {contenu as React.ReactElement}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
