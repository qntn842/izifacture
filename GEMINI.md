# IZI FACTURE — Document de référence du projet

> **À lire en premier par tout modèle IA ou développeur qui reprend le projet.**
> Ce fichier décrit ce que fait l'application, ce qui est déjà construit, comment le code est organisé,
> les règles de design à respecter et les pièges connus.
> **Le tenir à jour** après chaque modification importante : section 11 (journal) et sections concernées.
>
> Dernière mise à jour : 20/10/2026

---

## 1. L'application en bref

**IZI FACTURE** est une application web de facturation **en français**, pour les **freelances, entrepreneurs et petites entreprises d'Afrique de l'Ouest et centrale**.

- Les montants sont en **FCFA** (XOF pour la zone UEMOA, XAF pour la CEMAC), **sans décimales** : `1 250 000 FCFA`.
- La TVA est de **18 %** par défaut, les dates au format **JJ/MM/AAAA**.
- Moyens de paiement mis en avant : virement bancaire et Mobile Money (Wave, Orange Money, MTN MoMo).

L'utilisateur peut :
- gérer ses **clients** ;
- créer des **factures** avec un aperçu en direct ;
- suivre leur **statut** (brouillon, envoyée, payée, en retard, annulée) ;
- **télécharger les factures en PDF** ;
- voir sa trésorerie sur un **tableau de bord** ;
- configurer son **entreprise** dans les Paramètres.

