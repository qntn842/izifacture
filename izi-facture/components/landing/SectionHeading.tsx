import React from 'react';
import { Reveal } from './Reveal';
import { cx } from './cx';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  /** Texte clair, pour une section sur fond sombre */
  onDark?: boolean;
  id?: string;
}

/** Étiquette + grand titre + sous-titre, en tête de chaque section */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', onDark = false, id }: SectionHeadingProps) {
  return (
    <Reveal className={cx(styles.heading, align === 'center' && styles.center)}>
      <span className={cx(styles.eyebrow, onDark && styles.eyebrowDark)}>{eyebrow}</span>
      <h2 id={id} className={cx(styles.title, onDark && styles.titleDark)}>
        {title}
      </h2>
      {subtitle && <p className={cx(styles.subtitle, onDark && styles.subtitleDark)}>{subtitle}</p>}
    </Reveal>
  );
}
