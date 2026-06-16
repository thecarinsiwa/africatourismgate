# Africa Tourism Gate — Améliorations design Admin

> **Document de référence UX/UI** — suggestions par module pour l’application `apps/admin`.  
> **Mise à jour : juin 2026** — Basé sur l’état actuel du code (`packages/ui`, shell, CRUD existants).

---

## Comment utiliser ce document

1. Consultez le **tableau récapitulatif** pour choisir un livrable design (UX-1 à UX-22).
2. Copiez le **prompt détaillé** correspondant dans Cursor Agent.
3. Ouvrez la **branche PR** indiquée, implémentez, testez avec `pnpm dev:admin`.
4. Commencez par **UX-1** (fondations) — les autres livrables en dépendent en grande partie.
5. Croisez avec [roadmap-development.md](./roadmap-development.md) : certaines pages placeholder seront remplacées par de vrais CRUD — le design peut être anticipé dès maintenant.
6. Ne demandez un commit que lorsque vous êtes satisfait du résultat.

### Légende des priorités


| Priorité    | Signification                                                                   |
| ----------- | ------------------------------------------------------------------------------- |
| **Haute**   | Impact fort sur la cohérence, l’efficacité quotidienne ou la perception produit |
| **Moyenne** | Amélioration notable, implémentable module par module                           |
| **Basse**   | Polish, confort ou fonctionnalité avancée                                       |


### Prompt méta (modèle réutilisable)

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `[BRANCHE]`.

Livrable UX-[N] : [TITRE]
Références :
- apps/admin (Next.js 14, App Router)
- packages/ui, packages/config/theme.css
- docs/admin-design-improvements.md, docs/roadmap-development.md

Règles design :
- Réutiliser @africatourismgate/ui et les tokens CSS (--atg-*).
- Ne pas refactorer hors scope du livrable UX.
- Préférer composants partagés packages/ui plutôt que dupliquer dans apps/admin.
- Mode clair + sombre testés ; responsive ≤ 768px.
- Textes via next-intl (messages/fr.json, en.json) pour les nouvelles chaînes.
- Pas de commit sauf si je le demande explicitement.

[PROMPT DÉTAILLÉ]

À la fin : résumer les fichiers modifiés, les IDs de suggestion couverts (ex. H4, PA3) et comment tester (pnpm dev:admin + captures si UI).
```

---

## Tableau récapitulatif — livrables design


| #     | Phase | Livrable                                 | Priorité | Branche PR                         | Dépend de  |
| ----- | ----- | ---------------------------------------- | -------- | ---------------------------------- | ---------- |
| UX-1  | 1     | Design system — composants fondation     | Haute    | `feature/admin-ui-foundation`      | —          |
| UX-2  | 1     | Thème — tokens sémantiques & typographie | Haute    | `feature/admin-ui-theme-tokens`    | UX-1       |
| UX-3  | 2     | Shell, navigation & layout               | Haute    | `feature/admin-ui-shell`           | UX-1       |
| UX-4  | 2     | Authentification (login / register)      | Moyenne  | `feature/admin-ui-auth`            | UX-1       |
| UX-5  | 2     | Tableau de bord                          | Haute    | `feature/admin-ui-dashboard`       | UX-1, UX-2 |
| UX-6  | 3     | Utilisateurs & auth (nav)                | Haute    | `feature/admin-ui-users`           | UX-1       |
| UX-7  | 3     | Fidélité                                 | Moyenne  | `feature/admin-ui-loyalty`         | UX-1       |
| UX-8  | 4     | Hébergements                             | Haute    | `feature/admin-ui-accommodations`  | UX-1, UX-3 |
| UX-9  | 4     | Vols                                     | Moyenne  | `feature/admin-ui-flights`         | UX-1, UX-8 |
| UX-10 | 4     | Locations véhicules                      | Moyenne  | `feature/admin-ui-vehicles`        | UX-1       |
| UX-11 | 4     | Croisières                               | Moyenne  | `feature/admin-ui-cruises`         | UX-1, UX-3 |
| UX-12 | 4     | Activités & tours                        | Moyenne  | `feature/admin-ui-activities`      | UX-1       |
| UX-13 | 4     | Forfaits                                 | Moyenne  | `feature/admin-ui-packages`        | UX-1       |
| UX-14 | 4     | Destinations                             | Moyenne  | `feature/admin-ui-destinations`    | UX-1       |
| UX-15 | 3     | Réservations                             | Haute    | `feature/admin-ui-bookings`        | UX-1       |
| UX-16 | 3     | Paiements (codes promo, promotions)      | Haute    | `feature/admin-ui-payments`        | UX-1       |
| UX-17 | 3     | Contenu & support (avis, tickets)        | Haute    | `feature/admin-ui-content-support` | UX-1       |
| UX-18 | 3     | Organisations                            | Moyenne  | `feature/admin-ui-organizations`   | UX-1       |
| UX-19 | 3     | Rôles & RBAC                             | Moyenne  | `feature/admin-ui-rbac`            | UX-1       |
| UX-20 | 3     | Paramètres organisation                  | Haute    | `feature/admin-ui-settings`        | UX-1, UX-3 |
| UX-21 | 5     | Pages placeholder & empty states         | Moyenne  | `feature/admin-ui-empty-states`    | UX-1       |
| UX-22 | 5     | Mobile, responsive & polish global       | Moyenne  | `feature/admin-ui-mobile-polish`   | UX-1       |


### Phases


| Phase | Objectif                                           |
| ----- | -------------------------------------------------- |
| **1** | Design system & tokens                             |
| **2** | Shell, auth, dashboard                             |
| **3** | Modules opérationnels (users, bookings, payments…) |
| **4** | Catalogue voyage (verticals)                       |
| **5** | Empty states, mobile, finitions                    |


### Ordre d'exécution recommandé

```
UX-1 → UX-2 → UX-3 → UX-5 → UX-15 → UX-16 → UX-6 → UX-8
              ↘ UX-4                    ↘ UX-17
