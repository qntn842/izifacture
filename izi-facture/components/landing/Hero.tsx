import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Avatar } from './Avatar';
import { Container } from './Container';
import { DashboardMockup } from './DashboardMockup';
import { FloatingCard, FloatingIconBadge, FloatingStatusDot } from './FloatingCard';
import { LandingButton } from './LandingButton';
import { Reveal } from './Reveal';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-titre">
      <div className={styles.glow} aria-hidden="true" />

      <Container>
        <div className={styles.intro}>
          {/* Cartes flottantes autour du titre (grands écrans uniquement) */}
          <FloatingCard
            position="topLeft"
            icon={
              <>
                <Avatar name="Fatou Ndiaye" color="emerald" ring="light" />
                <FloatingStatusDot />
              </>
            }
            label="Reçu de Fatou (Dakar)"
            chip="↑"
            amount="450 000 FCFA"
            note="Payé il y a 8 min"
          />
          <FloatingCard
            position="topRight"
            theme="dark"
            icon={<Avatar name="Côte Ivoire" color="blue" />}
            label="Facture client #042"
            chip="✓"
            amount="1 280 000 FCFA"
            note="TVA 18 % incluse (Abidjan)"
          />
          <FloatingCard
            position="bottomLeft"
            theme="dark"
            icon={<Avatar name="Koffi Mensah" color="amber" size="sm" ring="dark" />}
            label="Envoyé à Cabinet Koffi"
            amount="850 000 FCFA"
            note="Validé par le client"
            notePositive
          />
          <FloatingCard
            position="bottomRight"
            icon={<FloatingIconBadge>%</FloatingIconBadge>}
            label="TVA 18 % calculée"
            amount="+ 153 000 FCFA"
            note="Automatiquement, en 1 clic"
          />

          <div className={styles.content}>
            <p className={styles.badge}>
              <span className={styles.pulse} aria-hidden="true" />
              Fini les factures bricolées sur Word et Excel
            </p>

            <h1 id="hero-titre" className={styles.title}>
              Gère et facture{' '}
              <span className={styles.highlight}>
                <span className={styles.highlightText}>comme un pro</span>
                <svg
                  className={styles.underline}
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 9C70 3 190 2 298 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>{' '}
              en Afrique.
            </h1>

            <p className={styles.subtitle}>
              La plateforme tout-en-un pour créer des factures conformes en FCFA avec TVA 18 % automatique,
              suivre vos paiements et encaisser plus vite.
            </p>

            <div className={styles.ctas}>
              <LandingButton
                href="/inscription"
                size="lg"
                iconRight={<ArrowRight size={20} aria-hidden="true" />}
              >
                Commencer gratuitement
              </LandingButton>
              <LandingButton
                href="#demo"
                variant="outline"
                size="lg"
                iconLeft={<PlayCircle size={20} aria-hidden="true" />}
              >
                Voir l&apos;aperçu
              </LandingButton>
            </div>

            <div className={styles.proof}>
              <span className={styles.proofAvatars} aria-hidden="true">
                <Avatar name="Aminata Sy" color="purple" size="xs" ring="border" />
                <Avatar name="Yao Kouamé" color="blue" size="xs" ring="border" />
                <Avatar name="Marcelle Mbarga" color="emerald" size="xs" ring="border" />
              </span>
              <span>
                Pensé pour les entrepreneurs du <strong>Sénégal</strong>, de <strong>Côte d&apos;Ivoire</strong> et
                du <strong>Cameroun</strong>
              </span>
            </div>
          </div>
        </div>

        <Reveal id="demo" className={styles.mockup}>
          <DashboardMockup />
        </Reveal>
      </Container>
    </section>
  );
}
