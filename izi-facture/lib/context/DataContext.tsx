'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import type { PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/types/database';
import {
  AppUser,
  Client,
  CompanySettings,
  DashboardStats,
  Invoice,
  InvoiceStatus,
} from '@/types';

/**
 * Point central des données de l'application, enregistrées dans Supabase.
 * Toutes les actions sont asynchrones et lèvent une Error avec un message en français
 * (à afficher à l'utilisateur) si l'opération échoue.
 * La sécurité est assurée côté base (RLS) : chaque utilisateur ne voit que son entreprise.
 */

type NewInvoice = Omit<Invoice, 'id' | 'is_late'>;
type NewClient = Omit<Client, 'id' | 'created_at' | 'invoices_count' | 'total_billed'>;

interface DataContextType {
  user: AppUser;
  invoices: Invoice[];
  clients: Client[];
  company: CompanySettings;
  stats: DashboardStats;
  addInvoice: (invoice: NewInvoice) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  getInvoice: (id: string) => Invoice | undefined;
  addClient: (client: NewClient) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  updateCompany: (data: Partial<CompanySettings>) => Promise<void>;
  signOut: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

/* ---------- Conversion base de données <-> application ---------- */

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];
type InvoiceViewRow = Database['public']['Views']['invoices_with_status']['Row'];
type InvoiceItemRow = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceWithItemsRow = InvoiceViewRow & { invoice_items: InvoiceItemRow[] };

const INVOICE_SELECT = '*, invoice_items(*)';

const orUndefined = <T,>(value: T | null): T | undefined => value ?? undefined;

function toCompany(row: CompanyRow): CompanySettings {
  return {
    company_name: row.company_name,
    registration_number: orUndefined(row.registration_number),
    address_line1: row.address_line1,
    city: row.city,
    country: row.country,
    phone: orUndefined(row.phone),
    email: orUndefined(row.email),
    currency: row.currency,
    tax_rate: Number(row.tax_rate),
    invoice_prefix: row.invoice_prefix,
    payment_terms_days: row.payment_terms_days,
    default_notes: orUndefined(row.default_notes),
  };
}

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: orUndefined(row.email),
    phone: orUndefined(row.phone),
    address: orUndefined(row.address),
    created_at: row.created_at.split('T')[0],
  };
}

function toInvoice(row: InvoiceWithItemsRow): Invoice {
  return {
    id: row.id!,
    invoice_number: row.invoice_number ?? '',
    client_id: orUndefined(row.client_id),
    client_name: row.client_name ?? '',
    client_email: orUndefined(row.client_email),
    client_phone: orUndefined(row.client_phone),
    status: row.status ?? 'brouillon',
    issue_date: row.issue_date ?? '',
    due_date: row.due_date ?? '',
    currency: row.currency ?? 'XOF',
    tax_rate: Number(row.tax_rate ?? 0),
    discount_rate: Number(row.discount_rate ?? 0),
    subtotal: row.subtotal ?? 0,
    discount_amount: row.discount_amount ?? 0,
    taxable_amount: row.taxable_amount ?? 0,
    tax_amount: row.tax_amount ?? 0,
    total: row.total ?? 0,
    notes: orUndefined(row.notes),
    is_late: row.is_late ?? false,
    items: [...(row.invoice_items ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      })),
  };
}

/** Données d'une facture au format attendu par la fonction SQL save_invoice */
function toInvoicePayload(invoice: NewInvoice, companyId: string) {
  const { items, ...fields } = invoice;
  const payload = {
    company_id: companyId,
    client_id: fields.client_id ?? null,
    invoice_number: fields.invoice_number.trim(),
    client_name: fields.client_name,
    client_email: fields.client_email ?? null,
    client_phone: fields.client_phone ?? null,
    status: fields.status,
    issue_date: fields.issue_date,
    due_date: fields.due_date,
    currency: fields.currency,
    tax_rate: fields.tax_rate,
    discount_rate: fields.discount_rate,
    subtotal: Math.round(fields.subtotal),
    discount_amount: Math.round(fields.discount_amount),
    taxable_amount: Math.round(fields.taxable_amount),
    tax_amount: Math.round(fields.tax_amount),
    total: Math.round(fields.total),
    notes: fields.notes ?? null,
  };
  const itemsPayload = items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price: Math.round(item.unit_price),
    line_total: Math.round(item.line_total),
  }));
  return { p_invoice: payload as unknown as Json, p_items: itemsPayload as unknown as Json };
}

