# IZI FACTURE — Charte graphique et design system

> Document destiné à une IA ou à un designer qui doit **reproduire exactement** le style d'IZI FACTURE
> (nouvelle page, nouveau composant, maquette, site vitrine, etc.).
> Les valeurs viennent du code réel (`izi-facture/app/globals.css`, `app/dark-theme.css`, composants).
> Stack : **Tailwind CSS v4** (couleurs Tailwind v4, définies en `oklch` ; les codes hex ci-dessous en sont la conversion exacte).

---

## 1. Identité et ambiance

- **Produit** : application de facturation en **FCFA** pour freelances et petites entreprises d'Afrique de l'Ouest et centrale. Interface **100 % en français**.
- **Ambiance** : SaaS moderne, sobre et « premium » (inspiration Linear / Stripe / Notion) : beaucoup de blanc, gris bleutés très doux, un seul bleu fort pour l'action, bordures fines semi-transparentes, ombres quasi invisibles, coins bien arrondis.
- **Principes** :
  1. **Calme** : fonds très clairs, texte gris ardoise, jamais de noir pur ni de bordure épaisse.
  2. **Un seul accent** : le bleu IZI (`#155dfc`) pour les actions principales et les éléments actifs.
  3. **La couleur porte du sens** : vert = payé, ambre = en attente, rose = en retard, gris = brouillon.
  4. **Mobile d'abord** : le public utilise beaucoup le téléphone.
  5. **Mode clair et mode sombre** pour tout.

---

## 2. Couleurs

### 2.1 Couleurs de structure (tokens propres à IZI FACTURE)

| Token (classe Tailwind) | Rôle | Clair | Sombre |
|---|---|---|---|
| `bg-page` | Fond général des pages | `#f8f9fc` | `#0b0f17` |
| `bg-sidebar` | Fond de la barre latérale | `#f8f9fb` | `#0e131c` |
| `bg-surface` | Cartes, en-tête, fenêtres, menus | `#ffffff` | `#141a24` |
| `bg-brand-hover` | Bleu IZI au survol | `#1447e6` | `#1447e6` |
| `bg-brand-active` | Bleu IZI à l'appui | `#193cb8` | `#193cb8` |

> Règle absolue : **jamais `bg-white` ni de couleur hex en dur** dans les composants. Utiliser `bg-surface`, `bg-page`, `bg-sidebar`, sinon le mode sombre casse.

### 2.2 Couleur principale : bleu IZI

| Nuance | Hex | Usage |
|---|---|---|
| `blue-50` | `#eff6ff` | Fond d'icône, badge « info », pastille devise |
| `blue-100` | `#dbeafe` | Bordure de pastille info |
| `blue-200` | `#bedbff` | Bordure de badge info |
| `blue-500` | `#2b7fff` | Contour de champ au focus (`focus:border-blue-500`, anneau `ring-blue-500/20`) |
| **`blue-600`** | **`#155dfc`** | **Couleur d'action** : boutons principaux, icônes actives, liens, total TTC |
| `blue-700` | `#1447e6` | Texte sur fond bleu clair, survol du bouton principal |
| `blue-800` | `#193cb8` | Appui sur le bouton principal |
| `indigo-600` | `#4f39f6` | Fin du dégradé de marque |

**Dégradé de marque** (logo « IF », avatars) : `bg-gradient-to-tr from-blue-600 to-indigo-600` → `#155dfc` → `#4f39f6`.

### 2.3 Gris (ardoise / slate) — texte, bordures, fonds secondaires

| Nuance | Clair | Sombre | Usage |
|---|---|---|---|
| `slate-50` | `#f8fafc` | `#1a212d` | Fond de champ (`bg-slate-50/70`), en-tête de tableau, survol de ligne |
| `slate-100` | `#f1f5f9` | `#212937` | Séparateurs internes, badge neutre, boutons de filtre inactifs |
| `slate-200` | `#e2e8f0` | `#2b3443` | **Bordure standard** (`border-slate-200/80`) |
| `slate-300` | `#cad5e2` | `#3a4455` | Bordure au survol |
| `slate-400` | `#90a1b9` | `#7c8799` | Texte discret, libellés de colonnes, icônes inactives |
| `slate-500` | `#62748e` | `#929cad` | Sous-titres, textes d'aide |
| `slate-600` | `#45556c` | `#aab3c2` | Texte secondaire, liens de menu |
| `slate-700` | `#314158` | `#c3cad5` | Libellés de champs |
| `slate-800` | `#1d293d` | `#d9dee6` | Texte appuyé |
| `slate-900` | `#0f172b` | `#eef1f5` | **Titres et texte principal** |

### 2.4 Couleurs de statut (factures et badges)