UX-1 → UX-9, UX-10, UX-11, UX-12, UX-13, UX-14 (parallèle après UX-8)
UX-20 → UX-21 → UX-22
```

---

## Conventions de branches PR

- Préfixe : `feature/admin-ui-*`
- Une PR = un livrable UX testable visuellement
- Titre PR exemple : `[UX-8] Admin design: accommodations tabs & availability calendar`
- Corps PR : résumé + IDs suggestion couverts + plan de test + captures avant/après

---

## État actuel (synthèse)


| Aspect                     | État | Observation                                                                                                        |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| Design system              | ⚠️   | Tokens CSS (`theme.css`), `Card`, `Button`, `Input`, `DataTable` — pas de `Select`, `Modal`, `Toast`, `Breadcrumb` |
| Shell & navigation         | ✅    | Sidebar groupée, thème clair/sombre, branding org dynamique                                                        |
| Pages liste (CRUD)         | ⚠️   | Pattern répétitif mais homogène ; filtres natifs `<select>`                                                        |
| Pages détail / formulaires | ⚠️   | Champs empilés, peu de structure visuelle, chargement texte seul                                                   |
| Tableau de bord            | ⚠️   | KPIs fonctionnels, graphiques absents                                                                              |
| Auth                       | ✅    | Carte avec accent, cohérent avec le web                                                                            |
| i18n                       | ⚠️   | Nav + auth traduits ; KPIs, labels métier souvent en dur (FR)                                                      |
| Feedback utilisateur       | ❌    | `window.confirm` pour suppressions, pas de toasts                                                                  |
| Mobile                     | ⚠️   | Menu latéral OK ; tableaux larges peu optimisés                                                                    |


---

## Fondations transverses

> **Livrables : UX-1, UX-2**

Ces améliorations bénéficient à **tous** les modules. À traiter en priorité dans `packages/ui`.

**Branche UX-1 :** `feature/admin-ui-foundation`  
**Branche UX-2 :** `feature/admin-ui-theme-tokens`

### 1. Composants manquants du design system


| Composant               | Priorité    | Description                                                                                                       |
| ----------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `PageHeader`            | **Haute**   | Titre (`h1`), description, slot actions (CTA), slot breadcrumb — remplace le bloc dupliqué dans chaque `page.tsx` |
| `Breadcrumb`            | **Haute**   | Fil d’Ariane pour les pages imbriquées (ex. Croisières → Navire → Itinéraire)                                     |
| `Select`                | **Haute**   | Remplace les `<select>` natifs des listes (hébergements, réservations, paiements…)                                |
| `Modal` / `AlertDialog` | **Haute**   | Confirmation de suppression, remboursement, modération avis                                                       |
| `Toast`                 | **Haute**   | Retour succès/erreur après create/update/delete (au lieu de `<p role="alert">` isolés)                            |
| `Tabs`                  | **Moyenne** | Fiches détail multi-sections (vol + classes, hébergement + chambres, utilisateur + rôles)                         |
| `Skeleton`              | **Moyenne** | États de chargement des pages détail (aujourd’hui : « Chargement… »)                                              |
| `EmptyState`            | **Moyenne** | Illustration + titre + CTA pour listes vides hors table                                                           |
| `FilterBar`             | **Moyenne** | Barre de filtres repliable avec compteur de filtres actifs                                                        |
| `StatCard`              | **Moyenne** | Extraction des KPI dashboard en composant réutilisable (icône, delta, lien)                                       |


**Fichiers de référence actuels :**

- En-têtes dupliqués : `apps/admin/app/(dashboard)/hebergements/page.tsx`, `utilisateurs/page.tsx`, etc.
- Select natif : `apps/admin/components/properties/properties-list.tsx` (l.193–207)
- Confirm natif : `properties-list.tsx` (l.101)

### 2. Typographie & espacement (UX-2)


| Suggestion                      | Priorité    | Détail                                                                                                                 |
| ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Échelle typographique unifiée   | **Moyenne** | `text-2xl font-bold` pour h1 page, `text-lg font-semibold` pour h2 section, `text-sm text-atg-muted` pour descriptions |
| Conteneur max-width formulaires | **Moyenne** | Formulaires longs : `max-w-2xl` ou layout 2 colonnes sur `lg:`                                                         |
| Espacement vertical             | **Basse**   | Standardiser `space-y-6` (listes) et `space-y-8` (dashboard)                                                           |


### 3. Couleurs & thème (UX-2)


| Suggestion               | Priorité    | Détail                                                                                                 |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| Palette sémantique       | **Haute**   | Tokens `--atg-success`, `--atg-warning`, `--atg-danger`, `--atg-info` dans `packages/config/theme.css` |
| KPIs différenciés        | **Moyenne** | Couleurs d’icône distinctes par métrique — `dashboard-kpi-cards.tsx`                                   |
| Contraste sidebar active | **Basse**   | Lien actif `bg-primary text-white` : test WCAG avec couleur org personnalisée                          |


### 4. Patterns de page recommandés

```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumb › Module › Détail                            │
├─────────────────────────────────────────────────────────┤
│ Titre page                          [Action principale] │
│ Description courte                                      │
├─────────────────────────────────────────────────────────┤
│ [Filtres / onglets]                                     │
├─────────────────────────────────────────────────────────┤
│ Card (DataTable | Form sections | Contenu)              │
└─────────────────────────────────────────────────────────┘
```

---

## Module : Shell, navigation & layout

> **Livrable : UX-3** — **Branche :** `feature/admin-ui-shell`

**Fichiers :** `packages/ui/src/components/dashboard-shell.tsx`, `sidebar.tsx`, `app-header.tsx`, `apps/admin/components/dashboard-shell-layout.tsx`


| #   | Suggestion                   | Priorité    | Détail                                                                              |
| --- | ---------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| S1  | Fil d’Ariane dans le header  | **Haute**   | Afficher le chemin courant à côté du bouton menu (mobile) ou sous le logo (desktop) |
| S2  | Titre de page contextuel     | **Moyenne** | Propager le titre de la page active dans `AppHeader`                                |
| S3  | Indicateur de section active | **Moyenne** | Barre verticale ou pastille sur le groupe sidebar ouvert                            |
| S4  | Raccourci recherche globale  | **Basse**   | `Cmd+K` — recherche cross-modules                                                   |
| S5  | Badge compteur nav           | **Basse**   | Ex. tickets support en attente, avis à modérer                                      |
| S6  | Sidebar compacte             | **Basse**   | Mode icônes seules sur `xl:`                                                        |
| S7  | Pied de sidebar              | **Basse**   | Version app + lien documentation / support                                          |


---

## Module : Authentification

> **Livrable : UX-4** — **Branche :** `feature/admin-ui-auth`

**Fichiers :** `apps/admin/components/auth/login-page-content.tsx`, `auth-page-shell.tsx`, `admin-login-form.tsx`


| #   | Suggestion                     | Priorité    | Détail                                            |
| --- | ------------------------------ | ----------- | ------------------------------------------------- |
| A1  | Illustration ou visuel latéral | **Moyenne** | Split layout desktop : formulaire + visuel travel |
| A2  | Logo org sur login             | **Moyenne** | Logo partenaire si org connue                     |
| A3  | États de chargement bouton     | **Basse**   | Spinner dans le bouton submit                     |
| A4  | Message d’erreur inline        | **Basse**   | Encadré rouge discret sous le formulaire          |


---

## Module : Tableau de bord

> **Livrable : UX-5** — **Branche :** `feature/admin-ui-dashboard`

**Fichiers :** `apps/admin/app/(dashboard)/dashboard/page.tsx`, `dashboard-kpi-cards.tsx`, etc.


| #   | Suggestion                       | Priorité    | Détail                                                   |
| --- | -------------------------------- | ----------- | -------------------------------------------------------- |
| D1  | Graphiques tendance              | **Haute**   | Courbes ou barres : réservations / revenus 7 ou 30 jours |
| D2  | KPIs avec variation              | **Moyenne** | Badge « +12 % vs mois dernier »                          |
| D3  | Skeleton KPI                     | **Moyenne** | Pulse animé au lieu du tiret « — »                       |
| D4  | Actions rapides personnalisables | **Basse**   | Basées sur permissions RBAC                              |
| D5  | Fil d’activité récente           | **Moyenne** | Timeline unifiée                                         |
| D6  | Sélecteur de période             | **Moyenne** | Filtre 7j / 30j / 90j                                    |
| D7  | Message d’accueil                | **Basse**   | « Bonjour, {prénom} »                                    |


---

## Module : Utilisateurs & authentification (nav)

> **Livrable : UX-6** — **Branche :** `feature/admin-ui-users`

**Routes :** `/utilisateurs`, `/utilisateurs/employes`, adresses, moyens-paiement, sessions, journaux-securite


| #   | Suggestion                   | Priorité    | Détail                                                    |
| --- | ---------------------------- | ----------- | --------------------------------------------------------- |
| U1  | Avatar + initiales           | **Haute**   | Colonne utilisateur avec cercle coloré                    |
| U2  | Fiche utilisateur en onglets | **Haute**   | Profil | Adresses | Moyens de paiement | Sessions | Rôles |
| U3  | Badge statut compte          | **Moyenne** | Actif / suspendu / non vérifié                            |
| U4  | Filtres chips                | **Moyenne** | Organisation, statut, rôle                                |
| U5  | Export CSV                   | **Basse**   | Bouton secondaire                                         |
| U6  | Journaux sécurité            | **Moyenne** | Timeline avec icônes par type d’événement                 |
| U7  | Sessions actives             | **Moyenne** | Carte par session + bouton Révoquer                       |
| U8  | Lien croisé employé → org    | **Basse**   | Chip cliquable                                            |


---

## Module : Fidélité

> **Livrable : UX-7** — **Branche :** `feature/admin-ui-loyalty`


| #   | Suggestion                 | Priorité    | Détail                           |
| --- | -------------------------- | ----------- | -------------------------------- |
| F1  | Carte résumé points        | **Moyenne** | Solde + barre progression palier |
| F2  | Historique transactions    | **Moyenne** | Drawer ou section expandable     |
| F3  | Filtre par programme / org | **Basse**   | Multi-programmes                 |


---

## Module : Hébergements

> **Livrable : UX-8** — **Branche :** `feature/admin-ui-accommodations`


| #   | Suggestion                  | Priorité    | Détail                                                 |
| --- | --------------------------- | ----------- | ------------------------------------------------------ |
| H1  | Vignette propriété          | **Haute**   | Colonne image dans la liste                            |
| H2  | Fiche en onglets            | **Haute**   | Informations | Chambres | Équipements | Disponibilités |
| H3  | Formulaire sectionné        | **Moyenne** | Cards Identité / Localisation / Classification         |
| H4  | Grille disponibilités       | **Haute**   | Calendrier mensuel visuel avec couleurs occupation     |
| H5  | Édition bulk disponibilités | **Moyenne** | Assistant pas-à-pas                                    |
| H6  | Équipements                 | **Moyenne** | Grille icônes + labels                                 |
| H7  | Étoiles visuelles           | **Basse**   | Rating stars                                           |
| H8  | Carte destination           | **Basse**   | Mini-map ou lien fiche                                 |


---

## Module : Vols

> **Livrable : UX-9** — **Branche :** `feature/admin-ui-flights`


| #   | Suggestion                    | Priorité    | Détail                                   |
| --- | ----------------------------- | ----------- | ---------------------------------------- |
| V1  | Timeline vol                  | **Haute**   | Départ → durée → arrivée, codes IATA     |
| V2  | Classes en cards              | **Moyenne** | Economy, Business… avec capacité et prix |
| V3  | Grille disponibilités classes | **Moyenne** | Pattern calendrier hébergements          |
| V4  | Pages référentiel             | **Moyenne** | Compagnies / aéroports : logos, drapeaux |
| V5  | Badge statut vol              | **Basse**   | Actif / suspendu / complet               |


---

## Module : Locations véhicules

> **Livrable : UX-10** — **Branche :** `feature/admin-ui-vehicles`


| #   | Suggestion           | Priorité    | Détail                      |
| --- | -------------------- | ----------- | --------------------------- |
| L1  | Photo véhicule       | **Haute**   | Thumbnail liste             |
| L2  | Fiche véhicule       | **Moyenne** | Specs en grille avec icônes |
| L3  | Agences sur carte    | **Basse**   | Pin map GPS                 |
| L4  | Catégories visuelles | **Moyenne** | Icône par catégorie         |


---

## Module : Croisières

> **Livrable : UX-11** — **Branche :** `feature/admin-ui-cruises`


| #   | Suggestion              | Priorité    | Détail                                 |
| --- | ----------------------- | ----------- | -------------------------------------- |
| C1  | Navigation hiérarchique | **Haute**   | Breadcrumb Ligne › Navire › Itinéraire |
| C2  | Schéma itinéraire       | **Haute**   | Timeline ports avec escales            |
| C3  | Cabines                 | **Moyenne** | Cards par type de cabine               |
| C4  | Sailings calendar       | **Moyenne** | Vue calendrier départs                 |
| C5  | Ports                   | **Basse**   | Drapeau pays + fuseau                  |


---

## Module : Activités & tours

> **Livrable : UX-12** — **Branche :** `feature/admin-ui-activities`


| #   | Suggestion         | Priorité    | Détail                    |
| --- | ------------------ | ----------- | ------------------------- |
| AC1 | Galerie photos     | **Haute**   | Carrousel ou grille fiche |
| AC2 | Durée & difficulté | **Moyenne** | Badges visuels            |
| AC3 | Fournisseurs       | **Moyenne** | Logo + note moyenne       |
| AC4 | Créneaux horaires  | **Moyenne** | Timeline slots            |


---

## Module : Forfaits

> **Livrable : UX-13** — **Branche :** `feature/admin-ui-packages`


| #   | Suggestion           | Priorité    | Détail                           |
| --- | -------------------- | ----------- | -------------------------------- |
| P1  | Composition visuelle | **Haute**   | Icônes par type produit inclus   |
| P2  | Prix package         | **Moyenne** | Composants vs forfait + économie |
| P3  | Preview client       | **Basse**   | Aperçu carte web                 |


---

## Module : Destinations

> **Livrable : UX-14** — **Branche :** `feature/admin-ui-destinations`


| #   | Suggestion        | Priorité    | Détail                                      |
| --- | ----------------- | ----------- | ------------------------------------------- |
| DE1 | Hero image        | **Haute**   | Bandeau image + nom                         |
| DE2 | Compteurs liés    | **Moyenne** | Hébergements, activités, forfaits rattachés |
| DE3 | Carte interactive | **Basse**   | Pin géographique éditable                   |


---

## Module : Réservations

> **Livrable : UX-15** — **Branche :** `feature/admin-ui-bookings`


| #   | Suggestion            | Priorité    | Détail                                 |
| --- | --------------------- | ----------- | -------------------------------------- |
| R1  | Panneau filtres       | **Haute**   | Drawer ou barre repliable (5+ filtres) |
| R2  | Fiche réservation     | **Haute**   | Layout 2 colonnes + timeline statuts   |
| R3  | Timeline statuts      | **Moyenne** | draft → pending → confirmed            |
| R4  | Lignes réservation    | **Moyenne** | Icône type produit + lien catalogue    |
| R5  | Actions contextuelles | **Moyenne** | Annuler, rembourser — modales          |
| R6  | Export / impression   | **Basse**   | PDF confirmation                       |


---

## Module : Paiements

> **Livrable : UX-16** — **Branche :** `feature/admin-ui-payments`


| #   | Suggestion                | Priorité    | Détail                                          |
| --- | ------------------------- | ----------- | ----------------------------------------------- |
| PA1 | Montants alignés à droite | **Moyenne** | `tabular-nums`                                  |
| PA2 | Détail paiement           | **Haute**   | Drawer Stripe IDs, remboursements, lien booking |
| PA3 | Remboursement             | **Haute**   | Modal montant partiel/total + raison            |
| PA4 | Codes promo               | **Moyenne** | Badge type, validité, usage count               |
| PA5 | Promotions                | **Moyenne** | Bandeau preview                                 |
| PA6 | Graphique revenus         | **Basse**   | Mini sparkline en-tête                          |


---

## Module : Contenu & support

> **Livrable : UX-17** — **Branche :** `feature/admin-ui-content-support`


| #   | Suggestion                | Priorité    | Détail                               |
| --- | ------------------------- | ----------- | ------------------------------------ |
| CO1 | Modération avis           | **Haute**   | Layout conversation + actions sticky |
| CO2 | File d’attente modération | **Moyenne** | Preview + actions rapides            |
| CO3 | Tickets support           | **Haute**   | Style inbox : statut, priorité, SLA  |
| CO4 | Messages                  | **Moyenne** | Thread chat bulles                   |
| CO5 | Placeholder pages         | **Haute**   | Empty states illustrés + CTA         |


---

## Module : Organisations

> **Livrable : UX-18** — **Branche :** `feature/admin-ui-organizations`


| #   | Suggestion         | Priorité    | Détail                                    |
| --- | ------------------ | ----------- | ----------------------------------------- |
| O1  | Carte organisation | **Moyenne** | Logo, stats utilisateurs / produits       |
| O2  | Vue détail         | **Moyenne** | Onglets Infos | Utilisateurs | Paramètres |
| O3  | Hiérarchie         | **Basse**   | Arbre parent/enfant                       |


---

## Module : Système — Rôles & RBAC

> **Livrable : UX-19** — **Branche :** `feature/admin-ui-rbac`


| #   | Suggestion          | Priorité    | Détail                           |
| --- | ------------------- | ----------- | -------------------------------- |
| RB1 | Matrice permissions | **Haute**   | Grille rôles × permissions       |
| RB2 | Assignations        | **Moyenne** | Recherche user + chips rôles     |
| RB3 | Audit logs          | **Moyenne** | Filtres + lignes expandable JSON |
| RB4 | Couleurs rôles      | **Basse**   | Badge couleur par rôle           |


---

## Module : Paramètres organisation

> **Livrable : UX-20** — **Branche :** `feature/admin-ui-settings`


| #   | Suggestion            | Priorité    | Détail                          |
| --- | --------------------- | ----------- | ------------------------------- |
| PM1 | Sous-nav latérale     | **Moyenne** | Vertical tabs sticky            |
| PM2 | Preview branding live | **Haute**   | Split formulaire + mini-preview |
| PM3 | Palette couleurs      | ✅ partiel   | Contrast checker automatique    |
| PM4 | Comptes bancaires     | **Moyenne** | Masquage IBAN                   |
| PM5 | Templates email       | **Moyenne** | Preview HTML iframe             |
| PM6 | Sauvegarde            | **Haute**   | Barre sticky « non enregistré » |


---

## Module : Pages placeholder

> **Livrable : UX-21** — **Branche :** `feature/admin-ui-empty-states`


| #   | Suggestion        | Priorité    | Détail                               |
| --- | ----------------- | ----------- | ------------------------------------ |
| PL1 | Empty state riche | **Haute**   | Illustration SVG + CTA               |
| PL2 | Cohérence         | **Moyenne** | Même `PageHeader` que modules actifs |


---

## Module : Mobile & polish global

> **Livrable : UX-22** — **Branche :** `feature/admin-ui-mobile-polish`


| #   | Suggestion          | Priorité    | Détail                                    |
| --- | ------------------- | ----------- | ----------------------------------------- |
| M1  | Tables responsives  | **Haute**   | Colonnes prioritaires + expand row mobile |
| M2  | i18n chaînes design | **Moyenne** | KPIs, labels métier via next-intl         |
| M3  | Raccourcis clavier  | **Basse**   | Navigation, recherche                     |
| M4  | Export CSV global   | **Basse**   | Pattern réutilisable listes               |


---

## Checklist qualité par PR design

- [ ] Utilise `PageHeader` (ou pattern documenté)
- [ ] Pas de `<select>` natif sans style
- [ ] Confirmations destructives via `AlertDialog`
- [ ] Succès/erreur via `Toast`
- [ ] États loading : skeleton ou spinner bouton
- [ ] États vides : message + CTA si applicable
- [ ] Contraste vérifié clair + sombre
- [ ] Responsive testé ≤ 768px
- [ ] Textes via clés i18n (`messages/fr.json`, `en.json`)

---

## Prompts détaillés (copier-coller dans Cursor Agent)

### UX-1 — Design system — composants fondation

**Branche :** `feature/admin-ui-foundation`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-foundation`.

