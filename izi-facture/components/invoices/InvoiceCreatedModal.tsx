'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DownloadInvoiceButton } from '@/components/invoices/DownloadInvoiceButton';
import { CompanySettings, Invoice } from '@/types';

interface InvoiceCreatedModalProps {
  invoice: Invoice;
  company: CompanySettings;
  onBackToInvoices: () => void;
  onClose: () => void;
}

/**
 * Confirmation affichée après l'enregistrement d'une facture :
 * retour à la liste des factures ou téléchargement du PDF.
 */
export function InvoiceCreatedModal({
  invoice,
  company,
  onBackToInvoices,
  onClose,
}: InvoiceCreatedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-created-title"
        className="relative bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 ring-8 ring-emerald-50/50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3
            id="invoice-created-title"
            className="text-lg font-bold text-slate-900 tracking-tight mt-5"
          >
            Facture créée avec succès
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-mono font-semibold text-slate-700">{invoice.invoice_number}</span>
            {' · '}
            {invoice.client_name}
          </p>
          <p className="text-sm text-slate-500 mt-3">Que souhaitez-vous faire maintenant ?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={onBackToInvoices}
            className="bg-slate-900! hover:bg-slate-800! active:bg-slate-700! text-slate-50!"
          >
            Retourner aux factures
          </Button>
          <DownloadInvoiceButton invoice={invoice} company={company} />
        </div>
      </div>
    </div>
  );
}