Recette identique pour chaque statut : **fond `-50`, texte `-700`, bordure `-200/80`, pastille ronde `-500`**.

| Statut | Libellé | Fond | Texte | Bordure | Pastille |
|---|---|---|---|---|---|
| Payée / succès | « Payée » | emerald-50 `#ecfdf5` | emerald-700 `#007a55` | emerald-200 `#a4f4cf` | emerald-500 `#00bc7d` |
| Envoyée / attente | « Envoyée » | amber-50 `#fffbeb` | amber-700 `#bb4d00` | amber-200 `#fee685` | amber-500 `#fe9a00` |
| En retard / danger | « En retard » | rose-50 `#fff1f2` | rose-700 `#c70036` | rose-200 `#ffccd3` | rose-500 `#ff2056` |
| Brouillon / neutre | « Brouillon » | slate-100 `#f1f5f9` | slate-600 `#45556c` | slate-200 `#e2e8f0` | slate-400 `#90a1b9` |
| Annulée | « Annulée » | zinc-100 `#f4f4f5` | zinc-500 `#71717b` | zinc-200 `#e4e4e7` | zinc-400 `#9f9fa9` |

Autres usages : erreurs de formulaire en **rose** (`bg-rose-50 border-rose-200/80 text-rose-700`), confirmations en **vert** (`bg-emerald-50 border-emerald-200/80 text-emerald-700`), date d'échéance en `text-rose-600` (`#ec003f`).

### 2.5 Couleurs d'avatars (initiales des clients)
Dégradés `bg-gradient-to-tr`, attribués à tour de rôle, texte blanc :
`from-blue-600 to-indigo-600` · `from-emerald-500 to-teal-600` · `from-amber-500 to-orange-600` · `from-purple-600 to-pink-600` · `from-cyan-600 to-blue-600`.
Avatar de l'utilisateur connecté : `from-amber-500 to-orange-500` (rond).

### 2.6 Bannière d'accueil (tableau de bord)
Dégradé sombre : `bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950` (`#0f172b` → `#1d293d` → `#1e1a4d`), texte blanc, sous-texte `text-slate-300`, grande icône décorative en filigrane (`opacity-10`), pastille verte animée (`bg-emerald-400 animate-pulse`). Classe `theme-light` obligatoire pour qu'elle reste identique en mode sombre.

---

## 3. Mode sombre

- Activé par la classe `.dark` sur `<html>` (interrupteur « Mode sombre » de la barre latérale, choix mémorisé).
- Principe : **les mêmes classes servent dans les deux thèmes**. En mode sombre, la palette est redéfinie (`app/dark-theme.css`) :
  - gris `slate`/`zinc` : 50 → 300 deviennent des fonds sombres bleu nuit, 400 → 950 deviennent des textes clairs (voir tableau 2.3) ;
  - couleurs (blue, emerald, amber, rose…) : 50/100/200 deviennent des teintes **transparentes** (12 % / 20 % / 32 % de la nuance 500), 700/800/900 deviennent des versions **claires** (nuances 300/200/100).
- `text-white` reste blanc dans les deux thèmes : à réserver aux fonds colorés. Sur un fond `bg-slate-900`, écrire `text-slate-50`.
- La facture « papier » et la bannière d'accueil gardent les couleurs claires (classe `theme-light`).

---

## 4. Typographie

| Élément | Classes | Rendu |
|---|---|---|
| Police du texte | `body { font-family: Arial, Helvetica, sans-serif }` | Sans-serif neutre (Geist est chargée mais le `body` force Arial) |
| Chiffres, montants, numéros de facture | `font-mono` → **Geist Mono** | Ex. `FACT-20260001`, `1 250 000 FCFA` dans les tableaux |
| Titre de page (en-tête) | `text-xl font-bold text-slate-900 tracking-tight` | 20 px gras |
| Sous-titre de page | `text-xs text-slate-500 mt-0.5` | 12 px |
| Titre de carte / section | `text-base font-bold text-slate-900 tracking-tight` (+ icône `w-4 h-4 text-blue-600`) | 16 px gras |
| Valeur de KPI | `text-xl sm:text-2xl font-bold text-slate-900 tracking-tight` | 20–24 px |
| Libellé (KPI, champ) | `text-xs font-semibold uppercase tracking-wider` (`text-slate-400` pour KPI, `text-slate-700` pour champ) | PETITES CAPITALES espacées |
| En-tête de colonne de tableau | `text-[11px] font-semibold text-slate-400 uppercase tracking-wider` | 11 px |
| Texte courant | `text-sm text-slate-600` / `text-slate-900` | 14 px |
| Texte d'aide | `text-[11px] text-slate-400` | 11 px |
| Badge | `text-xs font-medium` (statut) / `text-[11px] font-semibold` (KPI) | |