Livrable UX-1 : Design system — composants fondation
Références :
- packages/ui/src/components/ (Card, Button, Input, DataTable existants)
- packages/ui/src/index.tsx (exports)
- apps/admin/components/properties/properties-list.tsx (select natif, confirm natif)
- docs/admin-design-improvements.md

Créer dans packages/ui et exporter :
1. PageHeader — title, description, actions slot, breadcrumb slot
2. Breadcrumb — items { label, href? }, séparateur ›
3. Select — styled, accessible, même API que native (value, onChange, options, label)
4. AlertDialog — title, description, confirm/cancel, variant danger
5. Modal — overlay, focus trap, Escape pour fermer
6. Toast — provider + hook useToast ; variants success/error/info ; aria-live

Migrer UNE liste pilote (hebergements) :
- Remplacer <select> destination par Select
- Remplacer window.confirm delete par AlertDialog
- Afficher toast succès/erreur après delete
- Utiliser PageHeader dans apps/admin/app/(dashboard)/hebergements/page.tsx

Critères :
- Composants documentés via props TypeScript
- Mode clair + sombre OK
- Focus visible et labels accessibles
- Pas de régression sur les autres pages admin

À la fin : fichiers modifiés + test pnpm dev:admin sur /hebergements.
```

### UX-2 — Thème — tokens sémantiques & typographie

**Branche :** `feature/admin-ui-theme-tokens`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-theme-tokens`.