### Architecture : full stack avec Supabase (depuis le 20/10/2026)
- **Comptes utilisateurs** : inscription et connexion par email + mot de passe (8 caractères minimum). Toutes les pages sont protégées.
- **Données dans Supabase** (PostgreSQL) : entreprise (= Paramètres), clients, factures et leurs lignes. Plus de localStorage pour les données ; seul le choix du thème clair/sombre reste dans le navigateur.
- Projet Supabase : `aretkemjltjuimmuxmcc` (« qntn842's Project », région eu-west-2, projet de **test**).
- Choix validés par le propriétaire : **1 entreprise par compte** (table `company_members` prête pour l'équipe plus tard), **compte vide** à l'inscription, **confirmation par email DÉSACTIVÉE pour les tests** (réglage Supabase `mailer_autoconfirm = true`, demandé par le propriétaire le 20/10/2026 ; tout le code de confirmation reste en place, voir section 4 « Comptes »).
- Sécurité RLS testée avec plusieurs comptes : chacun ne voit que son entreprise ; un visiteur non connecté n'a accès à rien.

### Code source (GitHub)
- Dépôt **public** : https://github.com/qntn842/izifacture (branche `main`). Tout le dossier « IZI FACTURE » y est : `GEMINI.md`, `CLAUDE.md` et l'app `izi-facture/`.
- Les commits sont signés `qntn842 <336078167+qntn842@users.noreply.github.com>` (adresse anonyme GitHub : l'email personnel n'est pas publié).
- ⚠️ Dépôt public : **ne jamais committer de secret**. `.env.local` (clés Supabase) est exclu par les `.gitignore` ; vérifier `git diff --cached --name-only` avant chaque envoi.
- L'authentification Git se fait via le gestionnaire d'identifiants Windows (compte `qntn842`). L'outil `gh` (GitHub CLI) n'est pas installé : créer un dépôt ou une pull request se fait sur github.com.

### Historique
- Projet commencé avec **Gemini**, puis repris avec **Claude** (Claude Code) le 18/10/2026.
- Le propriétaire du projet communique **en français**. Toujours lui répondre en français, avec des explications simples et concrètes.

---

## 2. Technologies

| Domaine | Choix | Remarques |
|---|---|---|
| Framework | **Next.js 16.4** (App Router, Turbopack) | `cacheComponents: true` et `partialPrefetching: true` dans `next.config.ts`. **Version très récente : APIs différentes de Next 13/14/15** (voir section 8). |
| UI | **React 19.3**, TypeScript 5 | Presque toutes les pages sont des Client Components (`'use client'`). |
| Styles | **Tailwind CSS v4** | Configuration CSS-first : pas de `tailwind.config.js`, tout est dans `app/globals.css`. Branché via le loader `@tailwindcss/turbopack`. |
| Icônes | **lucide-react** | |
| Backend | **Supabase** (`@supabase/supabase-js` 2.118, `@supabase/ssr` 0.12.7) | Base PostgreSQL, authentification, sécurité RLS. Clés dans `izi-facture/.env.local` (non versionné). |
| PDF | **jsPDF 4.2.1** | Les factures sont « dessinées » en PDF vectoriel (`lib/utils/invoice-pdf.ts`). |
| Polices | Geist / Geist Mono (`next/font`) | ⚠️ `body` force `font-family: Arial` dans `globals.css`. C'est un reste du modèle de départ : en pratique, le texte courant s'affiche en Arial. |
| Qualité | ESLint 9 (`eslint-config-next`) | |

### Commandes (depuis `izi-facture/`)
```bash
npm run dev       # serveur de dev → http://localhost:3000
npx tsc --noEmit  # vérification TypeScript (doit passer sans erreur)
npm run lint      # ESLint
npm run build     # build de production
```

---

## 3. Structure des fichiers

```
IZI FACTURE/
├── GEMINI.md                         ← CE FICHIER (référence du projet)
├── CLAUDE.md                         ← renvoie vers ce fichier (lu automatiquement par Claude Code)
├── DESIGN.md                         ← charte graphique complète (couleurs, typo, composants) pour IA / designers
├── .agents/rules/dashboard-design-system.md   ← règles de design (copie, voir section 6)
└── izi-facture/                      ← l'application Next.js
    ├── AGENTS.md                     ← avertissement Next 16 (généré par `next dev`, ne pas supprimer)
    ├── .env.local                    ← URL + clé publique Supabase (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY)
    ├── proxy.ts                      ← protection des pages (Next 16 : remplace middleware.ts)
    ├── next.config.ts                ← cacheComponents, partialPrefetching, loader Tailwind Turbopack
    ├── supabase/migrations/          ← SQL du schéma (tables, RLS, fonctions), à appliquer dans l'ordre
    ├── types/index.ts                ← types de l'app : Invoice, InvoiceItem, Client, CompanySettings, AppUser…
    ├── types/database.ts             ← types GÉNÉRÉS depuis la base Supabase (ne pas modifier à la main)
    │
    ├── app/
    │   ├── layout.tsx                ← <html>, polices, script anti-flash du thème sombre
    │   ├── (marketing)/              ← landing page publique "/" (layout : police Plus Jakarta Sans + LandingShell)
    │   ├── globals.css               ← Tailwind, tokens de couleur, variantes hover/dark, CSS d'impression
    │   ├── dark-theme.css            ← palette du mode sombre (fichier GÉNÉRÉ, voir section 6.6)
    │   ├── (auth)/                   ← pages publiques : connexion/, inscription/ (+ layout carte centrée)
    │   ├── auth/confirm/route.ts     ← arrivée du lien de confirmation reçu par email
    │   └── (dashboard)/              ← toutes les pages de l'app (enveloppées par DashboardLayout)
    │       ├── layout.tsx
    │       ├── tableau-de-bord/page.tsx      ← tableau de bord
    │       ├── factures/page.tsx             ← liste des factures + filtres
    │       ├── factures/nouvelle/page.tsx    ← création de facture + aperçu en direct
    │       ├── factures/nouvelle/loading.tsx ← squelette de chargement (requis par use(io()))
    │       ├── factures/[id]/page.tsx        ← détail d'une facture
    │       ├── factures/[id]/modifier/page.tsx ← modification d'une facture
    │       ├── clients/page.tsx              ← gestion des clients
    │       ├── parametres/page.tsx           ← paramètres de l'entreprise (4 onglets)
    │       └── parametres/loading.tsx
    │
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardLayout.tsx   ← DataProvider + MobileMenuProvider + Sidebar + zone de contenu
    │   │   ├── Sidebar.tsx           ← navigation, Paramètres, Aide, interrupteur Mode sombre, profil
    │   │   ├── Header.tsx            ← en-tête de page standard (titre, sous-titre, actions, ☰ mobile)
    │   │   └── MobileMenuContext.tsx ← ouverture/fermeture du menu sur téléphone
    │   ├── ui/                       ← Button, Card, Badge (statut de facture)
    │   ├── dashboard/                ← KpiCard, RecentInvoicesTable
    │   ├── landing/                  ← composants de la landing page, chacun avec son .module.css (voir section 4)
    │   ├── auth/AuthFields.tsx       ← champs, erreurs et traduction des erreurs de connexion
    │   ├── auth/ResendConfirmationButton.tsx ← « Renvoyer l'email de confirmation »
    │   ├── clients/AddClientModal.tsx        ← fenêtre « Ajouter un client » (réutilisée sur 2 pages)
    │   └── invoices/
    │       ├── InvoicePaperPreview.tsx       ← la facture « papier » affichée à l'écran
    │       ├── InvoiceCreatedModal.tsx       ← fenêtre « Facture créée avec succès »
    │       └── DownloadInvoiceButton.tsx     ← bouton « Télécharger » le PDF (réutilisable)
    │
    └── lib/
        ├── context/DataContext.tsx   ← TOUTES les données + actions, lues/écrites dans Supabase
        ├── supabase/client.ts        ← client Supabase du navigateur (instance unique)
        ├── supabase/proxy.ts         ← rafraîchit la session et redirige (utilisé par proxy.ts)
        ├── theme.ts                  ← useDarkMode() / setDarkMode() (client)
        ├── theme-script.ts           ← clé localStorage + script inline anti-flash (importable côté serveur)
        └── utils/
            ├── format.ts             ← formatFCFA, formatDateFR, addDaysISO, formatLocation, getInitials, STATUS_CONFIG
            ├── invoice-number.ts     ← getNextInvoiceNumber (numérotation séquentielle)
            └── invoice-pdf.ts        ← generateInvoicePdf / downloadInvoicePdf (jsPDF)
```

---

## 4. Fonctionnalités implémentées

### Landing page — `/` (publique)
- Accessible à tous, connecté ou non (`proxy.ts` laisse passer `/`). Boutons « Connexion » → `/connexion`, « S'inscrire » / « Commencer » / offres → `/inscription`.
- Sections (un composant chacune, dans `components/landing/`) : `LandingHeader`, `Hero` (+ `FloatingCard`, `DashboardMockup`), `ProblemSection` (#probleme), `FeaturesSection` (#fonctionnalites), `HowItWorks` (#comment-ca-marche), `Testimonials` (#temoignages), `Pricing` (#tarifs + moyens de paiement), `FinalCta`, `LandingFooter`. Briques : `LandingShell`, `Container`, `Logo`, `LandingButton`, `SectionHeading`, `Avatar`, `Reveal`.
- **Styles : CSS Modules uniquement** (`*.module.css`, aucun style en ligne, pas de Tailwind), écrits **mobile first** (`min-width` 640 / 768 / 1024 / 1280 px). Les couleurs de la charte sont des variables `--lp-…` définies dans `LandingShell.module.css`. La landing reste toujours en thème clair.
- Animations : en-tête qui glisse à l'arrivée, devient compact et ombré au défilement (PC), barre de progression de lecture (CSS `animation-timeline`, navigateurs compatibles), soulignement animé + lien de la section visible ; menu mobile ☰ → ✕ avec liens en cascade ; titre en cascade + trait dessiné ; cartes flottantes ; apparitions au défilement (`Reveal`). Toutes désactivées si l'utilisateur a demandé moins d'animations (`prefers-reduced-motion`).
- ⚠️ Contenu marketing fourni par le propriétaire : les **témoignages et les offres (Gratuit / Pro 5 000 / Business 15 000 FCFA)** sont fictifs, et certaines promesses des offres ne sont **pas encore construites** (devis, relance WhatsApp, logo personnalisé, multi-utilisateurs, abonnement payant). Les sections « Pourquoi » et « Fonctionnalités » ne décrivent que des fonctions réelles.

### Comptes — `/connexion`, `/inscription`
- **Inscription** : nom de l'entreprise, votre nom, email, mot de passe (8 caractères min.). L'entreprise est créée automatiquement avec les réglages par défaut (FCFA XOF, TVA 18 %, préfixe FACT, 30 jours).
- **Confirmation par email** (⚠️ actuellement DÉSACTIVÉE pour les tests : le compte est actif tout de suite et l'utilisateur arrive directement sur le tableau de bord. Pour la réactiver : Supabase → Authentication → Sign In / Providers → Email → « Confirm email », ou `mailer_autoconfirm = false` via l'API) : quand elle est active, après l'inscription, écran « Vérifiez votre email » (+ bouton « Renvoyer l'email de confirmation »). Le lien de l'email mène à `/auth/confirm` (route `app/auth/confirm/route.ts`), qui connecte l'utilisateur et l'envoie sur un tableau de bord vide.
  - Lien ouvert sur un autre navigateur que celui de l'inscription → `/connexion?confirme=1` (« Votre adresse email est confirmée. Connectez-vous… »).
  - Lien expiré ou déjà utilisé → `/connexion?erreur=lien` avec un message.
  - Connexion avant confirmation → « Confirmez votre adresse email… » + bouton « Renvoyer ».
  - ⚠️ **Limites du service d'email gratuit de Supabase** (aucun SMTP configuré) : email **en anglais** (le modèle ne peut pas être modifié sans SMTP), **quelques emails par heure pour tout le projet**, et envoi parfois limité aux adresses des membres de l'organisation Supabase. Les adresses non délivrables (ex. `@example.com`) sont refusées. Pour de vrais utilisateurs : brancher un SMTP (Resend, Brevo…), puis traduire le modèle « Confirm signup » en pointant vers `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (déjà géré par la route).
- **Connexion** : email + mot de passe, bouton « œil » pour afficher le mot de passe, messages d'erreur en français.
- Un visiteur non connecté est renvoyé vers `/connexion?suite=<page demandée>`, puis ramené sur cette page après connexion. Un utilisateur connecté qui ouvre `/connexion` est renvoyé au tableau de bord.
- **Déconnexion** : bouton en bas de la sidebar.

### Navigation (Sidebar)
- Logo IF, recherche (**visuelle seulement**), menu : Tableau de bord, Factures (avec le nombre de factures), Clients.
- Encadré « Devise active » qui affiche la devise choisie dans les Paramètres.
- En bas : **Paramètres** (juste au-dessus d'Aide), **Aide & Support** (visuel seulement), **interrupteur Mode sombre** (fonctionnel et mémorisé), **utilisateur connecté** (initiales, nom, email) et bouton **Se déconnecter**.
- Sur téléphone, la sidebar devient un tiroir qui s'ouvre avec le bouton ☰ du Header.

### Tableau de bord — `/tableau-de-bord`
- Bannière sombre d'accueil (nom de l'entreprise et ville) avec les boutons « Créer une facture » et « Nouveau client ».
- 4 KPI : total facturé, montant encaissé, montant en attente, factures en retard.
- Barre du taux de recouvrement : encaissé, en attente, en retard.
- Tableau des dernières factures (avec un message « Aucune facture pour le moment » sur un compte neuf).

### Factures — `/factures`
- Recherche par client, email ou numéro.
- Filtres par statut avec compteurs : Toutes, Brouillons, Envoyées, Payées, En retard.
- Tableau avec les actions voir, modifier et supprimer (avec confirmation).

### Créer une facture — `/factures/nouvelle`
- Formulaire à gauche, **aperçu « papier » en direct** à droite. Sur téléphone, des onglets permettent de passer de « Formulaire » à « Aperçu ».
- Menu déroulant des clients avec l'option **« + Ajouter nouveau client »**. Elle ouvre `AddClientModal`, et le nouveau client est sélectionné automatiquement.
- **Numéro auto séquentiel**, au format `PRÉFIXE-AAAANNNN` (ex. `FACT-20260007`). Le numéro reste modifiable.
- Date d'émission = aujourd'hui. **Échéance = émission + délai de paiement** des Paramètres ; elle se recalcule si on change la date d'émission.
- Lignes de prestations (une première ligne vide ; ajouter / supprimer), remise optionnelle en %, TVA et devise prises dans les Paramètres, notes pré-remplies depuis les Paramètres.
- Erreurs affichées en haut du formulaire (client manquant, description vide, **numéro déjà utilisé**, problème de connexion). Les boutons montrent un indicateur pendant l'enregistrement.
- Deux boutons, en haut et en bas du formulaire :
  - **« Brouillon »** enregistre avec le statut `brouillon` puis ouvre la page de la facture ;
  - **« Enregistrer »** enregistre avec le statut `envoyee` puis ouvre la fenêtre **« Facture créée avec succès »**. Elle propose « Retourner aux factures » ou « Télécharger » le PDF. La croix ✕ ouvre la page de la facture.

### Détail d'une facture — `/factures/[id]`
- Boutons dans l'en-tête, dans cet ordre (choix du propriétaire) : **Toutes les factures → Supprimer → Modifier → Télécharger la facture** (bouton bleu, tout à droite ; sur mobile il affiche « PDF »).
- Bandeau avec le numéro, le statut, le total et un menu **« Changer le statut »**.
- Aperçu « papier » de la facture.
- Il n'y a plus de bouton « Imprimer », retiré à la demande du propriétaire. La règle d'impression reste dans `globals.css` : Ctrl+P n'imprime que la facture.

### Modifier une facture — `/factures/[id]/modifier`
- Même formulaire que la création, pré-rempli. Ce formulaire n'a pas encore l'option « + Ajouter nouveau client ».

### Clients — `/clients`
- 3 KPI : nombre de clients, total facturé, factures émises.
- Recherche, tableau des clients avec avatar, contact, adresse, nombre de factures et total facturé.
- Ajout via `AddClientModal`, modification, suppression avec confirmation.
- **Sur téléphone** : une barre « Glissez pour voir toutes les colonnes » avec des flèches ‹ › fait défiler le tableau de gauche à droite.

### Paramètres — `/parametres`
4 onglets à gauche. Sur mobile, ils deviennent une rangée qu'on fait défiler.
1. **Profil de l'entreprise** : nom légal\*, RC/NINEA, adresse du siège, ville, pays, email de facturation, téléphone.
2. **Régional & Devise** : devise (FCFA XOF ou XAF), TVA par défaut (%), aperçu des formats de montant et de date.
3. **Modèles de facturation** : préfixe\* (majuscules et chiffres, 10 caractères max), aperçu du prochain numéro, délai de paiement (à réception, 15, 30, 45 ou 60 jours), notes par défaut.
4. **Équipe & Accès** : affiche l'utilisateur connecté comme propriétaire ; « Inviter un membre » est désactivé avec le badge « Bientôt ».

Comment l'enregistrement fonctionne :
- Les modifications sont gardées dans un brouillon. Quand quelque chose a changé, une barre apparaît avec « Annuler » et « Enregistrer », et le bouton du header s'active.
- Un message de confirmation s'affiche après l'enregistrement.
- **Ces paramètres sont réellement utilisés** : sur la facture à l'écran et dans le PDF, dans le numéro, l'échéance, la TVA, la devise et les notes, ainsi que dans le tableau de bord et la sidebar.

### Fonctions transverses
- **PDF** : vectoriel A4, texte sélectionnable, environ 15 Ko. Les textes longs passent à la ligne et une longue facture continue sur plusieurs pages, avec l'en-tête du tableau répété. Nom du fichier : `Facture-<numéro>.pdf`.
- **Mode sombre** : sur toutes les pages, le choix est mémorisé, sans flash blanc au chargement. La facture papier reste blanche.
- **Effets au toucher** : sur téléphone, les effets `hover:` s'affichent pendant l'appui du doigt.
- **Responsive** : toutes les pages sont pensées pour le téléphone (Header centré, ☰, tableaux qui défilent).

---

## 5. Données et logique métier

### Base de données Supabase
| Table / objet | Rôle |
|---|---|
| `companies` | Paramètres de l'entreprise (= `CompanySettings`) |
| `company_members` | Lien utilisateur ↔ entreprise (`role` owner/admin/member), prêt pour l'équipe |
| `clients` | Clients de l'entreprise |
| `invoices` | Factures. Les coordonnées du client sont **copiées** dans la facture : une facture émise ne change pas si le client est modifié ou supprimé (`client_id` devient vide si le client est supprimé) |
| `invoice_items` | Lignes des factures (`position` = ordre d'affichage) |
| vue `invoices_with_status` | Factures + `is_late` **calculé** (statut `en_retard`, ou `envoyee` avec échéance dépassée) |
| fonction `save_invoice(p_invoice, p_items, p_invoice_id?)` | Crée ou modifie une facture **et** ses lignes en une seule transaction |
| déclencheur `on_auth_user_created` | Crée l'entreprise + le lien owner à l'inscription (lit `company_name` dans les métadonnées) |
| `private.is_company_member(id)` | Utilisée par toutes les règles RLS (schéma privé, non exposé par l'API) |

- **Montants en entiers** (`bigint`), TVA et remise en `numeric(5,2)`. Un numéro de facture est **unique par entreprise**.
- Le SQL complet est dans `izi-facture/supabase/migrations/` (2 fichiers, appliqués le 19/10/2026).
- **Après tout changement de schéma** : écrire une nouvelle migration dans ce dossier, l'appliquer (outil MCP `apply_migration`), **régénérer `types/database.ts`** (outil MCP `generate_typescript_types`), puis lancer l'analyse de sécurité (`get_advisors`).

### `lib/context/DataContext.tsx` : point central des données
Le hook `useData()` donne accès à :
- **données** : `user`, `invoices`, `clients`, `company`, `stats` ;
- **factures** : `addInvoice`, `updateInvoice`, `deleteInvoice`, `updateInvoiceStatus`, `getInvoice` ;
- **clients** : `addClient`, `updateClient`, `deleteClient`, `getClient` ;
- **entreprise** : `updateCompany` ;
- **compte** : `signOut`.

Fonctionnement :
- Au chargement, tout est lu depuis Supabase (entreprise, clients, factures avec leurs lignes). Pendant ce temps, un écran « Chargement de vos données… » **recouvre** la page. En cas d'échec, il affiche « Chargement impossible » avec un bouton « Réessayer ».
- ⚠️ **Les pages sont toujours rendues, même pendant le chargement** (avec des données vides sous l'écran de chargement). C'est une exigence de Next 16 (sinon erreur « Could not validate… instant navigation »). Ne pas remettre un `return <Loader/>` à la place de `{children}`.
- **Toutes les actions sont asynchrones** (`await`) et **lèvent une `Error` avec un message en français** prêt à afficher (ex. « Ce numéro de facture existe déjà… », « Impossible de joindre le serveur… »). Chaque appel doit être dans un `try/catch` et afficher l'erreur.
- La sécurité est assurée par la base (RLS) : pas besoin de filtrer par entreprise dans le code.

Données encore dans le navigateur (`localStorage`) : uniquement `izi_theme` (`'dark'` ou `'light'`). Les cookies `sb-…` contiennent la session de connexion (gérés par `@supabase/ssr`).

⚠️ Comme les données arrivent **après** le premier rendu, un composant qui initialise un `useState` à partir de `company`, `invoices` ou `clients` obtient des valeurs vides. **Utiliser le motif « valeur par défaut dérivée »** :
```ts
const [customNotes, setNotes] = useState<string | null>(null);
const notes = customNotes ?? company.default_notes ?? '';   // suit les données tant que l'utilisateur n'a rien saisi
```
C'est le même motif pour le client sélectionné, le numéro de facture, l'échéance et le brouillon des Paramètres (`draft ?? company`).

### Statuts de facture (`InvoiceStatus`)
`brouillon` · `envoyee` · `payee` · `en_retard` · `annulee`. Leurs libellés et couleurs sont dans `STATUS_CONFIG` (`lib/utils/format.ts`).
- Une facture est considérée **en retard** si `status === 'en_retard'` **ou** si `is_late === true`. `is_late` est **calculé par la base** (vue `invoices_with_status`) : une facture envoyée dont l'échéance est dépassée passe en retard automatiquement.
- Stats : les factures `annulee` sont exclues. « En attente » = statut `envoyee` et pas en retard.

### Montants
`subtotal` (somme des lignes) → `discount_amount` → `taxable_amount` → `tax_amount` (TVA) → `total`. Tous ces montants sont **arrondis à l'entier** et stockés dans la facture.

### Numérotation
`getNextInvoiceNumber(invoices, prefix, year)` cherche le plus grand numéro existant `PRÉFIXE-ANNÉE####` et ajoute 1. Comme il est **déterministe**, le serveur et le navigateur calculent le même numéro, ce qui évite les erreurs d'hydratation. La base refuse les doublons (contrainte unique) et l'app affiche alors « Ce numéro de facture existe déjà ».

---

## 6. Design system (règles à respecter)

> La charte graphique complète (codes couleur hex clair/sombre, typographie, recettes de composants) est dans **`DESIGN.md`** à la racine. Ci-dessous : l'essentiel.

### 6.1 Règle d'or
**Toute page doit reproduire le style du tableau de bord** : le même `DashboardLayout`, le même `Header`, les mêmes cartes, tableaux, badges et finitions (transitions douces, micro-animations au survol et au clic).

### 6.2 Header (`components/layout/Header.tsx`)
- **PC (`md:` et plus)** : titre `text-xl font-bold text-slate-900 tracking-tight` et sous-titre `text-xs text-slate-500` alignés à gauche ; les actions à droite ; le ☰ est caché.
- **Téléphone** : ☰ à gauche, **titre centré** (`flex-1 text-center min-w-0 px-2`, avec le même espace des deux côtés), une action courte à droite (ex. `+ Créer`).
- Si trop de boutons, le titre se tronque (« Factur… »). Garder peu d'actions sur mobile, en n'affichant que les icônes (`hidden sm:inline` sur les libellés).

### 6.3 Couleurs et tokens
| Usage | Classe |
|---|---|
| Fond de page | `bg-page` (**jamais** `bg-[#F8F9FC]`) |
| Fond de la sidebar | `bg-sidebar` |
| Cartes, header, fenêtres, menus | `bg-surface` (**jamais `bg-white`**, sinon la carte reste blanche en mode sombre) |
| Bordures | `border border-slate-200/80` (fines, jamais noires ni épaisses) |
| Séparateurs | `border-slate-100`, `divide-slate-100` |
| Primaire | `bg-blue-600 hover:bg-brand-hover active:bg-brand-active text-white` (déjà inclus dans `<Button variant="primary">`) |
| Logo / dégradé de marque | `bg-gradient-to-tr from-blue-600 to-indigo-600` |
| Bannière sombre | `bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950` + classe `theme-light` |
| Fond derrière les fenêtres | `bg-black/40 backdrop-blur-xs` |
| Texte sur fond `bg-slate-900` | `text-slate-50` (pas `text-white`, qui reste blanc en mode sombre) |

Statuts :
- Payée : emerald ;
- Envoyée / attente : amber ;
- En retard : rose ;
- Brouillon : slate ;
- Annulée : zinc.

Fond `-50`, texte `-700`, bordure `-200/80`, pastille `-500`.

### 6.4 Formes et ombres
- `rounded-2xl` : grandes cartes et conteneurs de tableaux.
- `rounded-xl` : boutons, champs, conteneurs d'icônes.
- `rounded-lg` ou `rounded-md` : petits boutons, badges.
- `rounded-full` : pastilles.
- Ombre de carte : `shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)]`.
- Survol d'une carte : `hover:shadow-md hover:border-slate-300/80 transition-all duration-200`.

### 6.5 Composants à réutiliser
- `Button` : variantes `primary | secondary | ghost | danger | outline`, tailles `sm | md | lg`, prop `icon`.
- `Card`, `KpiCard`, `Badge status=… isLate=…`.
- `AddClientModal` (`onClose`, `onCreated`).
- `DownloadInvoiceButton` (`invoice`, `company`, `label`, `compactLabel`).
- `InvoicePaperPreview`.

Champs de formulaire :
- label : `block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5` ;
- input : `w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`.

**Tableaux** (modèle : `RecentInvoicesTable`) :
- conteneur : `bg-surface rounded-2xl border border-slate-200/80 … overflow-hidden` ;
- en-têtes : `bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider` ;
- lignes : `hover:bg-slate-50/60 transition-colors` ;
- un tableau large doit pouvoir défiler sur mobile (voir `clients/page.tsx`).

### 6.6 Mode sombre : comment ça marche
- La classe `.dark` sur `<html>` est posée par `setDarkMode()` (`lib/theme.ts`) et, au chargement, par le script inline de `app/layout.tsx`.
- **La palette Tailwind est redéfinie en mode sombre** dans `app/dark-theme.css` :
  - gris `slate` / `zinc` : les nuances 50 à 300 deviennent des fonds sombres, les nuances 400 à 950 deviennent des textes clairs ;
  - couleurs : les nuances 50 à 200 deviennent des teintes transparentes, les nuances 700 à 900 deviennent des textes clairs.

  → **On écrit les classes habituelles (`text-slate-900`, `bg-blue-50`…), elles s'adaptent seules. Inutile d'ajouter `dark:` partout.**
- La classe **`theme-light`** force la palette claire sur un bloc : facture papier, bannière du tableau de bord.
- `dark-theme.css` a été **généré par un script** (palette Tailwind d'origine + correspondances). Pour ajouter une couleur (ex. `violet`), suivre le même schéma, en remettant aussi ses valeurs d'origine dans `.dark .theme-light`.
- La variante `dark:` existe quand même (`@custom-variant dark`) pour les cas particuliers.

### 6.7 Survol sur téléphone
Dans `globals.css`, `@custom-variant hover` est redéfini :
- avec une souris, l'effet s'applique à `:hover` ;
- sur écran tactile, il s'applique à `:active`, donc pendant l'appui.

Un écouteur `touchstart` vide dans `DashboardLayout` active `:active` sur iOS Safari.

### 6.8 Formats régionaux
- Montants : **toujours `formatFCFA(montant)`**, sans décimales.
- Dates : **toujours `formatDateFR(date)`**.
- Calcul de dates : `addDaysISO(iso, jours)`.

---

## 7. Décisions techniques importantes (et pourquoi)

| Décision | Raison |
|---|---|
| **PDF dessiné avec jsPDF** (`invoice-pdf.ts`) au lieu d'une capture d'écran (html-to-image, supprimé) | La capture sortait mal cadrée dans Firefox (les dates dépassaient). Le PDF vectoriel est identique partout, plus léger et son texte est sélectionnable. ⚠️ **Le PDF et `InvoicePaperPreview` sont deux rendus séparés : si on change le design de la facture, il faut modifier les deux.** |
| **Palette redéfinie pour le mode sombre** plutôt que des `dark:` partout | Environ 900 classes de couleur en dur ; une seule source de vérité ; les futures pages suivent automatiquement. |
| **`use(io())` + `loading.tsx`** sur les pages qui lisent `new Date()` pendant le rendu (`factures/nouvelle`, `parametres`) | Avec `cacheComponents`, Next 16 refuse les valeurs instables (`new Date()`, `Date.now()`) pendant le pré-rendu. `io()` vient de `next/cache` ; `loading.tsx` fournit la frontière `<Suspense>` nécessaire. |
| **Numéro de facture séquentiel et déterministe** | L'ancien numéro basé sur `Date.now()` provoquait une erreur d'hydratation (serveur ≠ navigateur) et risquait de créer des doublons. |
| **Valeurs par défaut dérivées** (`custom ?? défaut`) | Voir section 5 : les données de Supabase arrivent après le premier rendu. |
| **Supabase lu côté navigateur** (`DataContext` client) + **`proxy.ts`** pour protéger les pages | Toutes les pages étaient déjà des Client Components ; garder la même interface `useData()` a permis de passer au full stack sans réécrire les pages. La vraie sécurité est dans la base (RLS), pas dans le code. |
| **Fonction SQL `save_invoice`** | Facture + lignes enregistrées en une transaction : jamais de facture à moitié enregistrée. |
| **Coordonnées du client copiées dans la facture** | Une facture émise est un document figé : modifier ou supprimer un client ne change pas ses anciennes factures. |
| **Rechargement complet après connexion / déconnexion** (`window.location.assign`) | Repart d'un état propre (cookies de session à jour, aucune donnée de l'ancien compte en mémoire). ESLint affiche un avertissement : c'est voulu. |
| **Composants partagés** (`AddClientModal`, `DownloadInvoiceButton`) | Éviter les copies d'un même code. |
| **Paramètres en brouillon + barre « non enregistré »** | Pas d'enregistrement accidentel ; on peut annuler. |
| **Devise limitée à FCFA (XOF/XAF)** | `formatFCFA` affiche toujours « FCFA » ; proposer EUR/USD demanderait de revoir tout le formatage. |

---

## 8. Pièges connus ⚠️

1. **Next.js 16 n'est pas le Next.js habituel.** Lire `izi-facture/AGENTS.md` et la doc dans `izi-facture/node_modules/next/dist/docs/` avant d'utiliser une API de Next. Exemples : `io()` de `next/cache`, `cacheComponents`, `instant`, les erreurs « Blocking Route ».
2. **Les modifications de CSS ne sont PAS prises en compte par le serveur de dev.** C'est le cas de `globals.css` et `dark-theme.css`, à cause du loader `@tailwindcss/turbopack` et du cache disque de Turbopack. Après chaque modification de CSS :
   1. arrêter `npm run dev` ;
   2. **supprimer le dossier `izi-facture/.next`** ;
   3. relancer.

   Sinon, le navigateur continue de recevoir l'ancien CSS.
3. **N'utiliser ni `new Date()` ni `Date.now()` pendant le rendu** d'une page sans `use(io())` et sans `loading.tsx`. C'est autorisé dans les gestionnaires d'événements comme `onClick`.
4. **Hydratation** : jamais de valeur aléatoire ou dépendant de l'heure dans le HTML initial (voir le numéro de facture).
5. **Hooks qui lisent l'adresse (`usePathname`, `useParams`, `useSearchParams`) : toujours dans un `<Suspense>`.** Sur une page à adresse variable (`/factures/[id]`), Next 16 ne connaît pas l'adresse à l'avance et affiche sinon l'erreur « Blocking Route / URL data … outside of Suspense ». Solutions en place : `factures/[id]/loading.tsx` (entoure les pages détail et modifier) et `Sidebar` découpée en `Sidebar` → `<Suspense>` → `SidebarWithPathname` → `SidebarView` (le fallback affiche la barre sans menu surligné). Toute nouvelle page dynamique `[param]` doit avoir son `loading.tsx`.
6. **ESLint** : des erreurs anciennes restent. Ce sont surtout des apostrophes non échappées dans le JSX (`'` → `&apos;`) et un `setState` dans un `useEffect` (page « Modifier une facture »). `tsc` passe sans erreur.
7. Ne pas supprimer le bloc de `AGENTS.md` : `next dev` le recrée.
8. Les adresses `/auth/…` (liens reçus par email) sont laissées passer par `proxy.ts` sans redirection, connecté ou non.
9. **CSS Modules et `next.config.ts`** : la règle Turbopack qui branche Tailwind exclut les fichiers `*.module.css` (`condition: { not: { path: /\.module\.css$/ } }`). Sans cette exclusion, les classes des CSS Modules valent `undefined`. Ne pas retirer cette condition.
10. **Next 16 : `middleware.ts` est remplacé par `proxy.ts`** (fonction exportée `proxy`). La logique est dans `lib/supabase/proxy.ts`. Ne rien exécuter entre `createServerClient` et `supabase.auth.getClaims()`.
11. **Modifier `.env.local` impose de redémarrer `npm run dev`.**
12. **Ne jamais utiliser la clé `secret` / `service_role` de Supabase dans l'app** : elle contourne toute la sécurité RLS. Seule la clé publique `sb_publishable_…` va dans `.env.local`.
13. Les pages `(dashboard)` doivent toujours être rendues (voir section 5) : pas d'écran de chargement à la place de `{children}`.
14. **L'état des pages survit à la navigation** (Next 16 + Cache Components : les pages quittées sont cachées avec React `<Activity>`, pas détruites). Les `useState`, champs saisis et fenêtres ouvertes sont **retrouvés tels quels** en revenant sur la page. Pour un formulaire de création qui doit repartir de zéro après un enregistrement réussi, suivre le modèle de `factures/nouvelle/page.tsx` : un `useRef` « à réinitialiser » passé à `true` après l'enregistrement + un `useLayoutEffect` dont la fonction de nettoyage remet tous les états à zéro (doc : `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`).

---

## 9. Instructions pour un futur modèle IA

**Avant de coder**
- Lire ce fichier en entier, puis les fichiers concernés.
- Pour toute API de Next.js, vérifier dans `node_modules/next/dist/docs/` (section 8.1).

**En codant**
- Respecter le design system (section 6) : `bg-surface`, `bg-page`, `formatFCFA`, `formatDateFR`, le composant `Header`, les composants de `components/ui/`.
- Interface **100 % en français**, ton professionnel et simple, contexte africain (FCFA, Mobile Money, RCCM/NINEA).
- Toujours penser **au téléphone** (le public cible utilise beaucoup le mobile) **et au mode sombre**.
- Réutiliser les composants existants plutôt que dupliquer le code.
- Suivre le style du code existant : commentaires en français, Tailwind en ligne, composants fonctionnels.
- Toute nouvelle donnée persistante passe par **une table Supabase** (migration + RLS + types régénérés) puis par `DataContext`, avec son type d'application dans `types/index.ts`.
- Tout appel à une action de `useData()` est asynchrone : `await` + `try/catch` + message d'erreur visible + bouton en état `loading`.
- Si on modifie la facture à l'écran (`InvoicePaperPreview`), **modifier aussi le PDF** (`lib/utils/invoice-pdf.ts`), et inversement.

**Après avoir codé**
- `npx tsc --noEmit` doit passer.
- Pour une fonctionnalité liée aux données : tester avec **deux comptes** (l'un ne doit jamais voir les données de l'autre).
- **Tester dans un vrai navigateur**, sur PC (1440 px) **et** sur téléphone (390 px), en clair **et** en sombre. Pour un PDF, ouvrir le fichier généré.
- Si un fichier CSS a changé : vider `.next` et relancer le serveur (section 8.2).
- Mettre à jour **ce fichier** : fonctionnalités, structure, journal.

**Avec le propriétaire du projet**
- Lui répondre en français, simplement, en expliquant le « pourquoi ».
- Il donne souvent ses consignes avec une capture d'écran d'inspiration : reproduire le style, mais dans le design system d'IZI FACTURE.
- Il est attentif au placement exact des boutons : suivre ses demandes à la lettre, et demander en cas de doute.
- Signaler honnêtement ce qui est seulement visuel ou pas encore fonctionnel.

---

## 10. Limites actuelles et pistes pour la suite

**Seulement visuel ou pas encore fait**
- **Équipe & Accès** : la base est prête (`company_members`), mais l'invitation de collaborateurs n'est pas construite.
- **Mot de passe oublié** : pas encore de page de réinitialisation.
- **Avant une vraie mise en ligne** : configurer un service d'envoi d'emails (SMTP) et traduire l'email de confirmation, mettre l'URL du site en ligne dans Supabase (`site_url` + liste des redirections, aujourd'hui `http://localhost:3000`), activer la protection contre les mots de passe divulgués (Supabase → Auth), révoquer le jeton d'accès Supabase utilisé pendant le développement, supprimer les comptes de test.
- Recherche de la sidebar, notifications (cloche), Aide & Support et carte de profil : visuels seulement.
- Le statut « Envoyée » **n'envoie rien** : pas d'email ni de WhatsApp.
- Les icônes de téléchargement de la liste « Dernières factures » ne sont pas branchées sur le PDF.
- Le formulaire de **modification** n'a pas l'option « + Ajouter nouveau client ».
- Les **moyens de paiement** sur la facture et le PDF sont écrits en dur (piste : section « RIB / numéros Mobile Money » dans Paramètres → Modèles de facturation).
- Pas de **devis** (alors que la description du site en parle).
- Pas de logo d'entreprise personnalisable : « IF » est fixe.
- Devise : FCFA uniquement.

**Dette technique**
- Erreurs ESLint déjà présentes (section 8.6).
- `font-family: Arial` forcé sur `body` (la police Geist est chargée mais peu utilisée).
- Le formulaire « Modifier une facture » se ré-initialise si la liste des factures ou des clients change pendant la saisie (`useEffect` hérité de la version initiale).

---

## 11. Journal des modifications

| Date | Modification |
|---|---|
| avant le 18/10/2026 | Version initiale avec Gemini : tableau de bord, factures (liste, création, détail, modification), clients, design system. |
| 18/10/2026 | Reprise du projet avec Claude. |
| 19/10/2026 | Option « + Ajouter nouveau client » dans le menu déroulant de création de facture (`AddClientModal` partagé). |
| 19/10/2026 | Défilement horizontal du tableau Clients sur mobile (barre avec flèches ‹ ›). |
| 19/10/2026 | Correction de l'erreur Next « new Date() » (`use(io())` + `loading.tsx`) et de l'erreur d'hydratation → numérotation séquentielle. |
| 19/10/2026 | Effets de survol actifs à l'appui sur téléphone. |
| 19/10/2026 | Paramètres déplacé au-dessus d'Aide & Support ; **mode sombre fonctionnel** (palette redéfinie, mémorisé). |
| 19/10/2026 | **Page Paramètres** complète (4 onglets) ; paramètres utilisés dans les factures, le PDF, le tableau de bord et la sidebar. |
| 19/10/2026 | Boutons de création renommés « Brouillon » / « Enregistrer » ; fenêtre « Facture créée avec succès ». |
| 19/10/2026 | Téléchargement PDF ; détail facture : Imprimer retiré, ordre des boutons Toutes les factures → Supprimer → Modifier → Télécharger. |
| 19/10/2026 | PDF réécrit en vectoriel avec jsPDF (cadrage correct sur tous les navigateurs, multi-pages) ; devise réelle affichée sur la facture. |
| 19/10/2026 | Création de ce document de référence. |
| 19/10/2026 | **Supabase** : schéma, RLS, déclencheur d'inscription, `save_invoice`, retard automatique ; correctifs de l'analyseur de sécurité ; tests RLS avec 2 comptes. |
| 20/10/2026 | **Application full stack** : `@supabase/ssr`, `proxy.ts`, pages Connexion / Inscription, déconnexion, `DataContext` branché sur Supabase (actions asynchrones + erreurs en français), types générés (`types/database.ts`), données de démo supprimées, états vides, test complet du parcours avec 2 comptes. |
| 20/10/2026 | **Confirmation par email activée** : route `/auth/confirm`, écran « Vérifiez votre email », bouton « Renvoyer l'email », messages lien confirmé / expiré / compte non confirmé. |
| 21/10/2026 | Correction : « Nouvelle facture » réaffichait la facture précédente et sa fenêtre de succès (état conservé par Next 16). Le formulaire est maintenant remis à zéro après chaque enregistrement réussi. |
| 21/10/2026 | **Landing page** publique sur `/` : composants `components/landing/` en CSS Modules mobile first, animations de l'en-tête ; `next.config.ts` corrigé pour que les CSS Modules fonctionnent ; création de `DESIGN.md` (charte graphique). |
| 20/10/2026 | Confirmation par email **désactivée pour les tests** (à la demande du propriétaire) ; le code reste prêt pour la réactiver. |
| 20/10/2026 | **Code publié sur GitHub** : https://github.com/qntn842/izifacture (branche `main`). |
| 20/10/2026 | Correction des avertissements Next « Blocking Route » (`usePathname` dans la Sidebar, `useParams` sur `/factures/[id]`) : `<Suspense>` autour de la lecture de l'adresse + `factures/[id]/loading.tsx`. |
