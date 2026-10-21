import React from 'react';
import Link from 'next/link';
import { cx } from './cx';
import styles from './LandingButton.module.css';

type Variant = 'primary' | 'outline' | 'ghost' | 'light' | 'outlineLight';
type Size = 'sm' | 'md' | 'lg';

interface LandingButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Bouton-lien en forme de pilule de la landing page */
export function LandingButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  onClick,
}: LandingButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        styles.button,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
    >
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className={cx(styles.icon, styles.iconTrailing)}>{iconRight}</span>}
    </Link>
  );
}
