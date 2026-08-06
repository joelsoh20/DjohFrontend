import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
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
    console.log('📱 Demande permission...');
    const granted = await notificationService.requestPermission();
    console.log('📱 Permission:', granted);
    
    if (granted) {
      console.log('📱 Récupération token...');
      const token = await notificationService.getExpoPushToken();
      console.log('📱 Token obtenu:', token);
      await notificationService.registerToken(token);
    } else {
      console.log('📱 Permission refusée');
    }
  } catch (err: any) {
    console.log('❌ Erreur setup notifications:', err?.message);
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