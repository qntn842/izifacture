import React from 'react';
import { cx } from './cx';
import styles from './FloatingCard.module.css';

interface FloatingCardProps {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  theme?: 'light' | 'dark';
  /** Avatar, initiales ou symbole affiché à gauche */
  icon: React.ReactNode;
  label: string;
  amount: string;
  /** Petit symbole devant le montant (ex. ↑, ✓) */
  chip?: string;
  note?: string;
  notePositive?: boolean;
}

/** Carte « transaction » décorative qui flotte autour du titre principal */
export function FloatingCard({
  position,
  theme = 'light',
  icon,
  label,
  amount,
  chip,
  note,
  notePositive = false,
}: FloatingCardProps) {
  return (
    <div className={cx(styles.card, styles[theme], styles[position])} aria-hidden="true">
      <span className={styles.icon}>{icon}</span>
      <div>
        <p className={styles.label}>{label}</p>
        <div className={styles.amountRow}>
          {chip && <span className={styles.chip}>{chip}</span>}
          <span className={styles.amount}>{amount}</span>
        </div>
        {note && <span className={cx(styles.note, notePositive && styles.notePositive)}>{note}</span>}
      </div>
    </div>
  );
}

/** Pastille « % » ou initiales pour l'icône d'une FloatingCard */
export function FloatingIconBadge({ children }: { children: React.ReactNode }) {
  return <span className={styles.iconBadge}>{children}</span>;
}

/** Point vert « en ligne » posé sur un avatar */
export function FloatingStatusDot() {
  return <span className={styles.statusDot} />;
}
