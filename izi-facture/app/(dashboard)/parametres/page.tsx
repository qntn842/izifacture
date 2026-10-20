'use client';

import React, { use, useState } from 'react';
import { io } from 'next/cache';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useData } from '@/lib/context/DataContext';
import { CompanySettings, Currency } from '@/types';
import { formatFCFA, formatDateFR, getInitials } from '@/lib/utils/format';
import { getNextInvoiceNumber } from '@/lib/utils/invoice-number';
import {
  Building2,
  Globe,
  FileText,
  Users,
  Save,
  CheckCircle2,
  Mail,
  Coins,
  Hash,
  ScrollText,
  UserPlus,
  ShieldCheck,
  Undo2,
  type LucideIcon,
} from 'lucide-react';

type TabId = 'profil' | 'regional' | 'modeles' | 'equipe';

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'profil', label: "Profil de l'entreprise", icon: Building2 },
  { id: 'regional', label: 'Régional & Devise', icon: Globe },
  { id: 'modeles', label: 'Modèles de facturation', icon: FileText },
  { id: 'equipe', label: 'Équipe & Accès', icon: Users },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'XOF', label: 'FCFA — XOF (UEMOA : Côte d’Ivoire, Sénégal, Bénin, Togo…)' },
  { value: 'XAF', label: 'FCFA — XAF (CEMAC : Cameroun, Gabon, Congo…)' },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: 0, label: 'À réception' },
  { value: 15, label: '15 jours' },
  { value: 30, label: '30 jours' },
  { value: 45, label: '45 jours' },
  { value: 60, label: '60 jours' },
];

const inputClassName =
  'w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

/* ---------- Petits composants de mise en page ---------- */

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600" />
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function ReadOnlyTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-sm font-bold text-slate-900 font-mono mt-1">{value}</div>
      <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
    </div>
  );
}

/* ---------- Page ---------- */

