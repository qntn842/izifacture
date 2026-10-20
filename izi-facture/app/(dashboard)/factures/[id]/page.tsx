'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InvoicePaperPreview } from '@/components/invoices/InvoicePaperPreview';
import { DownloadInvoiceButton } from '@/components/invoices/DownloadInvoiceButton';
import { useData } from '@/lib/context/DataContext';
import { InvoiceStatus } from '@/types';
import { formatFCFA, formatDateFR } from '@/lib/utils/format';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  Share2,
  Calendar,
  CreditCard,
  Building2,
} from 'lucide-react';

export default function DetailFacturePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params.id);

  const { getInvoice, updateInvoiceStatus, deleteInvoice, company } = useData();
  const invoice = getInvoice(invoiceId);

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!invoice) {
    return (
      <>
        <Header title="Facture introuvable" />
        <main className="p-6 max-w-4xl mx-auto text-center space-y-4">
          <div className="bg-surface rounded-2xl border border-slate-200/80 p-12 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Facture non trouvée</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              La facture demandée n'existe pas ou a été supprimée.
            </p>
            <Link href="/factures">
              <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Retour à la liste des factures
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const handleStatusChange = async (status: InvoiceStatus) => {
    setShowStatusMenu(false);
    try {
      await updateInvoiceStatus(invoice.id, status);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(invoice.id);
      router.push('/factures');
    } catch (err) {
      alert((err as Error).message);
      setIsDeleting(false);
    }
  };

  const statuses: { label: string; value: InvoiceStatus; dotColor: string }[] = [
    { label: 'Brouillon', value: 'brouillon', dotColor: 'bg-slate-400' },
    { label: 'Envoyée (En attente)', value: 'envoyee', dotColor: 'bg-amber-500' },
    { label: 'Payée', value: 'payee', dotColor: 'bg-emerald-500' },
    { label: 'En retard', value: 'en_retard', dotColor: 'bg-rose-500' },
    { label: 'Annulée', value: 'annulee', dotColor: 'bg-zinc-400' },
  ];

  return (
    <>
      <Header
        title={`Facture ${invoice.invoice_number}`}
        subtitle={`Émise pour ${invoice.client_name}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/factures">
              <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                <span className="hidden sm:inline">Toutes les factures</span>
              </Button>
            </Link>

            {/* Delete button */}
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setShowDeleteModal(true)}
            >
              <span className="hidden sm:inline">Supprimer</span>
            </Button>

            {/* Edit button */}
            <Link href={`/factures/${invoice.id}/modifier`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Edit className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline">Modifier</span>
              </Button>
            </Link>

            {/* Download PDF button */}
            <DownloadInvoiceButton
              invoice={invoice}
              company={company}
              variant="primary"
              size="sm"
              label="Télécharger la facture"
              compactLabel="PDF"
            />
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Top Control Strip */}
        <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 font-mono">
                  {invoice.invoice_number}
                </span>
                <Badge status={invoice.status} isLate={invoice.is_late} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total : <span className="font-bold text-slate-800">{formatFCFA(invoice.total)}</span> • Émise le {formatDateFR(invoice.issue_date)}
              </p>
            </div>
          </div>

          {/* Change Status Dropdown Button */}
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-2 transition-all cursor-pointer border border-slate-200/60"
            >
              <span>Changer le statut</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-surface rounded-xl border border-slate-200 shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Définir le statut :
                  </div>
                  {statuses.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => handleStatusChange(st.value)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        invoice.status === st.value
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                        <span>{st.label}</span>
                      </div>
                      {invoice.status === st.value && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Invoice Paper Document Display */}
        <div className="max-w-4xl mx-auto">
          <InvoicePaperPreview
            invoice={invoice}
            company={company}
            isDraftWatermark={invoice.status === 'brouillon'}
          />
        </div>
      </main>

      {/* Confirmation Modal for Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Supprimer définitivement la facture ?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Êtes-vous certain de vouloir supprimer la facture{' '}
                <span className="font-semibold text-slate-800">
                  {invoice.invoice_number}
                </span>{' '}
                destinée à{' '}
                <span className="font-semibold text-slate-800">
                  {invoice.client_name}
                </span>{' '}
                ? Cette suppression est irréversible.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDelete}
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