Livrable UX-2 : Thème — tokens sémantiques & typographie
Références :
- packages/config/theme.css
- packages/ui/src/components/data-table-badge.tsx
- tailwind preset si présent dans packages/config

Ajouter tokens CSS :
- --atg-success, --atg-warning, --atg-danger, --atg-info (+ variantes hover/light)
- Exposer via classes Tailwind (atg-success, etc.) si config tailwind partagée

Mettre à jour DataTableBadge pour utiliser les tokens sémantiques.
Documenter échelle typo admin (h1 page, h2 section, description) en commentaire theme.css ou README packages/ui.

Optionnel : différencier couleurs icônes KPI dans dashboard-kpi-cards.tsx (users=bleu, bookings=violet, revenue=vert, properties=orange).

Critères :
- Badges success/warning/danger cohérents clair/sombre
- Contraste WCAG AA minimum sur textes badge

À la fin : fichiers modifiés + capture dashboard + liste hébergements avec badges.
```

### UX-3 — Shell, navigation & layout

**Branche :** `feature/admin-ui-shell`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-shell`.

Livrable UX-3 : Shell, navigation & layout
Références :
- packages/ui/src/components/dashboard-shell.tsx, sidebar.tsx, app-header.tsx
- apps/admin/components/dashboard-shell-layout.tsx
- apps/admin/config/dashboard-nav.config.ts
- UX-1 : PageHeader, Breadcrumb

