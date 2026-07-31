// Navigation Commercial
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Écrans Commercial
import { CommercialDashboardScreen } from '../screens/commercial/CommercialDashboardScreen';
import { NouvelleCommandeScreen } from '../screens/commercial/NouvelleCommandeScreen';
import { ProfilParametresScreen } from '../screens/ProfilParametresScreen';
import { ClassementScreen } from '../screens/ClassementScreen';
import { ListeCommandesScreen } from '../screens/admin/ListeCommandesScreen'; 

export type CommercialStackParamList = {
  CommercialAccueil: undefined;
  NouvelleCommande: undefined;
  ListeCommandes: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<CommercialStackParamList>();

// Stack Accueil
const AccueilStackScreen = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.surface },
      headerTintColor: theme.text,
      headerTitleStyle: { fontWeight: '600' },
    }}>
      <Stack.Screen 
        name="CommercialAccueil" 
        component={CommercialDashboardScreen} 
        options={{ title: 'Mon Tableau de Bord' }} 
      />
      <Stack.Screen 
        name="ListeCommandes" 
        component={ListeCommandesScreen} 
        options={{ title: 'Historique' }} 
      />
      <Stack.Screen 
        name="NouvelleCommande" 
        component={NouvelleCommandeScreen} 
        options={{ title: 'Nouvelle Commande' }} 
      />
    </Stack.Navigator>
  );
};

// Stack Commande
const CommandeStackScreen = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.surface },
      headerTintColor: theme.text,
      headerTitleStyle: { fontWeight: '600' },
    }}>
      <Stack.Screen 
        name="NouvelleCommande" 
        component={NouvelleCommandeScreen} 
        options={{ title: 'Nouvelle Commande' }} 
      />
    </Stack.Navigator>
  );
};

export const CommercialNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          switch (route.name) {
            case 'Accueil':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Commande':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Profil':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.divider,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={AccueilStackScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Commande" component={CommandeStackScreen} options={{ title: 'Commande' }} />
      <Tab.Screen name="Classement" component={ClassementScreen} options={{ title: 'Classement' }} />
      <Tab.Screen 
        name="Profil" 
        component={ProfilParametresScreen} 
        options={{ title: 'Profil' }} 
      />
    </Tab.Navigator>
  );
};