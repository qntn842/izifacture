'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { InvoicePaperPreview } from '@/components/invoices/InvoicePaperPreview';
import { useData } from '@/lib/context/DataContext';
import { InvoiceItem, Invoice } from '@/types';
import { formatFCFA } from '@/lib/utils/format';
import {
  Plus,
  Trash2,
  Save,
  Send,
  Eye,
  ArrowLeft,
  FileText,
  Sparkles,
  ChevronRight,
  Printer,
  AlertCircle,
} from 'lucide-react';

export default function ModifierFacturePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params.id);

  const { getInvoice, updateInvoice, clients, company } = useData();
  const existingInvoice = getInvoice(invoiceId);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [activeTabMobile, setActiveTabMobile] = useState<'form' | 'preview'>('form');

  // Pre-fill form from existing invoice
  useEffect(() => {
    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.invoice_number);
      setSelectedClientId(existingInvoice.client_id || clients[0]?.id || '');
      setIssueDate(existingInvoice.issue_date);
      setDueDate(existingInvoice.due_date);
      setNotes(existingInvoice.notes || '');
      setDiscountRate(existingInvoice.discount_rate || 0);
      setShowDiscount((existingInvoice.discount_rate || 0) > 0);
      setItems(existingInvoice.items || []);
    }
  }, [existingInvoice, clients]);

  if (!existingInvoice) {
    return (
      <>
        <Header title="Facture introuvable" />
        <main className="p-6 max-w-4xl mx-auto text-center space-y-4">
          <div className="bg-surface rounded-2xl border border-slate-200/80 p-12 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Facture introuvable</h2>
            <Link href="/factures">
              <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Retour aux factures
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const currentClient = clients.find((c) => c.id === selectedClientId) || {
    id: existingInvoice.client_id,
    name: existingInvoice.client_name,
    email: existingInvoice.client_email,
    phone: existingInvoice.client_phone,
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.line_total || 0), 0);
  const discountAmount = showDiscount && discountRate > 0 ? Math.round((subtotal * discountRate) / 100) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = existingInvoice.tax_rate ?? company.tax_rate ?? 18;
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const total = taxableAmount + taxAmount;

  // Handlers for items
  const handleItemChange = (
    index: number,
    field: 'description' | 'quantity' | 'unit_price',
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'description') {
        target.description = String(value);
      } else if (field === 'quantity') {
        const qty = Math.max(1, Number(value) || 1);
        target.quantity = qty;
        target.line_total = qty * target.unit_price;
      } else if (field === 'unit_price') {
        const price = Math.max(0, Number(value) || 0);
        target.unit_price = price;
        target.line_total = target.quantity * price;
      }

      updated[index] = target;
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `it-${Date.now()}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      line_total: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!currentClient) {
      alert('Veuillez sélectionner un client.');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      alert('Veuillez renseigner la description de toutes les prestations.');
      return;
    }

    setIsSaving(true);
    try {
      await updateInvoice(existingInvoice.id, {
      invoice_number: invoiceNumber,
      client_id: currentClient.id,
      client_name: currentClient.name,
      client_email: currentClient.email,
      client_phone: currentClient.phone,
      issue_date: issueDate,
      due_date: dueDate,
      tax_rate: taxRate,
      discount_rate: showDiscount ? discountRate : 0,
      subtotal,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      tax_amount: taxAmount,
      total,
      notes,
      items,
      });
      router.push(`/factures/${existingInvoice.id}`);
    } catch (err) {
      alert((err as Error).message);
      setIsSaving(false);
    }
  };

  const liveInvoice: Partial<Invoice> = {
    ...existingInvoice,
    invoice_number: invoiceNumber,
    client_name: currentClient?.name,
    client_email: currentClient?.email,
    client_phone: currentClient?.phone,
    issue_date: issueDate,
    due_date: dueDate,
    tax_rate: taxRate,
    discount_rate: showDiscount ? discountRate : 0,
    subtotal,
    discount_amount: discountAmount,
    taxable_amount: taxableAmount,
    tax_amount: taxAmount,
    total,
    notes,
    items,
  };

  return (
    <>
      <Header
        title={`Modifier ${existingInvoice.invoice_number}`}
        subtitle="Mettez à jour les lignes et informations, l'aperçu se met à jour en direct"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/factures/${existingInvoice.id}`}>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-500">
                Annuler
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
                  loading={isSaving}
            >
              Enregistrer les modifications
            </Button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Navigation Breadcrumb & Mobile Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/factures" className="hover:text-slate-600 transition-colors">
              Factures
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/factures/${existingInvoice.id}`} className="hover:text-slate-600 transition-colors">
              {existingInvoice.invoice_number}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Modifier</span>
          </div>

          <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTabMobile('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabMobile === 'form'
                  ? 'bg-surface text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Formulaire
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMobile('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTabMobile === 'preview'
                  ? 'bg-surface text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Aperçu en direct</span>
            </button>
          </div>
        </div>

        {/* 2-Columns Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeTabMobile === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Invoice Info */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Informations de facturation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Client facturé <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone ? `(${client.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date d'émission <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date d'échéance <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Prestations & Articles
                </h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {items.length} ligne{items.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3.5">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Ligne #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Description de la prestation..."
                      className="w-full px-3.5 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />

                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4 sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-slate-200 rounded-lg text-sm font-mono text-center font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div className="col-span-8 sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Prix unitaire (FCFA)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-slate-200 rounded-lg text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-right pr-3"
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-4 flex sm:flex-col justify-between sm:justify-center sm:items-end pt-1 sm:pt-0">
                        <span className="text-[11px] font-semibold text-slate-400">Total :</span>
                        <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                          {formatFCFA(item.line_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Ajouter une ligne de prestation</span>
              </button>
            </div>

            {/* Notes & Discounts */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDiscount}
                    onChange={(e) => setShowDiscount(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Remise commerciale
                  </span>
                </label>

                {showDiscount && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={discountRate}
                      onChange={(e) => setDiscountRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-16 px-2 py-1 bg-surface border border-slate-200 rounded-lg text-xs font-mono text-center font-bold text-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mentions & conditions de règlement
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Bottom summary & Save */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Sous-total HT</span>
                  <span className="font-semibold text-slate-900 font-mono text-sm">
                    {formatFCFA(subtotal)}
                  </span>
                </div>
                {showDiscount && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Remise ({discountRate}%)</span>
                    <span className="font-semibold font-mono text-sm">
                      - {formatFCFA(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-100 pt-2">
                  <span>TVA (18%)</span>
                  <span className="font-semibold text-slate-900 font-mono text-sm">
                    {formatFCFA(taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-900 pt-3">
                  <span>Nouveau total TTC</span>
                  <span className="text-blue-600 font-mono font-black text-xl">
                    {formatFCFA(total)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                <Link href={`/factures/${existingInvoice.id}`}>
                  <Button variant="secondary" size="md">
                    Annuler
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  loading={isSaving}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 space-y-4 ${
              activeTabMobile === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between bg-surface rounded-xl border border-slate-200/80 p-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  Aperçu mis à jour
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  Temps réel
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>

            <InvoicePaperPreview
              invoice={liveInvoice}
              company={company}
              isDraftWatermark={existingInvoice.status === 'brouillon'}
            />
          </div>
        </div>
      </main>
    </>
  );
}
