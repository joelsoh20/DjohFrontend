import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { utilisateur } = useAuth();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!utilisateur) return;

    const setup = async () => {
      try {
        const granted = await notificationService.requestPermission();
        if (granted) {
          const token = await notificationService.getExpoPushToken();
          await notificationService.registerToken(token);
        }
      } catch (err: any) {
  console.log('Notifications non disponibles:', err?.message);
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