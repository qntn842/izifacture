'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/lib/context/DataContext';
import { InvoiceStatus, Invoice } from '@/types';
import { formatFCFA, formatDateFR, isInvoiceLate } from '@/lib/utils/format';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  Download,
  X,
  ExternalLink,
} from 'lucide-react';

type FilterTab = 'tous' | 'brouillon' | 'envoyee' | 'payee' | 'en_retard';

export default function FacturesPage() {
  const router = useRouter();
  const { invoices, deleteInvoice } = useData();

  const [activeTab, setActiveTab] = useState<FilterTab>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Tab counters
  const counts = useMemo(() => {
    return {
      tous: invoices.length,
      brouillon: invoices.filter((inv) => inv.status === 'brouillon').length,
      envoyee: invoices.filter((inv) => inv.status === 'envoyee' && !isInvoiceLate(inv)).length,
      payee: invoices.filter((inv) => inv.status === 'payee').length,
      en_retard: invoices.filter((inv) => isInvoiceLate(inv) || inv.status === 'en_retard').length,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Tab filter
      const late = isInvoiceLate(inv) || inv.status === 'en_retard';
      if (activeTab === 'brouillon' && inv.status !== 'brouillon') return false;
      if (activeTab === 'payee' && inv.status !== 'payee') return false;
      if (activeTab === 'en_retard' && !late) return false;
      if (activeTab === 'envoyee' && (inv.status !== 'envoyee' || late)) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = inv.invoice_number?.toLowerCase().includes(query);
        const matchClient = inv.client_name?.toLowerCase().includes(query);
        const matchEmail = inv.client_email?.toLowerCase().includes(query);
        return matchNumber || matchClient || matchEmail;
      }

      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!invoiceToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Header
        title="Factures"
        subtitle="Consultez, filtrez et gérez l'ensemble de vos factures émises"
        actions={
          <Link href="/factures/nouvelle">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">Nouvelle facture</span>
              <span className="sm:hidden">Créer</span>
            </Button>
          </Link>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Control Bar: Search & Status Filters */}
        <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par client, email ou n° de facture..."
                className="w-full pl-9 pr-9 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Count Badge */}
            <div className="text-xs text-slate-500 self-end sm:self-auto font-medium">
              <span className="font-bold text-slate-900">{filteredInvoices.length}</span> facture
              {filteredInvoices.length > 1 ? 's' : ''} affichée
              {filteredInvoices.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Filter Pills Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs border-t border-slate-100 pt-3">
            <span className="text-slate-400 font-semibold mr-1.5 uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filtres :
            </span>

            {/* Tab: Tous */}
            <button
              type="button"
              onClick={() => setActiveTab('tous')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tous'
                  ? 'bg-slate-900 text-slate-50 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Toutes</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === 'tous' ? 'bg-surface/20 text-slate-50' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.tous}
              </span>
            </button>

            {/* Tab: Brouillon */}
            <button
              type="button"
              onClick={() => setActiveTab('brouillon')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'brouillon'
                  ? 'bg-slate-700 text-slate-50 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Brouillons</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === 'brouillon' ? 'bg-surface/20 text-slate-50' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.brouillon}
              </span>
            </button>

            {/* Tab: Envoyée */}
            <button
              type="button"
              onClick={() => setActiveTab('envoyee')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'envoyee'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100/70 border border-amber-200/60'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Envoyées</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === 'envoyee' ? 'bg-surface/20 text-white' : 'bg-amber-200/60 text-amber-800'
                }`}
              >
                {counts.envoyee}
              </span>
            </button>

            {/* Tab: Payée */}
            <button
              type="button"
              onClick={() => setActiveTab('payee')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'payee'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200/60'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Payées</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === 'payee' ? 'bg-surface/20 text-white' : 'bg-emerald-200/60 text-emerald-800'
                }`}
              >
                {counts.payee}
              </span>
            </button>

            {/* Tab: En retard */}
            <button
              type="button"
              onClick={() => setActiveTab('en_retard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'en_retard'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100/70 border border-rose-200/60'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>En retard</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === 'en_retard' ? 'bg-surface/20 text-white' : 'bg-rose-200/60 text-rose-800'
                }`}
              >
                {counts.en_retard}
              </span>
            </button>
          </div>
        </div>

        {/* Invoices Table Container */}
        <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-3.5 px-5 sm:px-6">N° Facture</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Date d'émission</th>
                  <th className="py-3.5 px-4">Échéance</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-5 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => {
                    const late = isInvoiceLate(inv);
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/factures/${inv.id}`)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      >
                        {/* N° Facture */}
                        <td className="py-3.5 px-5 sm:px-6 font-semibold text-slate-900 font-mono text-xs whitespace-nowrap">
                          <span className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {inv.invoice_number}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                              {inv.client_name?.slice(0, 2).toUpperCase() || 'CL'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800 text-xs sm:text-sm truncate max-w-[200px]">
                                {inv.client_name}
                              </div>
                              {inv.client_email && (
                                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
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
                              late ? 'text-rose-600 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {formatDateFR(inv.due_date)}
                          </span>
                        </td>

                        {/* Montant TTC */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                            {formatFCFA(inv.total)}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <Badge status={inv.status} isLate={late} />
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/factures/${inv.id}`}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/factures/${inv.id}/modifier`}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Modifier la facture"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setInvoiceToDelete(inv)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer la facture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Aucune facture trouvée
                        </h4>
                        <p className="text-xs text-slate-500">
                          {searchQuery
                            ? `Aucun résultat ne correspond à la recherche "${searchQuery}".`
                            : 'Aucune facture ne correspond à ce filtre.'}
                        </p>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Effacer la recherche
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Delete */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInvoiceToDelete(null)}
          />
          <div className="relative bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Supprimer la facture {invoiceToDelete.invoice_number} ?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement cette facture de{' '}
                <span className="font-semibold text-slate-800">
                  {invoiceToDelete.client_name}
                </span>{' '}
                d'un montant de{' '}
                <span className="font-semibold text-slate-800">
                  {formatFCFA(invoiceToDelete.total)}
                </span>{' '}
                ? Cette action est irréversible.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInvoiceToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={confirmDelete}
                loading={isDeleting}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
