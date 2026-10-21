import React from 'react';
import Link from 'next/link';
import { cx } from './cx';
import styles from './Logo.module.css';

interface LogoProps {
  /** Identifiant unique des dégradés SVG (plusieurs logos sur la page) */
  id: string;
  href?: string;
  showTag?: boolean;
  compact?: boolean;
  className?: string;
}

/** Emblème à double anneau + mot « iziFacture » */
export function Logo({ id, href = '/', showTag = false, compact = false, className }: LogoProps) {
  return (
    <Link href={href} className={cx(styles.logo, compact && styles.compact, className)} aria-label="iziFacture — accueil">
      <svg className={styles.mark} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke={`url(#${id}-outer)`} strokeWidth="4.5" strokeLinecap="round" />
        <circle
          cx="20"
          cy="20"
          r="10"
          stroke={`url(#${id}-inner)`}
          strokeWidth="3"
          strokeDasharray="28 10"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id={`${id}-outer`} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#155dfc" />
            <stop offset="1" stopColor="#4f39f6" />
          </linearGradient>
          <linearGradient id={`${id}-inner`} x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0b0f17" />
            <stop offset="1" stopColor="#155dfc" />
          </linearGradient>
        </defs>
      </svg>
      <span className={styles.wordmark}>
        <span className={styles.name}>
          izi<span className={styles.accent}>Facture</span>
        </span>
        {showTag && <span className={styles.tag}>Afrique</span>}
      </span>
    </Link>
  );
}
