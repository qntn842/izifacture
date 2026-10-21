import React from 'react';
import { cx } from './cx';
import styles from './Container.module.css';

/** Largeur maximale + marges latérales communes à toutes les sections */
export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx(styles.container, className)}>{children}</div>;
}
