import React from 'react';
import { Clock3, Download, Sparkles } from 'lucide-react';
import { Container } from './Container';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { cx } from './cx';
import styles from './HowItWorks.module.css';

const STEPS = [
  {
    title: 'Inscris-toi',
    description:
      'Crée ton compte en 30 secondes avec ton email. Renseigne le nom de ton entreprise et tes informations légales.',
    pill: '30 secondes chrono',
    pillIcon: Clock3,
    pillStyle: undefined,
  },
  {
    title: 'Crée ta 1ʳᵉ facture',
    description:
      'Saisis tes prestations en FCFA. La TVA à 18 % est appliquée automatiquement et l’aperçu se met à jour en direct.',
    pill: 'Modèle soigné & conforme',
    pillIcon: Sparkles,
    pillStyle: 'pillBlue' as const,
    highlighted: true,
  },
  {
    title: 'Envoie & encaisse',
    description:
      'Télécharge le PDF et partage-le par WhatsApp ou par email. Suis la date de règlement depuis ton tableau de bord.',
    pill: 'PDF prêt à envoyer',
    pillIcon: Download,
    pillStyle: 'pillGreen' as const,
  },
];

/** Section « Comment ça marche » en 3 étapes */
export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className={styles.section} aria-labelledby="etapes-titre">
      <Container>
        <SectionHeading
          id="etapes-titre"
          eyebrow="Départ immédiat"
          title="Prêt à facturer en moins de 3 minutes."
          subtitle="Aucune carte bancaire requise pour tester. Aucune installation compliquée."
        />
        <div className={styles.stepsWrap}>
          <span className={styles.connector} aria-hidden="true" />
          <ol className={styles.steps}>
          {STEPS.map((step, index) => {
            const PillIcon = step.pillIcon;
            return (
              <li key={step.title}>
                <Reveal delay={index as 0 | 1 | 2} className={styles.fill}>
                  <div className={cx(styles.step, step.highlighted && styles.highlighted)}>
                    <span className={styles.number} aria-hidden="true">
                      {index + 1}
                    </span>
                    <h3 className={styles.title}>{step.title}</h3>
                    <p className={styles.description}>{step.description}</p>
                    <span className={cx(styles.pill, step.pillStyle && styles[step.pillStyle])}>
                      <PillIcon size={14} aria-hidden="true" />
                      {step.pill}
                    </span>
                  </div>
                </Reveal>
              </li>
            );
          })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
