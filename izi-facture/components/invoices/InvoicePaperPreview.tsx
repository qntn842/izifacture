'use client';

import React from 'react';
import { Invoice, CompanySettings } from '@/types';
import { formatFCFA, formatDateFR, formatLocation } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Building2, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

interface InvoicePaperPreviewProps {
  invoice: Partial<Invoice>;
  company: CompanySettings;
  className?: string;
  isDraftWatermark?: boolean;
}

export function InvoicePaperPreview({
  invoice,
  company,
  className = '',
  isDraftWatermark = false,
}: InvoicePaperPreviewProps) {
  const items = invoice.items || [];
  const taxRate = invoice.tax_rate ?? company.tax_rate ?? 18;
  const subtotal = invoice.subtotal ?? items.reduce((acc, it) => acc + (it.line_total || 0), 0);
  const discountRate = invoice.discount_rate ?? 0;
  const discountAmount =
    invoice.discount_amount ?? (discountRate > 0 ? Math.round((subtotal * discountRate) / 100) : 0);
  const taxableAmount = invoice.taxable_amount ?? Math.max(0, subtotal - discountAmount);
  const taxAmount = invoice.tax_amount ?? Math.round((taxableAmount * taxRate) / 100);
  const total = invoice.total ?? taxableAmount + taxAmount;

  return (
    <div
      className={`theme-light bg-surface rounded-2xl border border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] p-6 sm:p-8 relative overflow-hidden select-text transition-all ${className}`}
      id="invoice-print-area"
    >
      {/* Draft watermark if applicable */}
      {isDraftWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <span className="text-7xl sm:text-9xl font-black uppercase tracking-widest text-slate-900 rotate-[-25deg]">
            Brouillon
          </span>
        </div>
      )}

      {/* Top Header of the document */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <span className="font-extrabold text-base tracking-tight">IF</span>
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg tracking-tight block leading-tight">
                {company.company_name}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                {formatLocation(company.city, company.country)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-0.5 mt-2">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{company.address_line1}</span>
            </p>
            {company.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{company.phone}</span>
              </p>
            )}
            {company.email && (
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{company.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="sm:text-right flex flex-col sm:items-end justify-between">
          <div>
            <div className="flex items-center sm:justify-end gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Facture
              </h2>
              {invoice.status && (
                <div className="scale-90 origin-right">
                  <Badge status={invoice.status} isLate={invoice.is_late} />
                </div>
              )}
            </div>
            <p className="font-mono text-xs sm:text-sm font-semibold text-slate-500">
              N° {invoice.invoice_number || 'FACT-XXXXXXXX'}
            </p>
          </div>

          <div className="mt-4 pt-3 sm:border-t sm:border-slate-100 flex flex-wrap sm:flex-col gap-3 sm:gap-1 text-xs">
            <div className="flex items-center sm:justify-end gap-2 text-slate-500">
              <span className="text-slate-400">Émise le :</span>
              <span className="font-semibold text-slate-800">
                {formatDateFR(invoice.issue_date) || "Aujourd'hui"}
              </span>
            </div>
            <div className="flex items-center sm:justify-end gap-2 text-slate-500">
              <span className="text-slate-400">Échéance :</span>
              <span className="font-semibold text-rose-600">
                {formatDateFR(invoice.due_date) || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client & Issuer Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Émetteur
          </span>
          <p className="text-sm font-bold text-slate-900">{company.company_name}</p>
          <p className="text-xs text-slate-600 mt-0.5">{company.address_line1}</p>
          <p className="text-xs text-slate-600">
            {formatLocation(company.city, company.country)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{company.phone}</p>
          {company.registration_number && (
            <p className="text-[11px] text-slate-500 mt-0.5">RC / NINEA : {company.registration_number}</p>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Facturé à (Client)
          </span>
          <p className="text-sm font-bold text-slate-900">
            {invoice.client_name || (
              <span className="text-slate-400 italic font-normal">Sélectionnez un client</span>
            )}
          </p>
          {invoice.client_email && (
            <p className="text-xs text-slate-600 mt-0.5">{invoice.client_email}</p>
          )}
          {invoice.client_phone && (
            <p className="text-xs text-slate-600">{invoice.client_phone}</p>
          )}
          <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/60">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Devise : FCFA ({invoice.currency || company.currency})
          </span>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto my-6">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-2.5 pr-4">Description</th>
              <th className="py-2.5 px-3 text-center w-16">Qté</th>
              <th className="py-2.5 px-3 text-right w-28">Prix unit.</th>
              <th className="py-2.5 pl-3 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item.id || index} className="group">
                  <td className="py-3 pr-4 font-medium text-slate-800">
                    {item.description || (
                      <span className="text-slate-400 italic">Prestation sans nom</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600 font-mono">
                    {item.quantity || 1}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 font-mono">
                    {formatFCFA(item.unit_price || 0)}
                  </td>
                  <td className="py-3 pl-3 text-right font-bold text-slate-900 font-mono">
                    {formatFCFA(item.line_total || 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 italic text-xs">
                  Aucune ligne ajoutée pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-4 border-t border-slate-200">
        {/* Payment info notes */}
        <div className="sm:max-w-xs space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Moyens de paiement acceptés :</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            • Virement bancaire (RIB sur demande)<br />
            • Mobile Money : Wave, Orange Money, MTN MoMo<br />
            {invoice.notes && (
              <span className="block mt-1 pt-1 border-t border-slate-200/60 italic text-slate-600">
                « {invoice.notes} »
              </span>
            )}
          </p>
        </div>

        {/* Totals box */}
        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 py-1">
            <span>Sous-total HT</span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatFCFA(subtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-600 py-1">
              <span>Remise ({discountRate}%)</span>
              <span className="font-semibold font-mono">
                - {formatFCFA(discountAmount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 py-1 border-t border-slate-100">
            <span>TVA ({taxRate}%)</span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatFCFA(taxAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-base sm:text-lg font-bold text-slate-900 pt-2 border-t-2 border-slate-900">
            <span>Total TTC</span>
            <span className="text-blue-600 font-mono font-black">
              {formatFCFA(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Signature & footer stamp */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          <span>Merci pour votre confiance.</span>
          <span className="block text-[10px] text-slate-400">
            IZI FACTURE — Facturation certifiée UEMOA/Afrique
          </span>
        </div>
        <div className="text-right">
          <div className="font-serif italic text-slate-700 font-bold text-xs">
            {company.company_name}
          </div>
          <span className="text-[10px] text-slate-400">Signature autorisée</span>
        </div>
      </div>
    </div>
  );
}
