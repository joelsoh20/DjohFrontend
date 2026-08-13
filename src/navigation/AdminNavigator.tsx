import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ProfilParametresScreen } from '../screens/ProfilParametresScreen';

// Écrans Admin
import { DashboardScreen } from '../screens/admin/DashboardScreen';
import { ValidationLivraisonsScreen } from '../screens/admin/ValidationLivraisonsScreen';
import { ListeCommandesScreen } from '../screens/admin/ListeCommandesScreen';
import { NouvelleCommandeScreen } from '../screens/commercial/NouvelleCommandeScreen';
import { UtilisateursScreen } from '../screens/admin/UtilisateursScreen';
import { FormulaireUtilisateurScreen } from '../screens/admin/FormulaireUtilisateurScreen';
import { ProduitsScreen } from '../screens/admin/ProduitsScreen';
import { FormulaireProduitScreen } from '../screens/admin/FormulaireProduitScreen';
import { ChargesScreen } from '../screens/admin/ChargesScreen';
import { FormulaireChargeScreen } from '../screens/admin/FormulaireChargeScreen';
import { CommissionsScreen } from '../screens/admin/CommissionsScreen';
import { ClotureMensuelleScreen } from '../screens/admin/ClotureMensuelleScreen';
import { ExportsScreen } from '../screens/admin/ExportsScreen';
import { StockScreen } from '../screens/admin/StockScreen';
import { ServicesLivraisonScreen } from '../screens/admin/ServicesLivraisonScreen';
import { StatsLivraisonScreen } from '../screens/admin/StatsLivraisonScreen';
import { StatsLivraisonJourScreen } from '../screens/admin/StatsLivraisonJourScreen';
import { ClassementScreen } from '../screens/ClassementScreen';
import { StatsCommercialScreen } from '../screens/admin/StatsCommercialScreen';
import { GestionAccueilScreen } from '../screens/admin/GestionAccueilScreen';

// Types
type DashboardStackParamList = { 
  DashboardMain: undefined; 
  ClotureMensuelle: undefined; 
  Exports: undefined; 
  StatsCommercial: { commercialId: string; nom: string };
};
type CommandesStackParamList = {
   ValidationLivraisons: undefined;
   ListeCommandes: { orderId?: string; openComments?: boolean } | undefined;
    NouvelleCommande: undefined };

type GestionStackParamList = {
  GestionAccueil: undefined;
  Stock: undefined;
  ServicesLivraison: undefined;
  StatsLivraison: undefined;
  StatsLivraisonJour: undefined;
  Produits: undefined;
  FormulaireProduit: { productId?: string } | undefined;
  Utilisateurs: undefined;
  FormulaireUtilisateur: { userId?: string } | undefined;
  Commissions: undefined;
};
type ChargesStackParamList = { ChargesList: undefined; 
  FormulaireCharge: { chargeId?: string } | undefined };

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const CommandesStack = createNativeStackNavigator<CommandesStackParamList>();
const GestionStack = createNativeStackNavigator<GestionStackParamList>();
const ChargesStack = createNativeStackNavigator<ChargesStackParamList>();

const DashboardStackScreen = () => {
  const { theme } = useTheme();
  return (
    <DashboardStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Tableau de Bord' }} />
      <DashboardStack.Screen name="ClotureMensuelle" component={ClotureMensuelleScreen} options={{ title: 'Clôture Mensuelle' }} />
      <DashboardStack.Screen name="Exports" component={ExportsScreen} options={{ title: 'Exports Comptables' }} />
      <DashboardStack.Screen name="StatsCommercial" component={StatsCommercialScreen} options={{ title: 'Stats Commercial' }} />
    </DashboardStack.Navigator>
  );
};

const CommandesStackScreen = () => {
  const { theme } = useTheme();
  return (
    <CommandesStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}>
      <CommandesStack.Screen name="ValidationLivraisons" component={ValidationLivraisonsScreen} options={{ title: 'Validation' }} />
      <CommandesStack.Screen name="ListeCommandes" component={ListeCommandesScreen} options={{ title: 'Commandes' }} />
      <CommandesStack.Screen name="NouvelleCommande" component={NouvelleCommandeScreen} options={{ title: 'Nouvelle' }} />
    </CommandesStack.Navigator>
  );
};

const GestionStackScreen = () => {
  const { theme } = useTheme();
  return (
    <GestionStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}>
      <GestionStack.Screen name="GestionAccueil" component={GestionAccueilScreen} options={{ title: 'Gestion' }} />
      <GestionStack.Screen name="Stock" component={StockScreen} options={{ title: 'Stock' }} />
      <GestionStack.Screen name="ServicesLivraison" component={ServicesLivraisonScreen} options={{ title: 'Services Livraison' }} />
      <GestionStack.Screen name="StatsLivraison" component={StatsLivraisonScreen} options={{ title: 'Stats Livraison' }} />
      <GestionStack.Screen name="StatsLivraisonJour" component={StatsLivraisonJourScreen} options={{ title: 'Encaissements Livraison' }} />
      <GestionStack.Screen name="Produits" component={ProduitsScreen} options={{ title: 'Produits' }} />
      <GestionStack.Screen name="FormulaireProduit" component={FormulaireProduitScreen} options={{ title: 'Produit' }} />
      <GestionStack.Screen name="Utilisateurs" component={UtilisateursScreen} options={{ title: 'Utilisateurs' }} />
      <GestionStack.Screen name="FormulaireUtilisateur" component={FormulaireUtilisateurScreen} options={{ title: 'Utilisateur' }} />
      <GestionStack.Screen name="Commissions" component={CommissionsScreen} options={{ title: 'Commissions' }} />
    </GestionStack.Navigator>
  );
};

const ChargesStackScreen = () => {
  const { theme } = useTheme();
  return (
    <ChargesStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}>
      <ChargesStack.Screen name="ChargesList" component={ChargesScreen} options={{ title: 'Charges' }} />
      <ChargesStack.Screen name="FormulaireCharge" component={FormulaireChargeScreen} options={{ title: 'Charge' }} />
    </ChargesStack.Navigator>
  );
};

export const AdminNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Dashboard': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Commandes': iconName = focused ? 'cart' : 'cart-outline'; break;
            case 'Classement': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'Gestion': iconName = focused ? 'settings' : 'settings-outline'; break;
            case 'Charges': iconName = focused ? 'cash' : 'cash-outline'; break;
            case 'Profil': iconName = focused ? 'person' : 'person-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.divider },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Commandes" component={CommandesStackScreen} options={{ title: 'Commandes' }} />
      <Tab.Screen name="Classement" component={ClassementScreen} options={{ title: '🏆 Classement' }} />
      <Tab.Screen name="Gestion" component={GestionStackScreen} options={{ title: 'Gestion' }} />
      <Tab.Screen name="Charges" component={ChargesStackScreen} options={{ title: 'Charges' }} />
      <Tab.Screen name="Profil" component={ProfilParametresScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};