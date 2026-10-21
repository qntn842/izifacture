import React from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Logo } from './Logo';
import styles from './LandingFooter.module.css';

const PRODUCT_LINKS = [
  { label: 'Générateur de factures', href: '#fonctionnalites' },
  { label: 'Calcul de la TVA 18 %', href: '#fonctionnalites' },
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Tarifs & abonnements', href: '#tarifs' },
];

const ACCOUNT_LINKS = [
  { label: 'Créer un compte', href: '/inscription' },
  { label: 'Se connecter', href: '/connexion' },
];

const COVERAGE = [
  'Facturation Sénégal (NINEA)',
  'Facturation Côte d’Ivoire (RCCM)',
  'Facturation Cameroun (NIU)',
  'FCFA XOF & XAF',
];

/* Icônes des réseaux sociaux (lucide ne fournit pas les logos de marques) */
const SOCIALS = [
  {
    label: 'X (Twitter)',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'LinkedIn',
    path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
  },
  {
    label: 'Facebook',
    path: 'M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z',
  },
];

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div>
            <Logo id="footer-logo" href="#haut" compact />
            <p className={styles.description}>
              Le logiciel de facturation simple, rapide et conforme, conçu pour les indépendants et les
              entreprises en Afrique.
            </p>
            {/* Liens vers les réseaux : à renseigner quand les comptes existeront */}
            <div className={styles.socials}>
              {SOCIALS.map((social) => (
                <a key={social.label} href="#haut" className={styles.social} aria-label={social.label}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Produit">
            <h3 className={styles.columnTitle}>Produit</h3>
            <ul className={styles.links}>
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.link}>
                    {link.label}
                  </a>
                </li>
              ))}
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={styles.columnTitle}>Couverture</h3>
            <ul className={styles.links}>
              {COVERAGE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.columnTitle}>Engagement</h3>
            <div className={styles.pride}>
              <p className={styles.prideTitle}>
                <span aria-hidden="true">🌍</span> Fait avec fierté en Afrique
              </p>
              <p className={styles.prideText}>
                Conçu par des entrepreneurs africains pour répondre à nos propres réalités de trésorerie.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>© 2026 iziFacture. Tous droits réservés.</p>
          <ul className={styles.legal}>
            <li>Conditions générales</li>
            <li>Politique de confidentialité</li>
            <li>Mentions légales</li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