Améliorer le shell admin :
- S1 : Intégrer Breadcrumb dans AppHeader ou zone sous header (configurable par page)
- S2 : Prop title optionnelle dans DashboardShell / AppHeader
- S3 : Indicateur visuel sur groupe sidebar actif (barre latérale primary)
- Helper apps/admin/lib/breadcrumb-from-path.ts — génère crumbs depuis pathname + nav config

Migrer 2 pages imbriquées en exemple :
- /produits/croisieres/navires/[shipId]
- /hebergements/[id]

Critères :
- Breadcrumb correct sur pages profondes
- Mobile : breadcrumb tronqué avec ellipsis si trop long
- Sidebar : groupe actif identifiable

À la fin : fichiers modifiés + test navigation desktop/mobile.
```

### UX-4 — Authentification (login / register)

**Branche :** `feature/admin-ui-auth`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-auth`.

Livrable UX-4 : Authentification — polish design
Références :
- apps/admin/components/auth/login-page-content.tsx, auth-page-shell.tsx
- apps/admin/components/admin-login-form.tsx
- apps/web (inspiration split layout marketing)

Améliorations :
- A1 : AuthPageShell split lg: — formulaire gauche, panneau visuel droit (gradient + motif Afrique, sans image externe obligatoire)
- A2 : Si branding org disponible (session/future), afficher logoUrl sur login
- A3 : État loading sur bouton submit AdminLoginForm
- A4 : Encadré alerte erreur (border red + bg red/5) sous le formulaire

