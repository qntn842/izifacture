import React from 'react';
import { Avatar } from './Avatar';
import { cx } from './cx';
import styles from './DashboardMockup.module.css';

const INVOICES = [
  {
    number: '#204',
    client: 'Agence Digitale Kemit',
    reference: 'Réf : DKR-2025-04 • Dakar, Sénégal',
    total: '1 416 000 FCFA',
    detail: 'Dont 216 000 FCFA (TVA 18 %)',
    status: 'paid' as const,
  },
  {
    number: '#203',
    client: 'Sarl Ivoire Logistique',
    reference: 'Réf : ABJ-2025-09 • Abidjan, CI',
    total: '750 000 FCFA',
    detail: 'Échéance : demain',
    status: 'pending' as const,
  },
];

const STATUS_LABEL = { paid: 'Payée', pending: 'En attente' };

/** Aperçu illustratif du tableau de bord iziFacture (contenu décoratif) */
export function DashboardMockup() {
  return (
    <figure className={styles.frame} aria-label="Aperçu du tableau de bord iziFacture">
      <div className={styles.window}>
        <div className={styles.bar}>
          <div className={styles.dots} aria-hidden="true">
            <span className={cx(styles.dot, styles.dotRed)} />
            <span className={cx(styles.dot, styles.dotYellow)} />
            <span className={cx(styles.dot, styles.dotGreen)} />
            <span className={styles.url}>app.izifacture.com/tableau-de-bord</span>
          </div>
          <div className={styles.session}>
            <span className={styles.sessionBadge}>Session active • FCFA</span>
            <Avatar name="Awa Sow" size="xs" />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <p className={styles.kpiLabel}>Chiffre d&apos;affaires ce mois</p>
              <p className={styles.kpiValue}>
                4 850 000<span className={styles.kpiCurrency}>FCFA</span>
              </p>
              <p className={cx(styles.kpiNote, styles.kpiNotePositive)}>
                ↑ +24 % <span className={styles.kpiNoteMuted}>vs mois précédent</span>
              </p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiLabel}>TVA 18 % collectée</p>
              <p className={styles.kpiValue}>
                873 000<span className={styles.kpiCurrency}>FCFA</span>
              </p>
              <p className={styles.kpiNote}>Prêt pour la déclaration fiscale</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiLabel}>Factures en attente</p>
              <p className={cx(styles.kpiValue, styles.kpiValuePending)}>
                620 000<span className={styles.kpiCurrency}>FCFA</span>
              </p>
              <p className={cx(styles.kpiNote, styles.kpiNoteAccent)}>2 relances suggérées</p>
            </div>
          </div>

          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span className={styles.listTitle}>
                Dernières factures émises
                <span className={styles.liveBadge}>Temps réel</span>
              </span>
              <span className={styles.listAction}>+ Nouvelle facture</span>
            </div>
            {INVOICES.map((invoice) => (
              <div key={invoice.number} className={styles.row}>
                <span className={cx(styles.rowNumber, invoice.status === 'paid' && styles.rowNumberAccent)}>
                  {invoice.number}
                </span>
                <div className={styles.rowClient}>
                  <p className={styles.rowName}>{invoice.client}</p>
                  <p className={styles.rowRef}>{invoice.reference}</p>
                </div>
                <div className={styles.rowAmount}>
                  <p className={styles.rowTotal}>{invoice.total}</p>
                  <p className={styles.rowTax}>{invoice.detail}</p>
                </div>
                <span className={cx(styles.status, styles[invoice.status])}>{STATUS_LABEL[invoice.status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
