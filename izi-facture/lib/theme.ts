'use client';

import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY as STORAGE_KEY } from './theme-script';

const THEME_EVENT = 'izi-theme-change';

function subscribe(callback: () => void) {
  // Synchronise aussi les autres onglets ouverts
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    document.documentElement.classList.toggle('dark', e.newValue === 'dark');
    callback();
  };
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return false;
}

/** Indique si le mode sombre est actif (se met à jour automatiquement). */
export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Active ou désactive le mode sombre et mémorise le choix. */
export function setDarkMode(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {}
  window.dispatchEvent(new Event(THEME_EVENT));
}
