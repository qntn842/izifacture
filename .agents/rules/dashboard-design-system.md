# Directives et Règles de Conception : IZI FACTURE

Ce document définit les règles de conception et de développement à respecter rigoureusement pour toute modification ou création de page, composant ou fonctionnalité dans l'application **IZI FACTURE**.
Toutes les pages doivent impérativement s'inspirer du **Dashboard (`/tableau-de-bord`)** et reproduire fidèlement son style, ses bordures, ses animations et son responsive design.

---

## 1. Règle d'or : Cohérence absolue avec le Dashboard

Chaque nouvelle page (Factures, Clients, Devis, Paramètres, Création, etc.) doit être le miroir esthétique et fonctionnel du tableau de bord :
- **Même structure de mise en page** : Encapsulée dans `DashboardLayout` avec le fond `bg-page`.
- **Même Header dynamique** : Utilisation systématique du composant standard `@/components/layout/Header`.
- **Mêmes composants UI** : Boutons, cartes, tableaux, badges et formulaires doivent utiliser le design system établi.
- **Même niveau de finition premium** : Transitions douces, micro-animations au survol et au clic, typographie moderne et épurée.

---

## 2. Header & Responsive Design (Mobile vs PC)

Le composant `Header` (@/components/layout/Header.tsx) applique une règle stricte :

### Format PC (Desktop : `md:` et supérieur)
- **Aligné à gauche comme à l'origine** : Le titre (`text-xl font-bold text-slate-900 tracking-tight`) et son sous-titre explicatif (`text-xs text-slate-500 mt-0.5`) sont alignés à gauche.
- **Menu hamburger masqué** (`md:hidden`).
- **Actions à droite** : Boutons d'action principale (`Nouvelle facture`, etc.) et notifications.

### Format Téléphone (Mobile : écran < `md`)
- **Les 3 petits traits (☰) à gauche** : Bouton d'ouverture du menu latéral (`p-2 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200/60 bg-white/70 shadow-xs`).
- **Titre parfaitement centré au milieu** : Le titre de la page utilise obligatoirement `flex-1 text-center min-w-0 px-2` pour avoir **un espacement rigoureusement égal des deux côtés** (distance égale entre ☰ et le titre, et entre le titre et le bouton d'action droit).
- **Action rapide à droite** : Bouton concis (ex. `+ Créer`).

---

## 3. Tokens de Design & Styles Visuels

### A. Couleurs
- **Fond de page principal** : `bg-page` (jamais `bg-[#F8F9FC]` en dur)
- **Fond de la barre latérale** : `bg-sidebar`
- **Surfaces & Cartes, header, modals** : `bg-surface` (jamais `bg-white`, sinon la carte reste blanche en mode sombre)
- **Bordures standard** : `border border-slate-200/80` (subtiles et semi-transparentes, jamais de bordure noire ou épaisse)
- **Séparateurs internes** : `border-slate-100` ou `divide-slate-100`
- **Couleur Primaire (Boutons, icônes clés)** : Bleu IZI `bg-blue-600 hover:bg-brand-hover active:bg-brand-active text-white`
- **Dégradé de marque (Logo IF)** : `bg-gradient-to-tr from-blue-600 to-indigo-600 text-white`
- **Bannières sombres (Hero banners)** : `bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl`
- **Statuts & Badges** :
  - *Payée / Succès* : `bg-emerald-50 text-emerald-700 border-emerald-200/80`, pastille `bg-emerald-500`
  - *En attente / Avertissement* : `bg-amber-50 text-amber-700 border-amber-200/80`, pastille `bg-amber-500`
  - *En retard / Danger* : `bg-rose-50 text-rose-700 border-rose-200/80`, pastille `bg-rose-500`
  - *Brouillon / Neutre* : `bg-slate-100 text-slate-600 border-slate-200`, pastille `bg-slate-400`

### B. Rayons de courbure (Border Radius)
- **Grandes cartes, bannières et conteneurs de tableau** : `rounded-2xl`
- **Boutons standard, champs de saisie, tiroirs et conteneurs d'icônes** : `rounded-xl`
- **Petits boutons (`sm`), badges et étiquettes** : `rounded-lg` ou `rounded-md`
- **Pastilles de statut (Pills)** : `rounded-full`

### C. Ombres (Box Shadows)
- **Cartes par défaut** : `shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)]`
- **Survol de carte interactive** : `hover:shadow-md hover:border-slate-300/80 transition-all duration-200`
- **Boutons primaires** : `shadow-xs hover:shadow-sm`

### D. Mode sombre
- Activé par la classe `.dark` sur `<html>` (interrupteur « Mode sombre » de la sidebar, choix mémorisé).
- La palette est remappée automatiquement dans `app/dark-theme.css` : continuer à utiliser les classes habituelles (`text-slate-900`, `bg-slate-50`, `border-slate-200/80`, `bg-blue-50`, `text-emerald-700`...), elles s'adaptent seules. Pas besoin d'ajouter des `dark:` partout.
- Utiliser `bg-surface` / `bg-page` / `bg-sidebar` au lieu de `bg-white` / couleurs hex.
- Un bloc qui doit garder ses couleurs claires (facture papier, bannière sombre du dashboard) reçoit la classe `theme-light`.
- `text-white` reste blanc : à réserver aux fonds colorés (bleu, dégradés). Sur un fond `bg-slate-900`, utiliser `text-slate-50`.
- Les fonds derrière les modals : `bg-black/40`.
- Si une modification de `globals.css` ou `dark-theme.css` n'apparaît pas : arrêter `npm run dev`, supprimer le dossier `.next`, relancer.

---

## 4. Composants UI Réutilisables

Toujours privilégier les composants réutilisables du dossier `@/components/ui/` :

1. **Boutons (`Button`)** :
   ```tsx
   import { Button } from '@/components/ui/Button';
   <Button variant="primary" icon={<Plus className="w-4 h-4" />}>Action</Button>
   ```
2. **Cartes de contenu (`Card`)** :
   ```tsx
   import { Card } from '@/components/ui/Card';
   <Card className="...">Contenu</Card>
   ```
3. **Cartes d'indicateurs KPIs (`KpiCard`)** :
   ```tsx
   import { KpiCard } from '@/components/dashboard/KpiCard';
   ```
4. **Badges de statut (`Badge`)** :
   ```tsx
   import { Badge } from '@/components/ui/Badge';
   ```

---

## 5. Formats régionaux & Cohérence Afrique (FCFA)

- **Devise** : Toujours utiliser `formatFCFA(montant)` de `@/lib/utils/format` (sans décimales, ex: `1 250 000 FCFA`).
- **Dates** : Toujours utiliser `formatDateFR(date)` au format `JJ/MM/AAAA`.

---

## 6. Tableaux et Listes de Données

Tout tableau doit reprendre exactement la structure de `RecentInvoicesTable` :
- Conteneur englobant : `bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden`.
- En-tête de section avec titre en `text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2`.
- En-tête de colonnes : `bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider`.
- Lignes : `hover:bg-slate-50/60 transition-colors group cursor-default`.
- Espacements : `py-3.5 px-4` ou `px-5 sm:px-6`.