/** Transforme une erreur Supabase en message compréhensible pour l'utilisateur */
function toFriendlyError(error: PostgrestError | Error | null, fallback: string): Error {
  const err = error as (PostgrestError & Error) | null;
  if (err?.code === '23505') {
    return new Error('Ce numéro de facture existe déjà. Choisissez-en un autre.');
  }
  if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
    return new Error('Impossible de joindre le serveur. Vérifiez votre connexion internet.');
  }
  return new Error(fallback);
}

/* ---------- Chargement initial ---------- */

interface InitialData {
  user: AppUser;
  companyId: string;
  company: CompanySettings;
  clients: Client[];
  invoices: Invoice[];
}

async function loadInitialData(): Promise<InitialData> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    // Session expirée : retour à la page de connexion
    window.location.assign('/connexion');
    throw new Error('Session expirée');
  }
  const authUser = authData.user;

  const { data: membership, error: memberError } = await supabase
    .from('company_members')
    .select('company_id')
    .limit(1)
    .single();
  if (memberError || !membership) throw toFriendlyError(memberError, 'Entreprise introuvable.');

  const [companyRes, clientsRes, invoicesRes] = await Promise.all([
    supabase.from('companies').select('*').eq('id', membership.company_id).single(),
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase
      .from('invoices_with_status')
      .select(INVOICE_SELECT)
      .order('created_at', { ascending: false }),
  ]);

  if (companyRes.error) throw toFriendlyError(companyRes.error, "Impossible de charger l'entreprise.");
  if (clientsRes.error) throw toFriendlyError(clientsRes.error, 'Impossible de charger les clients.');
  if (invoicesRes.error) throw toFriendlyError(invoicesRes.error, 'Impossible de charger les factures.');

  const metadata = authUser.user_metadata as { full_name?: string } | undefined;

  return {
    user: { id: authUser.id, email: authUser.email ?? '', fullName: metadata?.full_name || undefined },
    companyId: membership.company_id,
    company: toCompany(companyRes.data),
    clients: clientsRes.data.map(toClient),
    invoices: (invoicesRes.data as InvoiceWithItemsRow[]).map(toInvoice),
  };
}

/* ---------- Provider ---------- */

const EMPTY_COMPANY: CompanySettings = {
  company_name: '',
  address_line1: '',
  city: '',
  country: '',
  currency: 'XOF',
  tax_rate: 18,
  invoice_prefix: 'FACT',
  payment_terms_days: 30,
};

