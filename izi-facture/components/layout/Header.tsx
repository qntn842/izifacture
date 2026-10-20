'use client';

import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useMobileMenu } from './MobileMenuContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onOpenMobileMenu?: () => void;
}

export function Header({
  title = 'Tableau de bord',
  subtitle,
  actions,
  onOpenMobileMenu,
}: HeaderProps) {
  const { openMobileMenu } = useMobileMenu();
  const handleOpenMenu = onOpenMobileMenu || openMobileMenu;

  return (
    <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-3 min-h-[40px]">
        {/* Left: Mobile hamburger (3 traits) + Format PC aligné à gauche (inchangé) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200/60 bg-surface/70 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Ouvrir le menu de navigation"
            type="button"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Format PC : comme c'était avant (aligné à gauche avec titre et sous-titre) */}
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Format Téléphone : centré avec un espacement strictement égal des deux côtés */}
        <div className="md:hidden flex-1 text-center min-w-0 px-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h1>
        </div>

        {/* Right: Actions slot or standard CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {actions ? (
            actions
          ) : (
            <>
              {/* Notifications */}
              <button
                type="button"
                className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors hidden sm:flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-surface" />
              </button>

              {/* Bouton Nouvelle facture */}
              <Link href="/factures/nouvelle">
                <Button
                  size="md"
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Nouvelle facture</span>
                  <span className="sm:hidden">Créer</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