Formats imposés : montants `1 250 000 FCFA` (espaces, **aucune décimale**), dates `JJ/MM/AAAA`.

---

## 5. Formes, ombres, espacements

### Rayons
| Élément | Classe | Valeur |
|---|---|---|
| Grandes cartes, tableaux, bannières, fenêtres | `rounded-2xl` | 16 px |
| Boutons, champs, conteneurs d'icônes, éléments de menu | `rounded-xl` | 12 px |
| Petits boutons, badges KPI, étiquettes | `rounded-lg` / `rounded-md` | 8 / 6 px |
| Badges de statut, pastilles, avatars ronds, interrupteurs | `rounded-full` | |

### Bordures
- Standard : `border border-slate-200/80` (1 px, semi-transparente). **Jamais de bordure noire ni épaisse.**
- Séparateurs : `border-slate-100` / `divide-slate-100`.
- Exception unique : trait `border-t-2 border-slate-900` au-dessus du « Total TTC » de la facture.

### Ombres
- Carte au repos : `shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)]` (presque invisible).
- Carte interactive au survol : `hover:shadow-md hover:border-slate-300/80 transition-all duration-200`.
- Bouton principal : `shadow-xs hover:shadow-sm`.
- Fenêtre (modal) : `shadow-2xl` ; facture papier : `shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)]`.

### Espacements et grille
- Contenu de page : `<main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">`.
- Intérieur des cartes : `p-5` (KPI) à `p-5 sm:p-6` ; espace entre cartes `gap-4` à `gap-6`.
- Grilles : KPI en `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` ; formulaire + aperçu en `lg:grid-cols-12` (7 + 5).
- Barre latérale : largeur `w-64` (256 px) sur PC, tiroir de 280 px max sur téléphone.

---

## 6. Recettes de composants (classes exactes)

**Bouton principal**
`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-brand-hover active:bg-brand-active text-white shadow-xs hover:shadow-sm transition-all duration-150`
Variantes : secondaire `bg-surface hover:bg-slate-50 text-slate-700 border border-slate-200/90` · fantôme `bg-transparent hover:bg-slate-100/80 text-slate-600` · danger `bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200`. Tailles : `sm` = `text-xs px-3 py-1.5 rounded-lg`, `lg` = `text-base px-5 py-3`. Icône lucide `w-4 h-4` à gauche du texte.

**Carte**
`bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 md:p-6`

**Carte KPI** : libellé en petites capitales gris clair en haut à gauche, grand chiffre dessous, **icône dans un carré arrondi** `w-11 h-11 rounded-xl` à droite (fond `-50`, icône `-600` de la couleur du sujet : bleu facturé, vert encaissé, ambre en attente, rose en retard), pied séparé par `border-t border-slate-100` avec sous-titre + petit badge.

**Section avec en-tête grisé** (page Paramètres) : en-tête `px-5 sm:px-6 py-4 bg-slate-50/70 border-b border-slate-100` (titre + icône bleue + description `text-xs text-slate-500`), corps `p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4`.

**Champ de formulaire**
- Libellé : `block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5` (astérisque rouge `text-rose-500` si obligatoire).
- Champ : `w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`.

**Tableau**
- Conteneur : carte `rounded-2xl … overflow-hidden`, défilement horizontal sur mobile.
- En-tête : `bg-slate-50/70 border-b border-slate-100` + libellés `text-[11px] uppercase tracking-wider text-slate-400`.
- Lignes : `divide-y divide-slate-100`, `hover:bg-slate-50/60 transition-colors`, cellules `py-3.5 px-4` (première colonne `px-5 sm:px-6`).
- État vide : icône dans un carré `w-12 h-12 rounded-2xl bg-blue-50 text-blue-600`, titre `text-sm font-bold`, texte `text-xs text-slate-500`, bouton d'action.

**Badge de statut** : `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border` + couleurs du tableau 2.4 + pastille `w-1.5 h-1.5 rounded-full`.

**Fenêtre (modal)** : fond `fixed inset-0 bg-black/40 backdrop-blur-xs` ; boîte `bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-md p-6` avec animation `animate-in fade-in zoom-in-95 duration-150` ; icône d'en-tête dans un carré `rounded-xl` coloré ; boutons en bas à droite séparés par `border-t border-slate-100`.

**En-tête de page (Header)** : collant en haut, `bg-surface/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5`. PC : titre + sous-titre à gauche, actions à droite. Téléphone : bouton ☰ à gauche (`p-2 rounded-xl border border-slate-200/60 bg-surface/70`), **titre centré** (`flex-1 text-center`), une action courte à droite.

