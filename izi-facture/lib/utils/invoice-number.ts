import { Invoice } from '@/types';

/**
 * Calcule le prochain numéro de facture séquentiel pour l'année donnée.
 * Ex: avec FACT-20260006 existant -> "FACT-20260007"
 */
export function getNextInvoiceNumber(
  invoices: Pick<Invoice, 'invoice_number'>[],
  prefix: string,
  year: number
): string {
  const pattern = new RegExp(`^${prefix}-${year}(\\d+)$`);
  const lastSequence = invoices.reduce((max, inv) => {
    const match = inv.invoice_number.match(pattern);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${year}${String(lastSequence + 1).padStart(4, '0')}`;
}
