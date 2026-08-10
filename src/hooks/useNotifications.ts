import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { utilisateur } = useAuth();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!utilisateur) return;

    // Les notifications push Expo ne fonctionnent pas dans un navigateur :
    // getExpoPushToken() échoue et les listeners natifs n'existent pas.
    // Sur web, on ne fait donc rien (le reste de l'app fonctionne
    // normalement). Pour avoir des notifications dans la PWA, il faudra
    // implémenter l'API Web Push (service worker + VAPID) côté serveur.
    if (Platform.OS === 'web') return;

    const setup = async () => {
      try {
        const granted = await notificationService.requestPermission();
        if (!granted) {
          console.log('📱 Permission notifications refusée');
          return;
        }

        const token = await notificationService.getExpoPushToken();
        console.log('📱 Token obtenu:', token);
        await notificationService.registerToken(token);
      } catch (err: any) {
        // Cet échec était jusqu'ici totalement silencieux (simple
        // console.log), ce qui masquait la vraie cause : dans une build
        // autonome (APK/AAB), getExpoPushTokenAsync échoue si les
        // identifiants Firebase (google-services.json + clé FCM V1 côté
        // EAS) ne sont pas configurés. Dans Expo Go ça marche quand même,
        // car Expo Go utilise le projet Firebase d'Expo — d'où le
        // symptôme "ça marche sur Expo Go mais pas dans l'app".
        const message = err?.message || 'erreur inconnue';
        console.log('❌ Notifications indisponibles :', message);

        if (message.includes('FirebaseApp') || message.includes('FCM') || message.includes('credential')) {
          Alert.alert(
            'Notifications indisponibles',
            "Les identifiants Firebase ne sont pas configurés pour cette version de l'application. Les notifications push ne fonctionneront pas tant que ce n'est pas réglé."
          );
        }
      }
    };

    setup();

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification reçue:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification ouverte:', response);
      });
    } catch (err) {
      console.log('Listeners non disponibles');
    }

    return () => {
      try {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      } catch {}
    };
  }, [utilisateur]);
};