Critères :
- Responsive : split uniquement ≥ lg, stack mobile
- i18n : nouvelles chaînes dans messages/fr.json et en.json
- Pas de régression auth JWT

À la fin : fichiers modifiés + captures login clair/sombre.
```

### UX-5 — Tableau de bord

**Branche :** `feature/admin-ui-dashboard`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-dashboard`.

Livrable UX-5 : Tableau de bord — design enrichi
Références :
- apps/admin/app/(dashboard)/dashboard/page.tsx
- apps/admin/components/dashboard-kpi-cards.tsx, dashboard-user-stats.tsx, dashboard-platform-overview.tsx
- apps/admin/config/dashboard-kpi.ts
- UX-1 : StatCard, Skeleton ; UX-2 : tokens couleur KPI

Implémenter :
- D1 : Graphique tendance (recharts ou SVG léger) — réservations et/ou revenus 30j ; données via API existantes ou agrégation client
- D3 : Skeleton pulse sur KPI cards pendant chargement
- D6 : Sélecteur période 7j/30j/90j en PageHeader dashboard
- D7 : Message « Bonjour, {firstName} » dans header page
- Extraire StatCard réutilisable depuis KPI cards

Si API manquante pour séries temporelles : mock raisonnable + TODO commenté, ou endpoint minimal GET /dashboard/stats?period=30d (hors scope API → documenter).

Critères :
- Dashboard reste performant (pas de waterfall requests)
- Graphique lisible clair/sombre
- i18n périodes et labels

À la fin : fichiers modifiés + capture dashboard avec données seed.
```

### UX-6 — Utilisateurs & auth (nav)

**Branche :** `feature/admin-ui-users`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-users`.

Livrable UX-6 : Utilisateurs — design
Références :
- apps/admin/components/users/users-list.tsx
- apps/admin/app/(dashboard)/utilisateurs/[id]/page.tsx
- apps/admin/components/employees/
- UX-1 : Tabs, PageHeader, Select, Avatar (créer Avatar dans ui si absent)

Implémenter :
- U1 : Composant Avatar (initiales, couleur hash email) — colonne users-list
- U2 : Fiche /utilisateurs/[id] en Tabs : Profil | Adresses | Moyens paiement | Sessions | Rôles (contenu existant ou liens intégrés)
- U3 : DataTableBadge statut compte
- U4 : FilterBar organisation/statut/rôle sur users-list
- U6/U7 : Améliorer visuel sessions et journaux (timeline ou cards)

Critères :
- Tabs accessible (clavier)
- Fiche utilisateur évite navigation dispersée dans sidebar
- Listes employés : avatar cohérent

À la fin : fichiers modifiés + test /utilisateurs et fiche détail.
```

### UX-7 — Fidélité

**Branche :** `feature/admin-ui-loyalty`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-loyalty`.

Livrable UX-7 : Fidélité — design
Références :
- apps/admin/components/loyalty/loyalty-accounts-list.tsx
- apps/admin/app/(dashboard)/fidelite/comptes/page.tsx
- UX-1 : PageHeader, EmptyState

Implémenter :
- F1 : Carte résumé points en tête de liste ou colonne accentuée (solde + barre progression)
- F2 : Section expandable ou drawer historique transactions par compte (si API dispo ; sinon placeholder structuré)
- PageHeader + EmptyState si liste vide

Critères :
- Montants/points en tabular-nums
- Cohérent avec pattern listes CRUD admin

À la fin : fichiers modifiés + test /fidelite/comptes.
```

### UX-8 — Hébergements

**Branche :** `feature/admin-ui-accommodations`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-accommodations`.

Livrable UX-8 : Hébergements — design
Références :
- apps/admin/components/properties/ (properties-list, property-form, room-availability-grid)
- apps/admin/components/amenities/
- UX-1 : Tabs, PageHeader ; UX-3 : Breadcrumb

Implémenter :
- H1 : Colonne thumbnail (placeholder gradient + icône maison si pas d’image)
- H2 : Fiche /hebergements/[id] en Tabs : Infos | Chambres | Équipements | Disponibilités
- H3 : property-form sectionné en Cards
- H4 : room-availability-grid — calendrier mensuel coloré (occupation), navigation mois améliorée
- H6 : amenities-list en grille icônes
- H7 : Star rating input visuel (optionnel)

Critères :
- Grille dispo utilisable au clavier
- Breadcrumb : Hébergements › {nom propriété}
- Toasts sur save dispo

À la fin : fichiers modifiés + captures liste, fiche, grille dispo.
```

### UX-9 — Vols

**Branche :** `feature/admin-ui-flights`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-flights`.

Livrable UX-9 : Vols — design
Références :
- apps/admin/components/flights/ (flights-list, flight-edit-page, flight-classes-section, airports-list, airlines-list)
- UX-8 : pattern Tabs et calendrier dispo

