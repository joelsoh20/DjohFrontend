import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';
import { Alert } from 'react-native';

// Configurer le comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export const notificationService = {
  // Demander la permission
  requestPermission: async () => {
    if (!Device.isDevice) {
      Alert.alert('Notifications', 'Les notifications ne fonctionnent que sur un appareil physique');
      return false;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Notifications', 'Permission refusée');
      return false;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    return true;
  },

  // Obtenir le token Expo Push
  getExpoPushToken: async () => {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '29287523-3a5f-413b-8fe1-4326daff789c',
    });
    return token.data;
  },

  // Enregistrer le token sur le backend
  registerToken: async (token: string) => {
  try {
    console.log('📤 Envoi token au backend:', token);
    const response = await api.post('/notifications/register', { token });
    console.log('✅ Token enregistré, réponse:', response.data);
  } catch (err: any) {
    console.log('❌ Erreur enregistrement token:', err?.response?.status, err?.response?.data || err?.message);
  }
},

  // Supprimer le token du backend (désactivation des notifications) — sans
  // ça, le serveur continue d'envoyer des pushs à cet appareil même après
  // que l'utilisateur ait "désactivé" les notifications dans l'app,
  // puisque la permission OS elle-même ne peut pas être révoquée par l'app.
  removeToken: async (token: string) => {
    try {
      await api.delete('/notifications/token', { data: { token } });
    } catch (err: any) {
      console.log('❌ Erreur suppression token:', err?.response?.status, err?.response?.data || err?.message);
    }
  },
  // Envoyer une notification locale
  sendLocal: async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null, // Immédiat
    });
  },
};

