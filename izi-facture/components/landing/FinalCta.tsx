import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { LandingButton } from './LandingButton';
import { Reveal } from './Reveal';
import styles from './FinalCta.module.css';

/** Dernier appel à l'action avant le pied de page */
export function FinalCta() {
  return (
    <section className={styles.section} aria-labelledby="cta-titre">
      <Container>
        <Reveal>
          <div className={styles.banner}>
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.content}>
              <h2 id="cta-titre" className={styles.title}>
                Prêt à facturer comme un pro ?
              </h2>
              <p className={styles.subtitle}>
                Crée ton compte gratuitement et envoie ta première facture conforme en quelques minutes.
              </p>
              <div className={styles.ctas}>
                <LandingButton
                  href="/inscription"
                  variant="light"
                  size="lg"
                  iconRight={<ArrowRight size={20} aria-hidden="true" />}
                >
                  Créer mon compte gratuit
                </LandingButton>
                <LandingButton href="/connexion" variant="outlineLight" size="lg">
                  J&apos;ai déjà un compte
                </LandingButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