/**
 * Les pages sont toujours rendues (exigence de Next 16 : aucun segment "abandonné").
 * Tant que les données ne sont pas chargées, un écran de chargement les recouvre.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [user, setUser] = useState<AppUser>({ id: '', email: '' });
  const [companyId, setCompanyId] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [company, setCompany] = useState<CompanySettings>(EMPTY_COMPANY);

  useEffect(() => {
    let cancelled = false;
    loadInitialData()
      .then((result) => {
        if (cancelled) return;
        setUser(result.user);
        setCompanyId(result.companyId);
        setCompany(result.company);
        setClients(result.clients);
        setInvoices(result.invoices);
        setIsReady(true);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || 'Impossible de charger vos données.');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  }, []);

  // Statistiques du tableau de bord
  const nonCancelled = invoices.filter((inv) => inv.status !== 'annulee');
  const totalBilled = nonCancelled.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = nonCancelled
    .filter((inv) => inv.status === 'payee')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  const overdueInvoices = nonCancelled.filter(
    (inv) => inv.status === 'en_retard' || (inv.status === 'envoyee' && Boolean(inv.is_late))
  );
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pendingInvoices = nonCancelled.filter(
    (inv) => inv.status === 'envoyee' && !overdueInvoices.some((o) => o.id === inv.id)
  );
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const stats: DashboardStats = {
    totalBilled,
    totalPaid,
    totalPending,
    totalOverdue,
    invoicesCount: nonCancelled.length,
    overdueCount: overdueInvoices.length,
  };

  /** Relit une facture (avec ses lignes et son retard calculé) depuis la base */
  const fetchInvoice = async (id: string): Promise<Invoice> => {
    const { data, error } = await supabase
      .from('invoices_with_status')
      .select(INVOICE_SELECT)
      .eq('id', id)
      .single();
    if (error || !data) throw toFriendlyError(error, 'Impossible de relire la facture.');
    return toInvoice(data as InvoiceWithItemsRow);
  };

  /* ----- Factures ----- */

  const addInvoice = async (invoiceData: NewInvoice): Promise<Invoice> => {
    const { data: newId, error } = await supabase.rpc(
      'save_invoice',
      toInvoicePayload(invoiceData, companyId)
    );
    if (error || !newId) throw toFriendlyError(error, "La facture n'a pas pu être enregistrée.");
    const saved = await fetchInvoice(newId);
    setInvoices((prev) => [saved, ...prev]);
    return saved;
  };

  const updateInvoice = async (id: string, updatedData: Partial<Invoice>): Promise<Invoice> => {
    const existing = invoices.find((inv) => inv.id === id);
    if (!existing) throw new Error('Facture introuvable.');
    const merged = { ...existing, ...updatedData };
    const { error } = await supabase.rpc('save_invoice', {
      ...toInvoicePayload(merged, companyId),
      p_invoice_id: id,
    });
    if (error) throw toFriendlyError(error, "Les modifications n'ont pas pu être enregistrées.");
    const saved = await fetchInvoice(id);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? saved : inv)));
    return saved;
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw toFriendlyError(error, "La facture n'a pas pu être supprimée.");
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (error) throw toFriendlyError(error, "Le statut n'a pas pu être modifié.");
    const saved = await fetchInvoice(id);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? saved : inv)));
  };

  const getInvoice = (id: string) => invoices.find((inv) => inv.id === id);

  /* ----- Clients ----- */

  const addClient = async (clientData: NewClient): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        company_id: companyId,
        name: clientData.name,
        email: clientData.email ?? null,
        phone: clientData.phone ?? null,
        address: clientData.address ?? null,
      })
      .select()
      .single();
    if (error || !data) throw toFriendlyError(error, "Le client n'a pas pu être enregistré.");
    const newClient = toClient(data);
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: clientData.name,
        email: clientData.email ?? null,
        phone: clientData.phone ?? null,
        address: clientData.address ?? null,
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw toFriendlyError(error, "Le client n'a pas pu être modifié.");
    // Les factures déjà émises gardent les coordonnées du client au moment de leur création
    setClients((prev) => prev.map((c) => (c.id === id ? toClient(data) : c)));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw toFriendlyError(error, "Le client n'a pas pu être supprimé.");
    setClients((prev) => prev.filter((c) => c.id !== id));
    // Ses factures restent, détachées du client (client_id vidé par la base)
    setInvoices((prev) =>
      prev.map((inv) => (inv.client_id === id ? { ...inv, client_id: undefined } : inv))
    );
  };

  const getClient = (id: string) => clients.find((c) => c.id === id);

  /* ----- Entreprise ----- */

  const updateCompany = async (updates: Partial<CompanySettings>) => {
    const next = { ...company, ...updates };
    const { data, error } = await supabase
      .from('companies')
      .update({
        company_name: next.company_name,
        registration_number: next.registration_number || null,
        address_line1: next.address_line1,
        city: next.city,
        country: next.country,
        phone: next.phone || null,
        email: next.email || null,
        currency: next.currency,
        tax_rate: next.tax_rate,
        invoice_prefix: next.invoice_prefix,
        payment_terms_days: next.payment_terms_days,
        default_notes: next.default_notes || null,
      })
      .eq('id', companyId)
      .select()
      .single();
    if (error || !data) throw toFriendlyError(error, "Les paramètres n'ont pas pu être enregistrés.");
    setCompany(toCompany(data));
  };

  /* ----- Compte ----- */

  const signOut = async () => {
    await supabase.auth.signOut();
    // Rechargement complet : vide toutes les données en mémoire
    window.location.assign('/connexion');
  };

  return (
    <DataContext.Provider
      value={{
        user,
        invoices,
        clients,
        company,
        stats,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateInvoiceStatus,
        getInvoice,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        updateCompany,
        signOut,
      }}
    >
      {children}

      {/* Écran de chargement / d'erreur au-dessus de la page tant que les données ne sont pas prêtes */}
      {!isReady && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-page p-6">
          <div className="text-center">
            {loadError ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <WifiOff className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-4">Chargement impossible</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{loadError}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-brand-hover active:bg-brand-active text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              </>
            ) : (
              <>
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-slate-500 mt-3">Chargement de vos données…</p>
              </>
            )}
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
