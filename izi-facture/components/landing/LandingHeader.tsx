'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ChevronRight, LogIn } from 'lucide-react';
import { Container } from './Container';
import { LandingButton } from './LandingButton';
import { Logo } from './Logo';
import { cx } from './cx';
import styles from './LandingHeader.module.css';

export const NAV_ITEMS = [
  { id: 'probleme', label: 'Pourquoi iziFacture ?' },
  { id: 'fonctionnalites', label: 'Fonctionnalités' },
  { id: 'comment-ca-marche', label: 'Comment ça marche' },
  { id: 'temoignages', label: 'Témoignages' },
  { id: 'tarifs', label: 'Tarifs' },
] as const;

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

/* ---------- La page a-t-elle défilé ? (lecture directe de window.scrollY) ---------- */
function subscribeToScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}
const getIsScrolled = () => window.scrollY > 12;
const getIsScrolledOnServer = () => false;

/** Section actuellement visible à l'écran (pour souligner le bon lien du menu) */
function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      // Une section est "active" quand elle occupe le haut-milieu de l'écran
      { rootMargin: '-35% 0px -55% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

export function LandingHeader() {
  const isScrolled = useSyncExternalStore(subscribeToScroll, getIsScrolled, getIsScrolledOnServer);
  const activeId = useActiveSection(SECTION_IDS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Menu ouvert : on bloque le défilement de la page, Échap le referme
  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className={styles.header} data-scrolled={isScrolled || isMenuOpen}>
        <Container className={styles.inner}>
          <Logo id="header-logo" href="#haut" showTag />

          <nav className={styles.nav} aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cx(styles.navLink, activeId === item.id && styles.navLinkActive)}
                aria-current={activeId === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <LandingButton
              href="/connexion"
              variant="ghost"
              size="sm"
              className={styles.login}
              iconLeft={<LogIn size={16} aria-hidden="true" />}
            >
              Connexion
            </LandingButton>
            <LandingButton href="/inscription" variant="outline" size="sm" className={styles.signup}>
              S&apos;inscrire
            </LandingButton>

            <button
              type="button"
              className={styles.burger}
              aria-expanded={isMenuOpen}
              aria-controls="menu-mobile"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span className={styles.burgerLine} />
              <span className={styles.burgerLine} />
              <span className={styles.burgerLine} />
            </button>
          </div>
        </Container>
        <span className={styles.progress} aria-hidden="true" />
      </header>

      {/* Menu téléphone */}
      <div
        className={cx(styles.backdrop, isMenuOpen && styles.backdropVisible)}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        id="menu-mobile"
        className={cx(styles.mobileMenu, isMenuOpen && styles.mobileMenuOpen)}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        <nav aria-label="Navigation mobile">
          <ul className={styles.mobileList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id} className={styles.mobileItem}>
                <a
                  href={`#${item.id}`}
                  onClick={closeMenu}
                  className={cx(styles.mobileLink, activeId === item.id && styles.mobileLinkActive)}
                >
                  {item.label}
                  <ChevronRight size={18} className={styles.mobileChevron} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobileCtas}>
          <LandingButton href="/inscription" variant="primary" fullWidth onClick={closeMenu}>
            Créer mon compte gratuit
          </LandingButton>
          <Link href="/connexion" className={styles.mobileLink} onClick={closeMenu}>
            Se connecter
            <LogIn size={18} className={styles.mobileChevron} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