**Barre latérale** : fond `bg-sidebar`, bordure droite `border-slate-200/80`. Logo « IF » (carré `w-9 h-9 rounded-xl` dégradé de marque, texte blanc extra-gras) + « IZI FACTURE » + « ÉDITION AFRIQUE » en petites capitales grises. Élément de menu actif : `bg-surface text-slate-900 font-semibold border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)]` avec icône `text-blue-600` ; inactif : `text-slate-600 hover:bg-slate-200/50`. Encadré d'info en dégradé `from-blue-50 to-indigo-50/50` bordé `border-blue-100/80`.

**Facture « papier »** : carte blanche (toujours claire), en-tête logo + coordonnées / grand titre « FACTURE » `text-3xl font-black uppercase` + badge de statut, bloc « Émetteur / Facturé à » sur fond `bg-slate-50/70`, tableau des lignes, encadré « Moyens de paiement » (virement, Wave, Orange Money, MTN MoMo), totaux à droite avec **« Total TTC » en bleu `#155dfc` très gras**, pied « Merci pour votre confiance » + signature en italique.

---

## 7. Icônes

- Bibliothèque : **lucide-react** (traits fins, style « outline »).
- Tailles : `w-4 h-4` (boutons, menus, titres de section), `w-3.5 h-3.5` (petits boutons), `w-5 h-5` (icônes de KPI et de fenêtre), `w-6 h-6` / `w-7 h-7` (états vides, confirmations).
- Couleurs : `text-blue-600` pour l'icône active ou d'en-tête de section, `text-slate-400` inactive, couleur du statut dans un carré `-50` pour les KPI.
- Icônes courantes : `LayoutDashboard`, `FileText`, `Users`, `Settings`, `Plus`, `UserPlus`, `Download`, `Eye`, `Edit`, `Trash2`, `CheckCircle2`, `Clock`, `AlertCircle`, `Receipt`, `Building2`, `Moon`, `LogOut`.

---

## 8. Mouvement et interactions

- Transitions courtes : `transition-all duration-150` (boutons) à `duration-200` (cartes) ; `transition-colors` sur les lignes et liens.
- Clic : `active:scale-95` sur les petits boutons d'icône.
- Survol des cartes : ombre légère + bordure un peu plus foncée.
- **Sur téléphone, les effets de survol s'affichent pendant l'appui du doigt** (variante `hover:` redéfinie en `:active` sur écran tactile).
- Chargement : squelettes gris animés (`bg-slate-200/70 animate-pulse rounded-xl`) et icône `Loader2 animate-spin` bleue.
- Pastille « en direct » : `animate-pulse`.

---

## 9. Responsive

- Points de rupture Tailwind : `sm` 640 px, `md` 768 px (la barre latérale apparaît), `lg` 1024 px (aperçu de facture à côté du formulaire).
- Téléphone : barre latérale en tiroir (☰), titres centrés, libellés de boutons remplacés par des icônes ou des mots courts (« Créer », « PDF »), onglets « Formulaire / Aperçu », tableaux qui défilent horizontalement avec une barre « Glissez pour voir toutes les colonnes ».
- Marges latérales : 16 px sur téléphone (`p-4`), 24 px (`sm:p-6`), 32 px (`lg:p-8`).

---

## 10. PDF des factures (couleurs RVB)

Le PDF (`lib/utils/invoice-pdf.ts`) reproduit la facture papier en A4 avec ces couleurs :
texte principal `rgb(15,23,42)`, texte secondaire `rgb(71,85,105)` / `rgb(100,116,139)`, texte discret `rgb(148,163,184)`, bordures `rgb(226,232,240)` / `rgb(241,245,249)`, fonds de blocs `rgb(248,250,252)`, bleu `rgb(37,99,235)` (logo et Total TTC), rose `rgb(225,29,72)` (échéance). Police Helvetica, marges 16 mm.

---

## 11. À faire / à ne pas faire

✅ Utiliser `bg-surface` / `bg-page` / `bg-sidebar`, les composants `Button`, `Card`, `KpiCard`, `Badge`, le `Header`.
✅ Bordures fines `slate-200/80`, coins `rounded-xl` / `rounded-2xl`, ombres très légères.
✅ Bleu `#155dfc` uniquement pour l'action principale et l'état actif.
✅ Montants via `formatFCFA()`, dates via `formatDateFR()`.
✅ Vérifier chaque écran en clair, en sombre, sur PC et sur téléphone.

❌ `bg-white`, couleurs hex en dur, noir pur, bordures épaisses ou sombres.
❌ Plusieurs couleurs d'accent concurrentes, dégradés criards.
❌ Décimales sur les montants FCFA, textes en anglais.
❌ Ajouter des `dark:` partout (la palette s'adapte seule).
