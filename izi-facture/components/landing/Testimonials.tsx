import React from 'react';
import { Star } from 'lucide-react';
import { Avatar, type AvatarColor } from './Avatar';
import { Container } from './Container';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { cx } from './cx';
import styles from './Testimonials.module.css';

const TESTIMONIALS: Array<{
  quote: string;
  name: string;
  role: string;
  color: AvatarColor;
  dark?: boolean;
}> = [
  {
    quote:
      'Avant, je passais mes dimanches à refaire des factures Word avec des copier-coller douteux. Avec iziFacture, ma facture est prête en 2 minutes dès que le contrat est validé. Mes clients à Dakar me paient deux fois plus vite.',
    name: 'Aminata Sy',
    role: 'Consultante marketing • Dakar, Sénégal',
    color: 'purple',
  },
  {
    quote:
      'Le calcul automatique de la TVA à 18 % m’a sauvé. En Côte d’Ivoire, les grands groupes rejettent la moindre facture si les arrondis de TVA sont imprécis. Grâce à iziFacture, zéro rejet depuis 8 mois.',
    name: 'Yao Kouamé',
    role: 'Fondateur d’Ivoire BTP • Abidjan, CI',
    color: 'blue',
    dark: true,
  },
  {
    quote:
      'Le suivi des encaissements est magique. Je sais exactement quelles créances sont dues à Douala et Yaoundé, et le Franc CFA CEMAC est géré sans friction.',
    name: 'Marcelle Mbarga',
    role: 'Directrice d’agence événementielle • Douala',
    color: 'emerald',
  },
];

/** Section « Témoignages » */
export function Testimonials() {
  return (
    <section id="temoignages" className={styles.section} aria-labelledby="temoignages-titre">
      <Container>
        <SectionHeading
          id="temoignages-titre"
          align="left"
          eyebrow="Ce qu’ils en disent"
          title="Approuvé par ceux qui font tourner l’économie locale."
          subtitle="Des freelances aux PME structurées, découvrez comment ils ont simplifié leur quotidien."
        />
        <div className={styles.grid}>
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.name} delay={index as 0 | 1 | 2}>
              <figure className={cx(styles.card, item.dark && styles.dark)}>
                <div>
                  <div className={styles.stars} role="img" aria-label="Note : 5 sur 5">
                    {Array.from({ length: 5 }, (_, star) => (
                      <Star key={star} size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className={styles.quote}>« {item.quote} »</blockquote>
                </div>
                <figcaption className={styles.author}>
                  <Avatar name={item.name} color={item.color} size="lg" ring={item.dark ? 'dark' : 'light'} />
                  <span>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.role}>{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
