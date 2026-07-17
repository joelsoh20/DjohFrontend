import { Produit } from './index';

export interface CommandeFormData {
  client_nom: string;
  client_telephone: string;
  client_quartier: string;
  product_id: string | null;
  quantite: string;
  prix_unitaire_reel: string;
  deliverer_id: string | null;
  frais_livraison: string;
}

export interface FormErrors {
  client_nom?: string;
  product_id?: string;
  prix_unitaire_reel?: string;
  frais_livraison?: string;
}

export interface CommandeFormState {
  data: CommandeFormData;
  errors: FormErrors;
  produits: Produit[];
  loadingData: boolean;
  loadingSubmit: boolean;
  selectedProduit: Produit | null;
  totalCommande: number;
  commissionEstimee: number;
}