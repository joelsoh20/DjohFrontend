// ==========================================
// TYPES GLOBAL POUR L'APPLICATION
// ==========================================

export type Role = 'admin' | 'manager' | 'commercial';
export type StatutCommande = 'recue' | 'livree_payee' | 'annulee';
export type TypeCharge = 'publicite' | 'echantillon';
export type CommissionMode = 'forfaitaire' | 'par_produit';
export type ActionCommandesEnAttente = 'annulees' | 'reportees';
export type ThemeMode = 'clair' | 'sombre';
export type Langue = 'fr' | 'en';

// Utilisateur
export interface Utilisateur {
  id: string;
  nom: string;
  // email: string;
  role: Role;
  commission_mode: CommissionMode;
  commission_defaut: number;
  actif: boolean;
  date_creation: string;
  commissions_produits?: ProductCommission[];
}

// Produit
export interface Produit {
  id: string;
  nom: string;
  prix_catalogue: number;
  cout_revient: number;
  actif: boolean;
  date_creation: string;
}

// Commission par produit
export interface ProductCommission {
  id: string;
  user_id: string;
  product_id: string;
  montant: number;
  produit?: Produit;
}
// Commande
export interface Commande {
  id: string;
  date_creation: string;
  date_statut_livree: string | null;
  client_nom: string;
  client_telephone: string | null;
  client_quartier: string | null;
  product_id: string;
  produit?: Produit;
  quantite: number;
  prix_unitaire_reel: number;
  commercial_id: string;
  commercial?: Utilisateur;
  frais_livraison: number;
  statut: StatutCommande;
  commission_commercial: number;
  cloture_id: string | null;
}

// Charge
export interface Charge {
  id: string;
  date: string;
  type: TypeCharge;
  montant: number;
  description: string | null;
  commercial_id: string | null;
  commercial?: Utilisateur;
}

// Clôture mensuelle
export interface MonthlyClosing {
  id: string;
  mois: number;
  annee: number;
  ca_total: number;
  benefice_net_total: number;
  commissions_json: CommissionSnapshot[];
  commandes_en_attente_action: ActionCommandesEnAttente;
  pdf_export_url: string | null;
  cloture_par: string;
  date_cloture: string;
}

export interface CommissionSnapshot {
  commercial_id: string;
  nom: string;
  produits_vendus: number;
  montant_du: number;
}

// Dashboard
export interface DashboardData {
  jour: StatsPeriode;
  semaine: StatsPeriode;
  mois: StatsMois;
  semestre: StatsSemestre;
  annee: StatsAnnee;
  topProduits: TopProduit[];       // ← Vérifie cette ligne
  evolutionMensuelle: EvolutionMensuelle[];
}

export interface StatsPeriode {
  chiffreAffaires: number;
  beneficeNet: number;
  nombreCommandes: number;
}

export interface StatsMois extends StatsPeriode {
  beneficeBrut: number;
  beneficeNet: number;
  totalCharges: number;
  detailsCharges: { type: string; montant: number }[];
}

export interface StatsSemestre {
  chiffreAffaires: number;
  beneficeNet: number;
  moyenneMensuelle: number;
}

export interface StatsAnnee {
  chiffreAffaires: number;
  beneficeNet: number;
  projectionCA: number;
  projectionBenefice: number;
}

export interface TopProduit {
  id: string;
  nom: string;
  chiffreAffaires: number;
  nombre: number;
}

export interface EvolutionMensuelle {
  mois: string;
  chiffreAffaires: number;
  beneficeNet: number;
}

// API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

// Formulaires
export interface CreerCommandeData {
  client_nom: string;
  client_telephone?: string | null;
  client_quartier?: string | null;
  product_id: string;
  quantite: number;
  prix_unitaire_reel: number;
  deliverer_id?: string | null;
  frais_livraison: number;
}

export interface CreerUtilisateurData {
  nom: string;
  email: string;
  mot_de_passe: string;
  role: Role;
  commission_mode: CommissionMode;
  commission_defaut: number;
}

export interface CreerProduitData {
  nom: string;
  prix_catalogue: number;
  cout_revient: number;
}

export interface CreerChargeData {
  date: string;
  type: TypeCharge;
  montant: number;
  description?: string;
  commercial_id?: string;
}