Implémenter :
- V1 : Composant FlightTimeline — aéroport départ, durée, arrivée, codes IATA en badges
- V2 : flight-classes-section en cards grid
- V3 : Réutiliser pattern calendrier UX-8 pour flight-class-availability
- V4 : airlines/airports — colonne logo/drapeau placeholder, recherche unifiée

Critères :
- flight-edit-page utilise Tabs : Vol | Classes
- Timeline lisible mobile (stack vertical)

À la fin : fichiers modifiés + test /produits/vols et fiche vol.
```

### UX-10 — Locations véhicules

**Branche :** `feature/admin-ui-vehicles`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-vehicles`.

Livrable UX-10 : Locations véhicules — design
Références :
- apps/admin/components/locations/ (vehicles-list, vehicle-edit-page, rental-agencies-list, categories)
- UX-8 : pattern liste thumbnail

Implémenter :
- L1 : Thumbnail véhicule dans liste
- L2 : Fiche véhicule — grille specs (places, transmission, carburant) avec icônes SVG inline
- L4 : Catégories — icône par type (compact, SUV, luxe)

Critères :
- Cohérent avec properties-list post UX-1
- PageHeader sur toutes les sous-pages locations

À la fin : fichiers modifiés + test /produits/locations.
```

### UX-11 — Croisières

**Branche :** `feature/admin-ui-cruises`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-cruises`.

Livrable UX-11 : Croisières — design
Références :
- apps/admin/components/cruises/ (ships-list, itineraries-section, itinerary-ports-section, sailings-list, cabins-section)
- UX-3 : Breadcrumb hiérarchique

Implémenter :
- C1 : Breadcrumbs dynamiques Croisières › {Ligne} › {Navire} › {Itinéraire}
- C2 : itinerary-ports-section en timeline horizontale/verticale avec ports et dates
- C3 : cabins-section en cards
- C4 : sailings-list — toggle liste / calendrier mensuel

Critères :
- Navigation profonde compréhensible
- Timeline ports responsive

À la fin : fichiers modifiés + test parcours navires/itinéraires.
```

### UX-12 — Activités & tours

**Branche :** `feature/admin-ui-activities`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-activities`.

Livrable UX-12 : Activités — design
Références :
- apps/admin/components/activities/activities-list.tsx
- apps/admin/app/(dashboard)/produits/activites/[id]/page.tsx
- Fournisseurs : produits/activites/fournisseurs

Implémenter :
- AC1 : Zone galerie photos fiche activité (placeholders ou URLs futures)
- AC2 : Badges durée + difficulté
- AC3 : Liste fournisseurs avec logo placeholder + note
- AC4 : Tableau/timeline créneaux horaires

Critères :
- Fiche activité en Tabs si contenu volumineux
- PageHeader + actions CRUD

À la fin : fichiers modifiés + test /produits/activites.
```

### UX-13 — Forfaits

**Branche :** `feature/admin-ui-packages`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-packages`.

Livrable UX-13 : Forfaits — design
Références :
- apps/admin/components/packages/package-form.tsx, package-items-section.tsx

Implémenter :
- P1 : package-items-section — icône par itemType (flight, property, activity…)
- P2 : Encart récap prix : somme composants vs prix forfait + badge économie
- P3 (optionnel) : Mini preview card style web

Critères :
- Composition forfait lisible d’un coup d’œil
- Formulaire sectionné en Cards

À la fin : fichiers modifiés + test /produits/forfaits.
```

### UX-14 — Destinations

**Branche :** `feature/admin-ui-destinations`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-destinations`.

Livrable UX-14 : Destinations — design
Références :
- apps/admin/app/(dashboard)/produits/destinations/
- Composants destinations existants

Implémenter :
- DE1 : Hero bandeau sur fiche destination (image URL ou gradient + nom)
- DE2 : Compteurs liés (API count ou liste) : hébergements, activités, forfaits
- DE3 (optionnel) : Coordonnées + preview map static

Critères :
- Liste destinations avec PageHeader + thumbnail/flag
- Fiche edit/create cohérente

À la fin : fichiers modifiés + test /produits/destinations.
```

### UX-15 — Réservations

**Branche :** `feature/admin-ui-bookings`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-bookings`.

Livrable UX-15 : Réservations — design
Références :
- apps/admin/components/bookings/bookings-list.tsx, booking-items-list.tsx
- apps/admin/app/(dashboard)/dashboard/bookings/[id]/page.tsx (si existe)
- UX-1 : FilterBar, AlertDialog, Tabs

Implémenter :
- R1 : FilterBar repliable pour bookings-list (statut, client, org, dates)
- R2 : Fiche réservation layout 2 colonnes : client + statut | lignes + paiements
- R3 : Composant BookingStatusTimeline
- R4 : booking-items-list — icône type produit + lien catalogue
- R5 : Barre actions avec AlertDialog confirmation

Critères :
- Filtres multiples sans surcharge visuelle desktop
- Mobile : filtres en drawer
- Montants tabular-nums

À la fin : fichiers modifiés + test /reservations + fiche détail.
```

### UX-16 — Paiements

**Branche :** `feature/admin-ui-payments`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-payments`.

Livrable UX-16 : Paiements — design
Références :
- apps/admin/components/payments/payments-list.tsx
- apps/admin/components/promo-codes/, promotions/
- UX-1 : Modal/AlertDialog, Drawer (créer Drawer simple dans ui si besoin)

Implémenter :
- PA1 : Colonnes montant alignées droite, tabular-nums
- PA2 : Drawer détail paiement — Stripe IDs, lien booking, historique remboursements
- PA3 : Modal remboursement — montant partiel/total, raison, preview
- PA4 : promo-codes-list — badges type %, validité, usage/limit
- PA5 : promotion preview bandeau

Critères :
- Remboursement : validation montant ≤ max
- Drawer accessible (focus trap, Escape)
- Toasts succès/erreur remboursement

À la fin : fichiers modifiés + test /paiements + codes promo.
```

### UX-17 — Contenu & support

**Branche :** `feature/admin-ui-content-support`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-content-support`.

