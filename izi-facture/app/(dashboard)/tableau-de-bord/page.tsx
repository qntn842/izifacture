'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentInvoicesTable } from '@/components/dashboard/RecentInvoicesTable';
import { useData } from '@/lib/context/DataContext';
import { formatFCFA, formatLocation } from '@/lib/utils/format';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TableauDeBordPage() {
  const { invoices, stats, company } = useData();

  const percentCollected =
    stats.totalBilled > 0
      ? Math.round((stats.totalPaid / stats.totalBilled) * 100)
      : 0;

  return (
    <>
      {/* Top Header */}
      <Header
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la trésorerie et des factures"
      />

      {/* Main Page Body */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Welcome Banner & Quick Action */}
        <div className="theme-light bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
            <Receipt className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface/10 text-blue-200 text-xs font-medium backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {[company.company_name, formatLocation(company.city, company.country)].filter(Boolean).join(' — ')}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Bienvenue sur votre espace de facturation
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Suivez vos encaissements en direct, émettez vos factures en FCFA sans décimales et relancez vos clients en toute sérénité.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link href="/factures/nouvelle">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-blue-600 hover:bg-blue-500 shadow-sm"
                >
                  Créer une facture
                </Button>
              </Link>
              <Link href="/clients/nouveau">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<UserPlus className="w-4 h-4" />}
                  className="bg-surface/10 hover:bg-surface/20 text-white border-white/20 hover:border-white/30"
                >
                  Nouveau client
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPIs Section */}
        <section aria-label="Statistiques clés">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total facturé */}
            <KpiCard
              title="Total facturé"
              value={formatFCFA(stats.totalBilled)}
              subtitle={`${stats.invoicesCount} factures émises`}
              badge={{ text: 'Actif', variant: 'info' }}
              icon={<FileText className="w-5 h-5" />}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            {/* 2. Montant payé */}
            <KpiCard
              title="Montant encaissé"
              value={formatFCFA(stats.totalPaid)}
              subtitle={`${percentCollected}% du montant total`}
              badge={{ text: 'Payé', variant: 'success' }}
              icon={<CheckCircle2 className="w-5 h-5" />}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />

            {/* 3. Montant en attente */}
            <KpiCard
              title="Montant en attente"
              value={formatFCFA(stats.totalPending)}
              subtitle="Factures en cours de règlement"
              badge={{ text: 'En attente', variant: 'warning' }}
              icon={<Clock className="w-5 h-5" />}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />

            {/* 4. Factures en retard */}
            <KpiCard
              title="Factures en retard"
              value={formatFCFA(stats.totalOverdue)}
              subtitle={`${stats.overdueCount} facture${stats.overdueCount > 1 ? 's' : ''} à relancer`}
              badge={{ text: 'Urgent', variant: 'danger' }}
              icon={<AlertCircle className="w-5 h-5" />}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-600"
            />
          </div>
        </section>

        {/* Financial Highlights & Progress Bar */}
        <section className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Taux de recouvrement des factures
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatFCFA(stats.totalPaid)} encaissés sur un total exigible de {formatFCFA(stats.totalBilled)}
              </p>
            </div>
            <span className="text-base font-bold text-emerald-600 sm:text-right">
              {percentCollected}% encaissé
            </span>
          </div>

          {/* Bar progress */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentCollected}%` }}
              title={`Encaissé : ${percentCollected}%`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{
                width: `${
                  stats.totalBilled > 0
                    ? Math.round((stats.totalPending / stats.totalBilled) * 100)
                    : 0
                }%`,
              }}
              title="En attente"
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{
                width: `${
                  stats.totalBilled > 0
                    ? Math.round((stats.totalOverdue / stats.totalBilled) * 100)
                    : 0
                }%`,
              }}
              title="En retard"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Encaissé ({formatFCFA(stats.totalPaid)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>En attente ({formatFCFA(stats.totalPending)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>En retard ({formatFCFA(stats.totalOverdue)})</span>
            </div>
          </div>
        </section>

        {/* Recent Invoices Table Section */}
        <section aria-label="Dernières factures émises">
          <RecentInvoicesTable invoices={invoices} />
        </section>
      </main>
    </>
  );
}
