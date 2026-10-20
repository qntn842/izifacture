'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Moon,
  Search,
  Sparkles,
  LogOut,
  X,
} from 'lucide-react';

import { useData } from '@/lib/context/DataContext';
import { getInitials } from '@/lib/utils/format';
import { useDarkMode, setDarkMode } from '@/lib/theme';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * La barre latérale lit l'adresse de la page (usePathname) pour surligner le menu actif.
 * Next 16 : sur une page à adresse variable (/factures/[id]), cette valeur n'est connue
 * qu'au moment de la visite -> lecture isolée dans <Suspense>. En attendant, la barre
 * s'affiche sans menu surligné (fallback), puis se met à jour instantanément.
 */
export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<SidebarView {...props} pathname="" />}>
      <SidebarWithPathname {...props} />
    </Suspense>
  );
}

function SidebarWithPathname(props: SidebarProps) {
  const pathname = usePathname();
  return <SidebarView {...props} pathname={pathname} />;
}

function SidebarView({ isOpen = false, onClose, pathname }: SidebarProps & { pathname: string }) {
  const isDarkMode = useDarkMode();
  const isSettingsActive = pathname.startsWith('/parametres');
  const { invoices, company, user, signOut } = useData();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/tableau-de-bord',
      icon: LayoutDashboard,
    },
    {
      name: 'Factures',
      href: '/factures',
      icon: FileText,
      badge: invoices.length > 0 ? invoices.length.toString() : undefined,
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-slate-200/80 w-full md:w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <Link
          href="/tableau-de-bord"
          className="flex items-center gap-2.5 group"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-sm tracking-tight">IF</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
                IZI FACTURE
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">
              Édition Afrique
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Search */}
      <div className="px-4 py-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-12 py-2 bg-surface/80 hover:bg-surface focus:bg-surface border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
            ⌘ F
          </kbd>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/tableau-de-bord' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                    isActive
                      ? 'bg-surface text-slate-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-200/60 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FCFA Quick Currency Banner */}
        <div className="mx-1 p-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Devise active</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            Format sans décimales configuré sur le <span className="font-semibold">FCFA ({company.currency})</span>.
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        <div className="space-y-1">
          {/* Paramètres */}
          <Link
            href="/parametres"
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group ${
              isSettingsActive
                ? 'bg-surface text-slate-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            <Settings
              className={`w-4 h-4 transition-colors ${
                isSettingsActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span>Paramètres</span>
          </Link>

          {/* Help & Support */}
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Aide & Support</span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-slate-400" />
            <span>Mode sombre</span>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!isDarkMode)}
            role="switch"
            aria-checked={isDarkMode}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            aria-label="Basculer le mode sombre"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isDarkMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Utilisateur connecté + déconnexion */}
        <div className="pt-2 mt-1 border-t border-slate-200/60">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {getInitials(user.fullName || user.email)}
              </div>
              <div className="overflow-hidden text-left">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user.fullName || user.email.split('@')[0]}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (toujours visible sur md+) */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible uniquement quand ouvert sur mobile) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Panel */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-sidebar shadow-2xl z-10 transition-transform">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
