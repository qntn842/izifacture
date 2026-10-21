import React from 'react';
import { cx } from './cx';
import styles from './Avatar.module.css';

export type AvatarColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan';

interface AvatarProps {
  /** Nom complet : les initiales sont calculées automatiquement */
  name: string;
  color?: AvatarColor;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  ring?: 'light' | 'dark' | 'border';
  className?: string;
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase();
}

/** Pastille ronde avec initiales sur dégradé (remplace les photos) */
export function Avatar({ name, color = 'blue', size = 'md', ring, className }: AvatarProps) {
  return (
    <span
      className={cx(
        styles.avatar,
        styles[size],
        styles[color],
        ring === 'light' && styles.ring,
        ring === 'dark' && styles.ringDark,
        ring === 'border' && styles.border,
        className
      )}
      aria-hidden="true"
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}
