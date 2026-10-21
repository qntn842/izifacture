'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cx } from './cx';
import styles from './Reveal.module.css';

interface RevealProps {
  children: React.ReactNode;
  /** Décalage de l'animation pour enchaîner plusieurs éléments (0 à 3) */
  delay?: 0 | 1 | 2 | 3;
  className?: string;
  id?: string;
}

/** Fait apparaître son contenu en fondu quand il entre dans l'écran (une seule fois) */
export function Reveal({ children, delay = 0, className, id }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={cx(
        styles.reveal,
        isVisible && styles.visible,
        delay > 0 && styles[`delay${delay}` as 'delay1' | 'delay2' | 'delay3'],
        className
      )}
    >
      {children}
    </div>
  );
}
