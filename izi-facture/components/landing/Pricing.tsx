import React from 'react';
import { Check, X } from 'lucide-react';
import { Container } from './Container';
import { LandingButton } from './LandingButton';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { cx } from './cx';
import styles from './Pricing.module.css';

interface Plan {
  tag: string;
  name: string;
  audience: string;
  amount: string;
  equivalent?: string;
  cta: string;
  featured?: boolean;
  features: Array<{ label: React.ReactNode; included?: boolean }>;
}

const PLANS: Plan[] = [
  {
    tag: 'Pour démarrer',
    name: 'Plan Gratuit',
    audience: 'Idéal pour tester ou lancer une petite activité freelance.',
    amount: '0',
    cta: 'Commencer gratuitement',
    features: [
      { label: <><strong>5 factures</strong> par mois</> },
      { label: <><strong>1 utilisateur</strong></> },
      { label: 'Calcul automatique TVA 18 %' },
      { label: 'Export PDF standard' },
      { label: 'Pas de relances WhatsApp automatiques', included: false },
    ],
  },
  {
    tag: 'Recommandé',
    name: 'Plan Pro',
    audience: 'Pour les indépendants, prestataires et TPE qui veulent la tranquillité.',
    amount: '5 000',
    equivalent: 'Soit environ 7,60 € / mois',
    cta: 'Choisir le Plan Pro',
    featured: true,
    features: [
      { label: <><strong>Factures & devis illimités</strong></> },
      { label: <><strong>1 utilisateur dédié</strong></> },
      { label: 'Calcul TVA 18 % & gestion XOF / XAF' },
      { label: <><strong>Partage & relance WhatsApp en 1 clic</strong></> },
      { label: 'Personnalisation (logo & couleurs)' },
      { label: 'Support prioritaire 7j/7' },
    ],
  },
  {
    tag: 'PME & équipes',
    name: 'Plan Business',
    audience: 'Pour les agences et entreprises structurées avec collaborateurs.',
    amount: '15 000',
    cta: 'Choisir le Plan Business',
    features: [
      { label: <><strong>Factures & devis illimités</strong></> },
      { label: <><strong>Multi-utilisateurs (jusqu’à 5 accès)</strong></> },
      { label: 'Rôles & permissions (comptable, commercial)' },
      { label: 'Export comptable & Excel' },
      { label: 'Gestionnaire de compte dédié' },
    ],
  },
];

const PAYMENT_METHODS = ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Visa & Mastercard'];

/** Section « Tarifs » + moyens de paiement */
export function Pricing() {
  return (
    <section id="tarifs" className={styles.section} aria-labelledby="tarifs-titre">
      <Container>
        <SectionHeading
          id="tarifs-titre"
          eyebrow="Tarification claire"
          title="Un investissement rentabilisé dès la première facture."
          subtitle="Tarifs en FCFA adaptés au marché africain. Pas de mauvaises surprises, annulation en un clic."
        />

        <div className={styles.grid}>
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delay={index as 0 | 1 | 2} className={styles.fill}>
              <article className={cx(styles.plan, plan.featured && styles.featured)}>
                {plan.featured && <span className={styles.ribbon}>Le plus populaire</span>}
                <div>
                  <div className={styles.planTop}>
                    <span className={styles.tag}>{plan.tag}</span>
                    {plan.featured && <span className={styles.tagNote}>Paiement Mobile Money</span>}
                  </div>
                  <h3 className={styles.name}>{plan.name}</h3>
                  <p className={styles.audience}>{plan.audience}</p>

                  <div className={styles.price}>
                    <span className={styles.amount}>{plan.amount}</span>
                    <span className={styles.period}>FCFA / mois</span>
                    {plan.equivalent && <p className={styles.equivalent}>{plan.equivalent}</p>}
                  </div>

                  <ul className={styles.features}>
                    {plan.features.map((feature, featureIndex) => {
                      const included = feature.included !== false;
                      const Icon = included ? Check : X;
                      return (
                        <li key={featureIndex} className={cx(styles.feature, !included && styles.featureOff)}>
                          <Icon size={16} strokeWidth={3} className={styles.featureIcon} aria-hidden="true" />
                          <span>
                            {!included && <span className={styles.srOnly}>Non inclus : </span>}
                            {feature.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className={styles.footer}>
                  <LandingButton href="/inscription" variant={plan.featured ? 'primary' : 'outline'} fullWidth>
                    {plan.cta}
                  </LandingButton>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.payments}>
          <p className={styles.paymentsTitle}>Moyens de paiement acceptés en Afrique</p>
          <ul className={styles.paymentsList}>
            {PAYMENT_METHODS.map((method) => (
              <li key={method} className={styles.payment}>
                {method}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