Livrable UX-17 : Contenu & support — design
Références :
- apps/admin/components/reviews/reviews-list.tsx, review-detail-page.tsx
- apps/admin/app/(dashboard)/contenu/
- apps/admin/components/dashboard-section-page.tsx (placeholders tickets/messages)

Implémenter :
- CO1 : review-detail-page — layout 2 colonnes, étoiles, commentaire, contexte booking, actions Approuver/Masquer sticky footer
- CO2 : reviews-list — preview tronqué + actions rapides inline
- CO3 : tickets-list style inbox (statut, priorité, assigné, date) — si CRUD absent, EmptyState riche CO5
- CO5 : Remplacer DashboardSectionPage par EmptyState illustré + CTA

Critères :
- Modération rapide sans friction
- Empty states cohérents UX-1

À la fin : fichiers modifiés + test /contenu/avis.
```

### UX-18 — Organisations

**Branche :** `feature/admin-ui-organizations`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-organizations`.

Livrable UX-18 : Organisations — design
Références :
- apps/admin/components/organizations/organization-form.tsx
- apps/admin/app/(dashboard)/organisations/

Implémenter :
- O1 : Liste en cards ou table avec logo, type, statut, compteurs users/products
- O2 : Fiche /organisations/[id] en Tabs : Infos | Utilisateurs | Paramètres
- organization-form sectionné

Critères :
- Super admin : sélecteur org cohérent avec paramètres
- PageHeader + breadcrumb

À la fin : fichiers modifiés + test /organisations.
```

### UX-19 — Rôles & RBAC

**Branche :** `feature/admin-ui-rbac`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-rbac`.

Livrable UX-19 : Rôles & RBAC — design
Références :
- apps/admin/components/rbac/ (roles, permissions, assignations, audit)
- apps/admin/app/(dashboard)/systeme/

Implémenter :
- RB1 : Matrice permissions — grille groupée par domaine (properties.*, bookings.*…) avec checkboxes
- RB2 : user-role-assignments — recherche user + chips rôles
- RB3 : rbac-audit-logs — FilterBar date/acteur + row expandable JSON
- RB4 : Badge couleur par rôle

Critères :
- Matrice scrollable horizontal mobile
- Sauvegarde permissions avec toast + AlertDialog si changements non sauvés

À la fin : fichiers modifiés + test /systeme/roles.
```

### UX-20 — Paramètres organisation

**Branche :** `feature/admin-ui-settings`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-settings`.

Livrable UX-20 : Paramètres organisation — design
Références :
- apps/admin/components/parametres/ (organization-settings-page, brand-color-palette-field, parametres-subnav)
- apps/admin/components/organization-theme-provider.tsx

Implémenter :
- PM1 : parametres-subnav en vertical tabs sticky
- PM2 : Split view — formulaire branding | preview live sidebar+bouton (utilise applyBranding)
- PM3 : Contrast checker sur brand-color-palette-field (warning si ratio < 4.5:1)
- PM4 : Masquage IBAN comptes bancaires
- PM6 : Sticky bar « Modifications non enregistrées » + Enregistrer / Annuler

Critères :
- Preview branding réactif sans save
- Navigation parametres/comptes/emails cohérente

À la fin : fichiers modifiés + test /parametres clair/sombre + org custom color.
```

### UX-21 — Pages placeholder & empty states

**Branche :** `feature/admin-ui-empty-states`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-empty-states`.

Livrable UX-21 : Empty states & placeholders
Références :
- apps/admin/components/dashboard-section-page.tsx
- apps/admin/app/(dashboard)/[...segments]/page.tsx
- UX-1 : EmptyState, PageHeader

Remplacer DashboardSectionPage par composant EmptyState :
- Illustration SVG inline (travel/support themed)
- Titre, description module, CTA optionnel
- PageHeader cohérent (PL2)

Appliquer sur routes encore placeholder (contenu/messages, etc.).

Critères :
- Plus de simple « Contenu à venir » sans visuel
- i18n titres/descriptions

À la fin : fichiers modifiés + captures pages placeholder.
```

### UX-22 — Mobile, responsive & polish global

**Branche :** `feature/admin-ui-mobile-polish`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-ui-mobile-polish`.

Livrable UX-22 : Mobile & polish global
Références :
- packages/ui/src/components/data-table.tsx
- apps/admin/components/*-list.tsx (patterns listes)
- apps/admin/messages/fr.json, en.json

Implémenter :
- M1 : DataTable responsive — option hiddenColumns mobile + expand row pour détails
- M2 : Migrer chaînes FR en dur des KPI dashboard et labels listes fréquentes vers next-intl
- M3 (optionnel) : Cmd+K palette recherche stub
- M4 (optionnel) : Hook exportCsv réutilisable

Appliquer M1 sur bookings-list et properties-list minimum.

Critères :
- Tableaux utilisables à 375px width
- Pas de scroll horizontal non contrôlé
- i18n : au minimum dashboard + nav labels restants

À la fin : fichiers modifiés + captures mobile 375px reservations + hebergements.
```

---

## Références code


| Élément               | Chemin                                                           |
| --------------------- | ---------------------------------------------------------------- |
| Tokens thème          | `packages/config/theme.css`                                      |
| Shell admin           | `packages/ui/src/components/dashboard-shell.tsx`                 |
| Navigation config     | `apps/admin/config/dashboard-nav.config.ts`                      |
| Liste type (CRUD)     | `apps/admin/components/properties/properties-list.tsx`           |
| KPI dashboard         | `apps/admin/components/dashboard-kpi-cards.tsx`                  |
| Branding org          | `apps/admin/components/organization-theme-provider.tsx`          |
| Palette couleurs      | `apps/admin/components/parametres/brand-color-palette-field.tsx` |
| Placeholder           | `apps/admin/components/dashboard-section-page.tsx`               |
| Roadmap fonctionnelle | `docs/roadmap-development.md`                                    |


---

*Document pour guider les PRs design admin. Référencer UX-[N] et IDs suggestion (ex. H4, PA3) dans titres et corps de PR.*