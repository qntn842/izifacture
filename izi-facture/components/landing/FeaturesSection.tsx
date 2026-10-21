import React from 'react';
import { Activity, FileDown, Percent, Users } from 'lucide-react';
import { Container } from './Container';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import styles from './FeaturesSection.module.css';

/** Fonctionnalités réellement disponibles dans l'application */
const FEATURES = [
  {
    icon: Percent,
    title: 'TVA 18 % automatique',
    description:
      'Saisissez vos prestations en FCFA : remise, TVA et total TTC sont calculés instantanément, sans décimales.',
  },
  {
    icon: FileDown,
    title: 'Factures PDF professionnelles',
    description:
      'Aperçu en direct pendant la saisie, numérotation automatique et téléchargement en PDF A4 en un clic.',
  },
  {
    icon: Activity,
    title: 'Suivi des paiements',
    description:
      'Brouillon, envoyée, payée : les factures dont l’échéance est dépassée passent en retard automatiquement.',
  },
  {
    icon: Users,
    title: 'Clients & entreprise',
    description:
      'Votre répertoire clients et vos informations légales (RCCM / NINEA) repris sur chaque facture.',
  },
];

/** Section « Fonctionnalités » */
export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className={styles.section} aria-labelledby="fonctionnalites-titre">
      <Container>
        <SectionHeading
          id="fonctionnalites-titre"
          eyebrow="Fonctionnalités"
          title="Tout ce qu’il faut pour facturer sereinement."
          subtitle="Un outil simple, pensé pour le FCFA et pour le téléphone autant que pour l’ordinateur."
        />
        <div className={styles.grid}>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(index % 4) as 0 | 1 | 2 | 3}>
                <article className={styles.card}>
                  <span className={styles.icon}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className={styles.title}>{feature.title}</h3>
                  <p className={styles.description}>{feature.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
