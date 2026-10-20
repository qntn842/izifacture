import React from 'react';
import Link from 'next/link';
import { Invoice } from '@/types';
import { formatFCFA, formatDateFR, isInvoiceLate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, FileText, Download, Eye, ExternalLink } from 'lucide-react';

interface RecentInvoicesTableProps {
  invoices: Invoice[];
}

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const displayInvoices = invoices.slice(0, 5);

  return (
    <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Dernières factures
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique des 5 factures les plus récentes émises
          </p>
        </div>
        <Link
          href="/factures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors self-start sm:self-auto"
        >
          Voir toutes les factures
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-5 sm:px-6">N° Facture</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Date d'émission</th>
              <th className="py-3 px-4">Échéance</th>
              <th className="py-3 px-4 text-right">Montant</th>
              <th className="py-3 px-4 text-center">Statut</th>
              <th className="py-3 px-5 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayInvoices.map((inv) => {
              const late = isInvoiceLate(inv);
              return (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/60 transition-colors group cursor-default"
                >
                  {/* N° Facture */}
                  <td className="py-3.5 px-5 sm:px-6 font-semibold text-slate-900 font-mono text-xs whitespace-nowrap">
                    <Link
                      href={`/factures/${inv.id}`}
                      className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>{inv.invoice_number}</span>
                    </Link>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                        {inv.client_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm truncate max-w-[180px]">
                          {inv.client_name}
                        </div>
                        {inv.client_email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {inv.client_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Date d'émission */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                    {formatDateFR(inv.issue_date)}
                  </td>

                  {/* Échéance */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs ${
                        late
                          ? 'font-semibold text-rose-600 flex items-center gap-1'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatDateFR(inv.due_date)}
                      {late && (
                        <span className="text-[10px] bg-rose-100/70 text-rose-700 px-1 py-0.2 rounded font-medium">
                          Passée
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Montant FCFA */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {formatFCFA(inv.total)}
                    </span>
                  </td>

                  {/* Statut Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <Badge status={inv.status} isLate={late} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir la facture"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/factures/${inv.id}/apercu`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 px-6 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Aucune facture pour le moment</h4>
                    <p className="text-xs text-slate-500">
                      Créez votre première facture : elle apparaîtra ici avec son statut.
                    </p>
                    <Link
                      href="/factures/nouvelle"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-brand-hover text-white text-xs font-medium transition-colors"
                    >
                      Créer une facture
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer link for mobile */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center sm:hidden">
        <Link
          href="/factures"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Voir toutes les factures ({invoices.length}) →
        </Link>
      </div>
    </div>
  );
}
