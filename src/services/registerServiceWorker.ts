import { Platform } from 'react-native';

/**
 * Active le service worker de la PWA. Sans lui, l'app reste un simple site :
 * pas d'installation sur l'écran d'accueil, pas de démarrage hors ligne.
 *
 * N'a aucun effet sur mobile (iOS/Android natif) ni en développement, où le
 * cache du service worker gêne le rechargement à chaud.
 */
export const registerServiceWorker = (): void => {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  // En développement, un service worker actif sert d'anciens fichiers en
  // cache et masque les modifications de code.
  if (__DEV__) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service worker enregistré', registration.scope);
      })
      .catch((err) => {
        console.log('⚠️ Service worker non enregistré :', err?.message);
      });
  });
};
