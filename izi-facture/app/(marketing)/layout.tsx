import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { LandingShell } from '@/components/landing/LandingShell';

// Police de la landing page (variable CSS lue par LandingShell.module.css)
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'iziFacture — Facturation moderne pour entrepreneurs africains',
  description:
    'Créez des factures conformes en FCFA avec TVA 18 % automatique, suivez vos paiements et encaissez plus vite. Pensé pour le Sénégal, la Côte d’Ivoire, le Cameroun et toute l’Afrique francophone.',
};

/** Pages publiques de présentation (landing page) */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={jakarta.variable}>
      <LandingShell>{children}</LandingShell>
    </div>
  );
}
