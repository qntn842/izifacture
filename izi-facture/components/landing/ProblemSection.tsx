import React from 'react';
import { Calculator, CheckCircle2, FileWarning, Hourglass } from 'lucide-react';
import { Container } from './Container';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import styles from './ProblemSection.module.css';

const PROBLEMS = [
  {
    icon: FileWarning,
    problem: 'Des factures bricolées',
    description:
      'Modèles Word copiés-collés, numéros oubliés, coordonnées incomplètes : vos factures ne reflètent pas votre sérieux.',
    solution: 'Des factures propres et numérotées automatiquement, prêtes en PDF.',
  },
  {
    icon: Calculator,
    problem: 'Des calculs de TVA approximatifs',
    description:
      'Une erreur d’arrondi sur la TVA à 18 % et votre client refuse la facture. Les grands comptes ne laissent rien passer.',
    solution: 'TVA, remises et totaux calculés au franc près, sans décimales.',
  },
  {
    icon: Hourglass,
    problem: 'Des paiements qui traînent',
    description:
      'Qui a payé ? Quelle facture est en retard ? Sans suivi, la trésorerie se perd entre WhatsApp, Excel et la mémoire.',
    solution: 'Un tableau de bord qui montre l’encaissé, l’attente et les retards.',
  },
];

/** Section « Pourquoi iziFacture ? » : les problèmes résolus */
export function ProblemSection() {
  return (
    <section id="probleme" className={styles.section} aria-labelledby="probleme-titre">
      <Container>
        <SectionHeading
          id="probleme-titre"
          eyebrow="Pourquoi iziFacture ?"
          title="Facturer ne devrait pas vous coûter vos dimanches."
          subtitle="Les entrepreneurs africains perdent un temps précieux sur des outils qui n’ont pas été pensés pour eux."
        />
        <div className={styles.grid}>
          {PROBLEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.problem} delay={index as 0 | 1 | 2}>
                <article className={styles.card}>
                  <span className={styles.icon}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className={styles.problem}>{item.problem}</h3>
                  <p className={styles.description}>{item.description}</p>
                  <p className={styles.solution}>
                    <CheckCircle2 size={18} className={styles.check} aria-hidden="true" />
                    {item.solution}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
