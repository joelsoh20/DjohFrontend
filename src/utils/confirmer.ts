import { Alert, Platform } from 'react-native';

/**

 * Pourquoi ce helper : sur mobile, Alert.alert affiche une alerte native
 * avec de vrais boutons et déclenche correctement les callbacks onPress.
 * Sur le web (react-native-web), Alert.alert ne reproduit pas ce
 * comportement — les callbacks des boutons ne se déclenchent pas, si bien
 * que l'action confirmée n'est JAMAIS exécutée (bouton qui "ne fait rien").
 *
 * Ce helper utilise window.confirm sur le web et Alert.alert sur mobile.
 *
 * Exemple :
 *   const ok = await confirmer('Supprimer ?', 'Cette action est définitive.');
 *   if (ok) { ... }
 */
export const confirmer = (
  titre: string,
  message: string,
  texteConfirmer: string = 'Confirmer',
  destructif: boolean = false
): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const reponse =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(`${titre}\n\n${message}`)
        : false;
    return Promise.resolve(reponse);
  }

  return new Promise((resolve) => {
    Alert.alert(titre, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
      {
        text: texteConfirmer,
        style: destructif ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
};

/**
 * Message d'information simple (sans bouton d'action à gérer).
 * Alert.alert sans callback fonctionne correctement sur web, mais on
 * uniformise ici pour un rendu cohérent.
 */
export const informer = (titre: string, message: string): void => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${titre}\n\n${message}`);
    }
    return;
  }
  Alert.alert(titre, message);
};
