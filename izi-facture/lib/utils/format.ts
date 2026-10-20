import { Invoice, InvoiceStatus } from '@/types';

/**
 * Formate un montant entier en FCFA avec séparateurs de milliers.
 * Ex: 250000 -> "250 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount || 0);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Formate une date ISO (YYYY-MM-DD) en format français jour/mois/année (DD/MM/YYYY).
 * Ex: "2026-01-15" -> "15/01/2026"
 */
export function formatDateFR(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string') {
    // Si format ISO direct YYYY-MM-DD
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * "Abidjan, Côte d'Ivoire" — ignore les parties vides (nouveau compte sans adresse)
 */
export function formatLocation(city?: string, country?: string): string {
  return [city, country].map((part) => part?.trim()).filter(Boolean).join(', ');
}

/**
 * Initiales pour un avatar : "Amadou Diallo" -> "AD", "contact@x.ci" -> "CO"
 */
export function getInitials(nameOrEmail: string): string {
  const clean = nameOrEmail.split('@')[0].trim();
  const words = clean.split(/[\s._-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase() || '?';
}

/**
 * Ajoute un nombre de jours à une date ISO (YYYY-MM-DD) et renvoie une date ISO.
 * Ex: addDaysISO("2026-10-19", 30) -> "2026-11-18"
 */
export function addDaysISO(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (isNaN(date.getTime())) return isoDate;
  date.setUTCDate(date.getUTCDate() + (days || 0));
  return date.toISOString().split('T')[0];
}

/**
 * Détermine si une facture est en retard (utilise le flag is_late ou le statut en_retard).
 */
export function isInvoiceLate(invoice: Pick<Invoice, 'status' | 'due_date' | 'is_late'>): boolean {
  if (typeof invoice.is_late === 'boolean') return invoice.is_late;
  return invoice.status === 'en_retard';
}

/**
 * Configuration visuelle des statuts selon la charte demandée :
 * - Payée : vert
 * - Envoyée : orange
 * - Brouillon : gris
 * - En retard : rouge
 */
export const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  payee: {
    label: 'Payée',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  envoyee: {
    label: 'Envoyée',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    dot: 'bg-amber-500',
  },
  brouillon: {
    label: 'Brouillon',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200/90',
    dot: 'bg-slate-400',
  },
  en_retard: {
    label: 'En retard',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    dot: 'bg-rose-500',
  },
  annulee: {
    label: 'Annulée',
    bg: 'bg-zinc-100',
    text: 'text-zinc-500',
    border: 'border-zinc-200',
    dot: 'bg-zinc-400',
  },
};
