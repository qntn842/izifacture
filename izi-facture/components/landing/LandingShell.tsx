import React from 'react';
import styles from './LandingShell.module.css';

/** Enveloppe de la landing page : variables de la charte, police et fond */
export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="haut" className={styles.shell}>
      {children}
    </div>
  );
}
