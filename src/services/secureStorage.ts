import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Stockage du token et des données utilisateur, compatible mobile ET web.
 *
 * expo-secure-store n'existe PAS sur le web (il repose sur le Keychain iOS /
 * Keystore Android) : l'appeler depuis un navigateur lève une erreur et
 * empêche toute connexion. On bascule donc sur localStorage côté web.
 *
 * ⚠️ Note de sécurité : localStorage n'est pas chiffré et reste lisible par
 * tout script de la page. C'est le standard pour une app web, mais ça reste
 * moins protégé que le Keychain. Le token doit donc garder une durée de vie
 * raisonnable côté backend.
 *
 * ⚠️ Note iOS/PWA : Safari peut purger localStorage après ~7 jours sans
 * utilisation de la PWA — l'utilisateur devra alors se reconnecter. C'est un
 * comportement d'iOS, pas un bug de l'app.
 */

const estWeb = Platform.OS === 'web';

export const secureStorage = {
  async getItem(cle: string): Promise<string | null> {
    if (estWeb) {
      try {
        return globalThis.localStorage?.getItem(cle) ?? null;
      } catch {
        return null; // navigation privée ou stockage bloqué
      }
    }
    return SecureStore.getItemAsync(cle);
  },

  async setItem(cle: string, valeur: string): Promise<void> {
    if (estWeb) {
      try {
        globalThis.localStorage?.setItem(cle, valeur);
      } catch {
        // stockage plein ou bloqué : on ignore, l'utilisateur restera
        // connecté le temps de la session en cours uniquement
      }
      return;
    }
    await SecureStore.setItemAsync(cle, valeur);
  },

  async removeItem(cle: string): Promise<void> {
    if (estWeb) {
      try {
        globalThis.localStorage?.removeItem(cle);
      } catch {
        // rien à faire
      }
      return;
    }
    await SecureStore.deleteItemAsync(cle);
  },
};
