'use client';

import React, { use, useLayoutEffect, useRef, useState } from 'react';
import { io } from 'next/cache';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { InvoicePaperPreview } from '@/components/invoices/InvoicePaperPreview';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { InvoiceCreatedModal } from '@/components/invoices/InvoiceCreatedModal';
import { useData } from '@/lib/context/DataContext';
import { InvoiceItem, Invoice } from '@/types';
import { formatFCFA } from '@/lib/utils/format';
import { getNextInvoiceNumber } from '@/lib/utils/invoice-number';
import { addDaysISO } from '@/lib/utils/format';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Sparkles,
  Percent,
  CheckCircle2,
  Printer,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

const NEW_CLIENT_OPTION = '__new_client__';

export default function NouvelleFacturePage() {
  // Dates et numéro auto dépendent de l'heure : on les calcule à chaque visite, pas au prerender
  use(io());

  const router = useRouter();
  const { clients, invoices, company, addInvoice } = useData();

  // Generate default dates
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Numéro séquentiel suggéré (recalculé quand les factures locales sont chargées),
  // remplacé par la saisie de l'utilisateur dès qu'il le modifie
  const suggestedInvoiceNumber = getNextInvoiceNumber(
    invoices,
    company.invoice_prefix,
    now.getFullYear()
  );
  const [customInvoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const invoiceNumber = customInvoiceNumber ?? suggestedInvoiceNumber;

  // Form State
  // Client choisi ; par défaut le premier de la liste (suit les clients une fois chargés)
  const [customClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClientId = customClientId ?? clients[0]?.id ?? '';
  const [issueDate, setIssueDate] = useState(today);
  // Échéance et notes : valeurs par défaut des Paramètres, tant que l'utilisateur ne les modifie pas
  const [customDueDate, setDueDate] = useState<string | null>(null);
  const dueDate = customDueDate ?? addDaysISO(issueDate, company.payment_terms_days);
  const [customNotes, setNotes] = useState<string | null>(null);
  const notes = customNotes ?? company.default_notes ?? '';
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [savingStatus, setSavingStatus] = useState<'brouillon' | 'envoyee' | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Line items state : une première ligne vide à remplir
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'it-1', description: '', quantity: 1, unit_price: 0, line_total: 0 },
  ]);

  // Mobile / Desktop preview toggle state (inspired by the screenshot "Show Preview")
  const [showPreviewMobile, setShowPreviewMobile] = useState(true);
  const [activeTabMobile, setActiveTabMobile] = useState<'form' | 'preview'>('form');

  /*
   * Next 16 (Cache Components) ne détruit plus la page quand on la quitte : il la cache et
   * conserve son état. Sans remise à zéro, revenir sur « Nouvelle facture » réaffichait la
   * facture précédente (et sa fenêtre « Facture créée avec succès »).
   * Après un enregistrement réussi, le formulaire est donc vidé dès que la page est quittée.
   * Un brouillon non enregistré, lui, est conservé.
   */
  const shouldResetRef = useRef(false);
  useLayoutEffect(() => {
    return () => {
      if (!shouldResetRef.current) return;
      shouldResetRef.current = false;
      setInvoiceNumber(null);
      setSelectedClientId(null);
      setIssueDate(new Date().toISOString().split('T')[0]);
      setDueDate(null);
      setNotes(null);
      setDiscountRate(0);
      setShowDiscount(false);
      setItems([{ id: 'it-1', description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
      setCreatedInvoice(null);
      setSaveError(null);
      setShowAddClientModal(false);
      setActiveTabMobile('form');
    };
  }, []);

  // Find currently selected client object
  const currentClient = clients.find((c) => c.id === selectedClientId);

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.line_total || 0), 0);
  const discountAmount = showDiscount && discountRate > 0 ? Math.round((subtotal * discountRate) / 100) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = company.tax_rate ?? 18;
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

  // Submit invoice
  const handleSaveInvoice = async (status: 'brouillon' | 'envoyee') => {
    if (savingStatus) return;
    setSaveError(null);

    if (!currentClient) {
      setSaveError('Veuillez sélectionner un client (ou en ajouter un).');
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setSaveError('Veuillez renseigner la description de toutes les prestations.');
      return;
    }

    if (!invoiceNumber.trim()) {
      setSaveError('Veuillez renseigner le numéro de facture.');
      return;
    }

    setSavingStatus(status);
    let newInv: Invoice;
    try {
      newInv = await addInvoice({
      invoice_number: invoiceNumber,
      client_id: currentClient.id,
      client_name: currentClient.name,
      client_email: currentClient.email,
      client_phone: currentClient.phone,
      status,
      issue_date: issueDate,
      due_date: dueDate,
      currency: company.currency,
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
    } catch (e) {
      setSaveError((e as Error).message);
      setSavingStatus(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSavingStatus(null);
    // Facture enregistrée : le formulaire repartira vide à la prochaine visite
    shouldResetRef.current = true;
    if (status === 'brouillon') {
      router.push(`/factures/${newInv.id}`);
      return;
    }
    // Facture enregistrée : confirmation avec retour aux factures ou téléchargement
    setCreatedInvoice(newInv);
  };

  // Live invoice object for preview
  const liveInvoice: Partial<Invoice> = {
    invoice_number: invoiceNumber,
    client_name: currentClient?.name || 'Nom du client',
    client_email: currentClient?.email || 'email@client.com',
    client_phone: currentClient?.phone || '+225 00 00 00 00',
    status: 'brouillon',
    issue_date: issueDate,
    due_date: dueDate,
    currency: company.currency,
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
      {/* Header avec boutons d'actions comme sur la capture d'écran */}
      <Header
        title="Créer une facture"
        subtitle="Renseignez les détails à gauche, la facture s'actualise en temps réel à droite"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/factures" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-slate-500">
                Annuler
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => handleSaveInvoice('brouillon')}
              loading={savingStatus === 'brouillon'}
              disabled={savingStatus !== null}
            >
              Brouillon
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              onClick={() => handleSaveInvoice('envoyee')}
              loading={savingStatus === 'envoyee'}
              disabled={savingStatus !== null}
            >
              Enregistrer
            </Button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {saveError && (
          <div
            role="alert"
            className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200/80 text-sm text-rose-700 font-medium"
          >
            {saveError}
          </div>
        )}

        {/* Navigation Breadcrumb & Mobile Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/factures" className="hover:text-slate-600 transition-colors">
              Factures
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Nouvelle facture</span>
          </div>

          {/* Mobile switcher: Formulaire vs Aperçu en direct */}
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

        {/* 2-Columns Split Layout: Left = Form, Right = Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeTabMobile === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Card 1: Invoice Information */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Informations de facturation
                </h3>
                <span className="text-xs text-slate-400 font-medium">Étape 1 sur 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Selection (Dropdown) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Client facturé <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      if (e.target.value === NEW_CLIENT_OPTION) {
                        // La sélection actuelle est conservée tant que le nouveau client n'est pas créé
                        setShowAddClientModal(true);
                        return;
                      }
                      setSelectedClientId(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {!currentClient && (
                      <option value="" disabled>
                        Sélectionnez un client
                      </option>
                    )}
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone ? `(${client.phone})` : ''}
                      </option>
                    ))}
                    <option value={NEW_CLIENT_OPTION} className="font-semibold text-blue-600">
                      + Ajouter nouveau client
                    </option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sélectionnez un client existant ou ajoutez-en un nouveau.
                  </p>
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Ex: FACT-20260007"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format recommandé : FACT-AAAANNNN
                  </p>
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date d'émission <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date d'échéance <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Line Items / Prestations */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Lignes de prestations & articles
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ajoutez vos prestations, quantités et tarifs unitaires en FCFA.
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {items.length} ligne{items.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3 group"
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
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description de la prestation ou du produit..."
                        className="w-full px-3.5 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Quantity, Unit Price, Line Total */}
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
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className="w-full px-3 py-1.5 bg-surface border border-slate-200 rounded-lg text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-right pr-3"
                          />
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-4 flex sm:flex-col justify-between sm:justify-center sm:items-end pt-1 sm:pt-0">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Total ligne :
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                          {formatFCFA(item.line_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item button */}
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>Ajouter une ligne de prestation</span>
              </button>
            </div>

            {/* Card 3: Notes & Discounts */}
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
                    Appliquer une remise commerciale
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
                  Conditions et mentions de règlement
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mentions particulières (ex: virement à 30 jours, Wave au +225...)"
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Financial Summary Card (Left Bottom) */}
            <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 sm:p-6">
              <div className="space-y-2.5 text-xs">
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
                  <span>TVA légale (18%)</span>
                  <span className="font-semibold text-slate-900 font-mono text-sm">
                    {formatFCFA(taxAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-900 pt-3">
                  <div>
                    <span>Total TTC net à payer</span>
                    <span className="block text-[11px] text-slate-400 font-normal">
                      Arrondi à l'entier en FCFA
                    </span>
                  </div>
                  <span className="text-blue-600 font-mono font-black text-xl">
                    {formatFCFA(total)}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Action buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => handleSaveInvoice('brouillon')}
              loading={savingStatus === 'brouillon'}
              disabled={savingStatus !== null}
                >
                  Brouillon
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Save className="w-4 h-4" />}
                  onClick={() => handleSaveInvoice('envoyee')}
              loading={savingStatus === 'envoyee'}
              disabled={savingStatus !== null}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE REAL-TIME PREVIEW ================= */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 space-y-4 ${
              activeTabMobile === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Top Toolbar of the Preview Column */}
            <div className="flex items-center justify-between bg-surface rounded-xl border border-slate-200/80 p-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  Aperçu en direct
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  Temps réel
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Imprimer ou enregistrer en PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>

            {/* The Realistic Paper Card Component */}
            <div className="transition-all duration-200">
              <InvoicePaperPreview
                invoice={liveInvoice}
                company={company}
                isDraftWatermark={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Facture créée avec succès */}
      {createdInvoice && (
        <InvoiceCreatedModal
          invoice={createdInvoice}
          company={company}
          onBackToInvoices={() => router.push('/factures')}
          onClose={() => router.push(`/factures/${createdInvoice.id}`)}
        />
      )}

      {/* Modal: Ajouter un nouveau client depuis le menu déroulant */}
      {showAddClientModal && (
        <AddClientModal
          onClose={() => setShowAddClientModal(false)}
          onCreated={(client) => setSelectedClientId(client.id)}
        />
      )}
    </>
  );
}
