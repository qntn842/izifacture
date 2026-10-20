'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileMenuProvider, useMobileMenu } from './MobileMenuContext';
import { DataProvider } from '@/lib/context/DataContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { isOpen, closeMobileMenu } = useMobileMenu();

  // iOS Safari n'applique :active (nos effets au toucher) que si un écouteur touchstart existe
  useEffect(() => {
    const noop = () => {};
    document.addEventListener('touchstart', noop, { passive: true });
    return () => document.removeEventListener('touchstart', noop);
  }, []);

  return (
    <div className="min-h-screen flex bg-page">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        isOpen={isOpen}
        onClose={closeMobileMenu}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DataProvider>
      <MobileMenuProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </MobileMenuProvider>
    </DataProvider>
  );
}

