export type InvoiceStatus = 'brouillon' | 'envoyee' | 'payee' | 'annulee' | 'en_retard';

export type Currency = 'XOF' | 'XAF' | 'EUR' | 'USD';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string; // vide si le client a été supprimé (la facture garde ses coordonnées)
  client_name: string;
  client_email?: string;
  client_phone?: string;
  status: InvoiceStatus;
  issue_date: string; // Format YYYY-MM-DD
  due_date: string;   // Format YYYY-MM-DD
  currency: Currency;
  tax_rate: number;   // e.g. 18 for 18%
  discount_rate: number; // e.g. 0 or 10
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  tax_amount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
  is_late?: boolean; // calculé par la base : statut "en_retard" ou échéance dépassée
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  invoices_count?: number;
  total_billed?: number;
  created_at: string;
}

export interface CompanySettings {
  company_name: string;
  registration_number?: string; // RC / NINEA / RCCM
  address_line1: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  currency: Currency;
  tax_rate: number;
  invoice_prefix: string;
  payment_terms_days: number; // délai de paiement par défaut (jours)
  default_notes?: string;     // notes / conditions pré-remplies sur chaque nouvelle facture
}

/** Utilisateur connecté (Supabase Auth) */
export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
}

export interface DashboardStats {
  totalBilled: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoicesCount: number;
  overdueCount: number;
}