export default function ParametresPage() {
  // L'aperçu du prochain numéro dépend de l'année en cours : calculé à chaque visite
  use(io());

  const { company, invoices, updateCompany, user } = useData();

  const [activeTab, setActiveTab] = useState<TabId>('profil');
  // Brouillon des modifications ; null = aucune modification en cours (on affiche les valeurs enregistrées)
  const [draft, setDraft] = useState<CompanySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const form = draft ?? company;
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(company);

  const setField = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setDraft({ ...form, [key]: value });
    setError(null);
  };

  const handleCancel = () => {
    setDraft(null);
    setError(null);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (!form.company_name.trim()) {
      setActiveTab('profil');
      setError("Le nom légal de l'entreprise est obligatoire.");
      return;
    }
    if (!form.invoice_prefix.trim()) {
      setActiveTab('modeles');
      setError('Le préfixe des factures est obligatoire.');
      return;
    }

    setIsSaving(true);
    try {
      await updateCompany({
        ...form,
        company_name: form.company_name.trim(),
        invoice_prefix: form.invoice_prefix.trim(),
      });
    } catch (err) {
      setError((err as Error).message);
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    setDraft(null);
    setError(null);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const currentYear = new Date().getFullYear();
  const nextInvoiceNumber = getNextInvoiceNumber(
    invoices,
    form.invoice_prefix || 'FACT',
    currentYear
  );

  return (
    <>
      <Header
        title="Paramètres"
        subtitle="Gérez les configurations générales de votre espace de travail"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!isDirty}
          >
            <span className="hidden sm:inline">Enregistrer les modifications</span>
            <span className="sm:hidden">Enregistrer</span>
          </Button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Onglets : liste verticale sur PC, défilement horizontal sur téléphone */}
          <nav
            aria-label="Sections des paramètres"
            className="w-full lg:w-60 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0 lg:sticky lg:top-24"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all duration-150 cursor-pointer group shrink-0 lg:w-full text-left ${
                    isActive
                      ? 'bg-surface text-slate-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Contenu de l'onglet actif */}
          <div className="flex-1 min-w-0 w-full max-w-3xl space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200/80 text-sm text-rose-700 font-medium">
                {error}
              </div>
            )}

            {activeTab === 'profil' && (
              <>
                <SettingsSection
                  title="Identité de l'entreprise"
                  description="Les informations officielles de votre société, affichées sur vos factures."
                  icon={Building2}
                >
                  <Field label="Nom légal" required>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => setField('company_name', e.target.value)}
                      placeholder="Ex: Studio Créatif Horizon SARL"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="RC ou NINEA" hint="Registre du commerce (RCCM) ou NINEA">
                    <input
                      type="text"
                      value={form.registration_number ?? ''}
                      onChange={(e) => setField('registration_number', e.target.value)}
                      placeholder="Ex: CI-ABJ-2024-B-12345"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Adresse du siège social" className="sm:col-span-2">
                    <input
                      type="text"
                      value={form.address_line1}
                      onChange={(e) => setField('address_line1', e.target.value)}
                      placeholder="Ex: Avenue Jean Jaurès, Plateau"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Ville">
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setField('city', e.target.value)}
                      placeholder="Ex: Abidjan"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Pays">
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setField('country', e.target.value)}
                      placeholder="Ex: Côte d'Ivoire"
                      className={inputClassName}
                    />
                  </Field>
                </SettingsSection>

                <SettingsSection
                  title="Coordonnées de contact"
                  description="Visibles publiquement sur vos documents."
                  icon={Mail}
                >
                  <Field label="Email de facturation">
                    <input
                      type="email"
                      value={form.email ?? ''}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="Ex: facturation@monentreprise.ci"
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Téléphone pro">
                    <input
                      type="tel"
                      value={form.phone ?? ''}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="Ex: +225 07 00 11 22 33"
                      className={inputClassName}
                    />
                  </Field>
                </SettingsSection>
              </>
            )}

            {activeTab === 'regional' && (
              <>
                <SettingsSection
                  title="Devise & fiscalité"
                  description="Appliquées par défaut à chaque nouvelle facture."
                  icon={Coins}
                >
                  <Field label="Devise" className="sm:col-span-2">
                    <select
                      value={form.currency}
                      onChange={(e) => setField('currency', e.target.value as Currency)}
                      className={`${inputClassName} cursor-pointer`}
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Taux de TVA par défaut (%)" hint="18 % en Côte d'Ivoire, au Sénégal et au Bénin">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={form.tax_rate}
                      onChange={(e) =>
                        setField('tax_rate', Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                      }
                      className={`${inputClassName} font-mono`}
                    />
                  </Field>
                </SettingsSection>

                <SettingsSection
                  title="Formats d'affichage"
                  description="Formats régionaux utilisés dans toute l'application."
                  icon={Globe}
                >
                  <ReadOnlyTile
                    label="Montants"
                    value={formatFCFA(1250000)}
                    hint="Sans décimales, espace comme séparateur"
                  />
                  <ReadOnlyTile
                    label="Dates"
                    value={formatDateFR('2026-01-15')}
                    hint="Format JJ/MM/AAAA"
                  />
                </SettingsSection>
              </>
            )}

            {activeTab === 'modeles' && (
              <>
                <SettingsSection
                  title="Numérotation des factures"
                  description="Les numéros se suivent automatiquement, sans doublon."
                  icon={Hash}
                >
                  <Field label="Préfixe" required hint="Lettres et chiffres uniquement, 10 caractères max.">
                    <input
                      type="text"
                      value={form.invoice_prefix}
                      onChange={(e) =>
                        setField(
                          'invoice_prefix',
                          e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
                        )
                      }
                      placeholder="Ex: FACT"
                      className={`${inputClassName} font-mono font-semibold`}
                    />
                  </Field>
                  <ReadOnlyTile
                    label="Prochain numéro"
                    value={nextInvoiceNumber}
                    hint="Attribué à votre prochaine facture"
                  />
                </SettingsSection>

                <SettingsSection
                  title="Conditions par défaut"
                  description="Pré-remplies sur chaque nouvelle facture, modifiables au cas par cas."
                  icon={ScrollText}
                >
                  <Field label="Délai de paiement" hint="Sert à calculer la date d'échéance">
                    <select
                      value={form.payment_terms_days}
                      onChange={(e) => setField('payment_terms_days', Number(e.target.value))}
                      className={`${inputClassName} cursor-pointer`}
                    >
                      {PAYMENT_TERMS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="hidden sm:block" />
                  <Field label="Notes & conditions" className="sm:col-span-2">
                    <textarea
                      rows={3}
                      value={form.default_notes ?? ''}
                      onChange={(e) => setField('default_notes', e.target.value)}
                      placeholder="Ex: Paiement exigible sous 30 jours nets. Merci pour votre confiance."
                      className={`${inputClassName} resize-none`}
                    />
                  </Field>
                </SettingsSection>
              </>
            )}

            {activeTab === 'equipe' && (
              <section className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Membres de l&apos;espace
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Personnes ayant accès à la facturation de l&apos;entreprise.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<UserPlus className="w-3.5 h-3.5" />}
                    disabled
                    title="Bientôt disponible"
                    className="shrink-0"
                  >
                    <span className="hidden sm:inline">Inviter un membre</span>
                    <span className="sm:hidden">Inviter</span>
                  </Button>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(user.fullName || user.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {user.fullName || user.email.split('@')[0]}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Propriétaire
                    </span>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/40">
                  <p className="text-xs text-slate-500">
                    <span className="inline-flex items-center px-1.5 py-0.5 mr-1.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                      Bientôt
                    </span>
                    L&apos;invitation de collaborateurs et la gestion des rôles arriveront avec les
                    comptes utilisateurs.
                  </p>
                </div>
              </section>
            )}

            {/* Barre de modifications non enregistrées */}
            {isDirty && (
              <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-surface border border-slate-200/80 shadow-lg">
                <span className="text-xs font-medium text-slate-600">
                  Vous avez des modifications non enregistrées.
                </span>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Undo2 className="w-3.5 h-3.5" />}
                    onClick={handleCancel}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                    onClick={handleSave}
            loading={isSaving}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation d'enregistrement */}
      {showSaved && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-sm font-semibold text-emerald-700 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4" />
          Paramètres enregistrés
        </div>
      )}
    </>
  );
}
