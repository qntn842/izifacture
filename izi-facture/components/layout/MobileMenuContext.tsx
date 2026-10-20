'use client';

import React, { createContext, useContext, useState } from 'react';

interface MobileMenuContextType {
  isOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({
  isOpen: false,
  openMobileMenu: () => {},
  closeMobileMenu: () => {},
  toggleMobileMenu: () => {},
});

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileMenuContext.Provider
      value={{
        isOpen,
        openMobileMenu: () => setIsOpen(true),
        closeMobileMenu: () => setIsOpen(false),
        toggleMobileMenu: () => setIsOpen((prev) => !prev),
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}
