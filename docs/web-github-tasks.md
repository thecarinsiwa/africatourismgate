# Africa Tourism Gate — Tâches GitHub pour la partie Web

> **Document opérationnel** pour créer des issues GitHub destinées à un·e contributeur·rice qui corrige et améliore l’application publique `apps/web`.  
> **Mise à jour : août 2026** — Basé sur l’état actuel du dépôt.

---

## Comment utiliser ce document

1. **Lire la section [Prise en main](#prise-en-main-contributeur)** (environnement, commandes, conventions).
2. **Parcourir le [tableau récapitulatif](#tableau-récapitulatif-des-tâches)** pour choisir les issues à créer.
3. Pour la **revue des traductions**, suivre la section [Tests i18n — revue de toutes les pages](#tests-i18n--revue-de-toutes-les-pages) (checklist 53 routes × FR/EN/ES).
4. **Copier le bloc « Modèle GitHub »** de chaque tâche dans une nouvelle issue (`gh issue create` ou interface GitHub).
5. **Adapter** les labels, l’assignation et la priorité selon votre planning.
6. **Croiser** avec les docs détaillées existantes (voir [Documents liés](#documents-liés)) — ne pas dupliquer le contenu des prompts WEB-UX ou CE.

### Création rapide via CLI

```bash
gh issue create \
  --title "[WEB] Migrer i18n legacy vers next-intl" \
  --label "web,enhancement,priority:high" \
  --body-file docs/web-github-tasks/issue-web-i18n-migration.md
```

> Astuce : vous pouvez extraire chaque modèle ci-dessous dans un fichier séparé sous `docs/web-github-tasks/` si vous préférez `--body-file`.

---

## Prise en main contributeur

### Stack `apps/web`

| Domaine | Technologie |
| -------- | ----------- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Port dev | **3002** (`pnpm dev:web`) |
| Styles | Tailwind CSS, tokens `--atg-*`, thème clair/sombre |
| UI partagée | `@africatourismgate/ui` (`AppShell`, formulaires, toasts) |
| i18n | **Double système** : `next-intl` (`messages/*.json`) + legacy `LocaleProvider` / `lib/i18n/translations.ts` |
| Auth client | Session `sessionStorage`, OAuth Google, guards `WebAuthGuard` / `BookingAuthGuard` |
| API | `@africatourismgate/api-client` + wrappers `lib/api/*` |
| Cartes | Leaflet (activités, itinéraires forfaits) |
| Paiement | Stripe Checkout via API |

### Prérequis locaux

```bash
# À la racine du monorepo
pnpm install
cp .env.example .env   # configurer NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Terminal 1 — API (obligatoire)
pnpm dev:api

# Terminal 2 — Web
pnpm dev:web           # http://localhost:3002
```

### Commandes utiles

```bash
pnpm --filter @africatourismgate/web lint
pnpm --filter @africatourismgate/web build
pnpm --filter @africatourismgate/web test          # unitaires (lib/**/*.test.ts)
pnpm --filter @africatourismgate/web test:e2e      # Playwright (14 specs)
node scripts/check-i18n-parity.mjs                 # parité fr/en/es
```

### Conventions issues & PR

| Élément | Convention |
| -------- | ----------- |
| Préfixe titre | `[WEB]` pour fonctionnel/bug, `[WEB-UX-N]` pour design (voir doc design) |
| Branches | `fix/web-*`, `feature/web-*`, `feature/web-ui-*` |
| Labels suggérés | `web`, `bug`, `enhancement`, `testing`, `i18n`, `a11y`, `priority:high\|medium\|low` |
| Une PR | Un scope testable ; ne pas mélanger refonte i18n + polish visuel |
| Tests | Toute modification checkout/compte/auth → specs Playwright passantes |

### État actuel (synthèse août 2026)

| Zone | État | Commentaire |
| ---- | ---- | ----------- |
| Homepage & recherche multi-verticales | ✅ | Hero, onglets, carte Leaflet |
| Hôtels, vols, voitures, croisières, activités, forfaits | ✅ | Listings + fiches + checkout (Stripe ou assisté) |
| Parcours booking canonique `/booking/*` | ✅ | Panier → récap → paiement / demande assistée |
| Compte client `/account/*` | ✅ | Profil, réservations, chat assisté, fidélité OneKey |
| i18n | ⚠️ | Migration next-intl inachevée ; textes EN en dur sur certaines pages |
| Routes legacy `/reservations/*` | ⚠️ | Doublons sans guards auth |
| Stub `/booking` (sans `/cart`) | ⚠️ | Placeholder EN non i18n |
| Copy « demo / coming soon » | ⚠️ | Incohérent avec checkout opérationnel |
| Tests unitaires composants | ❌ | Seulement logique `lib/` |
| Tests E2E | ⚠️ | Bonne couverture checkout ; i18n E2E limité à `/` + login (voir WEB-I18N-06) |
| Design / cohérence visuelle | ⚠️ | Voir [web-design-improvements.md](./web-design-improvements.md) |

---

## Tableau récapitulatif des tâches

| ID | Titre court | Priorité | Type | Effort estimé |
| -- | ----------- | -------- | ---- | ------------- |
| WEB-001 | Migrer i18n legacy vers next-intl | Haute | Refactoring | L |
| WEB-002 | Supprimer routes legacy `/reservations/*` | Haute | Cleanup | S |
| WEB-003 | Corriger stub `/booking` ou rediriger | Haute | Bug | S |
| WEB-004 | Aligner copy UX (demo, coming soon, trust hints) | Haute | Enhancement | M |
| WEB-005 | Internationaliser metadata SEO | Moyenne | Enhancement | M |
| WEB-006 | Stabiliser pipeline E2E (build + Playwright CI) | Haute | Testing | M |
| WEB-007 | E2E checkout location voiture | Moyenne | Testing | S |
| WEB-008 | E2E smoke blog, donate, about | Basse | Testing | M |
| WEB-009 | Tests composants checkout & auth | Moyenne | Testing | L |
| WEB-010 | Audit accessibilité (a11y) | Moyenne | A11y | L |
| WEB-011 | Gestion erreurs API sur pages listing | Moyenne | Bug | M |
| WEB-012 | Créer README local `apps/web` | Basse | Docs | S |
| WEB-013 | Nettoyer code `@deprecated` | Basse | Cleanup | S |
| WEB-014 | E2E flux register + verify OTP | Moyenne | Testing | M |
| WEB-015 | E2E erreurs Stripe / échecs API | Moyenne | Testing | M |
| WEB-I18N-01 | QA manuelle i18n — Accueil & navigation | Haute | i18n / QA | S |
| WEB-I18N-02 | QA manuelle i18n — Verticales (6 listings + fiches) | Haute | i18n / QA | M |
| WEB-I18N-03 | QA manuelle i18n — Parcours booking & auth | Haute | i18n / QA | M |
| WEB-I18N-04 | QA manuelle i18n — Espace compte client | Haute | i18n / QA | M |
| WEB-I18N-05 | QA manuelle i18n — Marketing (about, blog, support, donate) | Moyenne | i18n / QA | M |
| WEB-I18N-06 | E2E automatisé i18n — toutes les pages publiques | Haute | i18n / Testing | L |
| WEB-I18N-07 | Corriger textes hardcodés identifiés (revue i18n) | Haute | i18n / Bug | M |

**Légende effort :** S = 1–2 j, M = 3–5 j, L = 1–2 sem.

> Les tâches design (WEB-UX-1 à WEB-UX-20) sont dans [web-design-improvements.md](./web-design-improvements.md) — créer des issues séparées avec le préfixe `[WEB-UX-N]`.

---

## Modèles GitHub — prêts à copier

---

### WEB-001 — Migrer i18n legacy vers next-intl

**Labels :** `web`, `enhancement`, `i18n`, `priority:high`  
**Branche suggérée :** `feature/web-i18n-next-intl-migration`

#### Modèle GitHub

```markdown
## Contexte

L'application web utilise **deux systèmes i18n en parallèle** :
- **next-intl** : `apps/web/messages/{fr,en,es}.json` + `NextIntlClientProvider` (layout)
- **Legacy** : `LocaleProvider`, `lib/i18n/translations.ts` (~4300 lignes), `lib/i18n/locales/*.ts`

La majorité des pages consomment encore le système legacy. Cela complique la maintenance, crée des incohérences FR/EN/ES et laisse des textes EN en dur.

## Objectif

Migrer progressivement vers **next-intl uniquement** :
1. Inventorier les composants utilisant `useLocale()` / `LocaleProvider` / imports depuis `translations.ts`
2. Déplacer les clés vers `messages/fr.json`, `en.json`, `es.json`
3. Remplacer par `useTranslations('namespace')` de next-intl
4. Supprimer `LocaleProvider` et fichiers legacy une fois la migration terminée
5. Vérifier la parité avec `node scripts/check-i18n-parity.mjs`

## Fichiers clés

- `apps/web/components/locale-provider.tsx` (@deprecated)
- `apps/web/lib/i18n/translations.ts`
- `apps/web/messages/*.json`
- `apps/web/app/layout.tsx`

## Critères d'acceptation

- [ ] Aucune importation active de `lib/i18n/translations.ts` dans les composants
- [ ] Parité fr/en/es validée (script i18n)
- [ ] Spec `i18n-switch.spec.ts` passante
- [ ] Pas de chaînes utilisateur en dur (sauf fallbacks documentés)
- [ ] `LocaleProvider` supprimé ou réduit à un shim temporaire documenté

## Plan de test

```bash
pnpm dev:web
pnpm --filter @africatourismgate/web test:e2e -- i18n-switch.spec.ts
node scripts/check-i18n-parity.mjs
```

## Références

- docs/web-github-tasks.md (WEB-001)
- docs/web-design-improvements.md (règle : textes via messages/*.json)
```

---

### WEB-002 — Supprimer routes legacy `/reservations/*`

**Labels :** `web`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/web-remove-reservations-legacy-routes`

#### Modèle GitHub

```markdown
## Contexte

Le parcours de réservation canonique est sous **`/booking/*`** (panier, récap, succès, auth).
Des routes **legacy** existent en parallèle sous **`/reservations/*`** :
- `/reservations/cart`
- `/reservations/recap`
- `/reservations/success`
- `/reservations/cancel`

Ces routes réutilisent les mêmes composants mais **sans les guards auth** (`BookingAuthGuard`) présents sur `/booking/cart` et `/booking/recap`.

## Objectif

1. Ajouter des **redirects permanents** dans `next.config.mjs` : `/reservations/*` → `/booking/*`
2. Supprimer les pages `apps/web/app/reservations/` (ou les garder comme redirects Next.js)
3. Rechercher et mettre à jour tous les liens internes pointant vers `/reservations/`
4. Vérifier qu'aucun e-mail ou lien externe ne casse (grep repo + templates API)

## Critères d'acceptation

- [ ] `/reservations/cart` redirige vers `/booking/cart` (307/308)
- [ ] Idem pour recap, success, cancel
- [ ] Aucun lien interne `apps/web` ne pointe vers `/reservations/`
- [ ] Specs Playwright checkout passantes

## Plan de test

```bash
pnpm --filter @africatourismgate/web test:e2e
# Manuel : ouvrir /reservations/cart → doit arriver sur /booking/cart
```

## Fichiers probables

- `apps/web/app/reservations/**`
- `apps/web/next.config.mjs`
- `grep -r "reservations/" apps/web`
```

---

### WEB-003 — Corriger ou supprimer le stub `/booking`

**Labels :** `web`, `bug`, `priority:high`  
**Branche suggérée :** `fix/web-booking-stub-redirect`

#### Modèle GitHub

```markdown
## Contexte

La route `apps/web/app/booking/page.tsx` affiche un **placeholder** en anglais :
- Titre « Booking Checkout »
- Message « Full checkout integration is being finalized »
- CTA mailto manuel

Or le checkout complet existe via `/booking/cart` → `/booking/recap` → Stripe ou demande assistée.

## Objectif

Choisir **une** des options (documenter le choix dans la PR) :
- **Option A (recommandée)** : redirect `/booking` → `/booking/cart` (ou `/hotels` si panier vide)
- **Option B** : supprimer la page et gérer via `next.config.mjs`
- **Option C** : transformer en page hub i18n avec liens vers panier / compte (si un vrai besoin produit)

## Critères d'acceptation

- [ ] Plus de texte EN hardcodé « being finalized »
- [ ] Comportement cohérent avec le flux checkout existant
- [ ] i18n fr/en/es si contenu conservé

## Fichier

- `apps/web/app/booking/page.tsx`
```

---

### WEB-004 — Aligner copy UX (demo, coming soon, trust hints)

**Labels :** `web`, `enhancement`, `priority:high`  
**Branche suggérée :** `fix/web-copy-demo-trust-hints`

#### Modèle GitHub

```markdown
## Contexte

Plusieurs textes indiquent encore un catalogue « demo » ou « coming soon » alors que le checkout (Stripe + demande assistée) est opérationnel. Cela nuit à la confiance utilisateur.

## Objectif

1. Auditer et corriger les messages dans :
   - `lib/i18n/translations.ts` / `messages/*.json` (ex. « Demo catalogue — online booking coming soon »)
   - `components/reservations/booking-sidebar-shell.tsx` (`trustDemoCatalog`)
   - Pages `coming-soon` si des verticals sont marquées implémentées dans `lib/search/route.ts`
2. Afficher les **trust hints demo** uniquement en environnement dev ou si flag org explicite
3. Harmoniser CTA sidebar selon mode booking (immédiat vs assisté) via `use-booking-cta.ts`

## Critères d'acceptation

- [ ] Aucun message « coming soon » sur un vertical avec checkout actif
- [ ] Trust hints conditionnels (pas de badge demo en prod)
- [ ] i18n fr/en/es pour tout nouveau texte
- [ ] Parcours hôtel + activité testés manuellement

## Références

- `apps/web/lib/bookings/use-booking-cta.ts`
- `apps/web/lib/search/route.ts` (`IMPLEMENTED_SEARCH_VERTICALS`)
```

---

### WEB-005 — Internationaliser metadata SEO

**Labels :** `web`, `enhancement`, `i18n`, `priority:medium`  
**Branche suggérée :** `feature/web-i18n-metadata`

#### Modèle GitHub

```markdown
## Contexte

Les métadonnées (`title`, `description`, Open Graph) sont souvent **hardcodées en français** dans `layout.tsx` et certaines pages, alors que le site supporte fr/en/es.

## Objectif

1. Utiliser `generateMetadata` avec next-intl ou lecture cookie `atg-locale`
2. Couvrir au minimum : layout root, homepage, pages listing (`/hotels`, `/flights`, …), fiches détail, `/account/*`, `/booking/*`
3. Conserver les metadata existantes correctes ; enrichir OG par page produit si données API disponibles

## Critères d'acceptation

- [ ] Title/description cohérents en fr, en, es (test manuel changement langue)
- [ ] Pas de régression build (`pnpm --filter @africatourismgate/web build`)
- [ ] Documenter le pattern dans un commentaire ou README web

## Fichiers probables

- `apps/web/app/layout.tsx`
- `apps/web/app/**/page.tsx` (generateMetadata)
```

---

### WEB-006 — Stabiliser pipeline E2E (build + Playwright CI)

**Labels :** `web`, `testing`, `priority:high`  
**Branche suggérée :** `feature/web-e2e-ci-stabilization`

#### Modèle GitHub

```markdown
## Contexte

Les tests E2E Playwright échouent parfois avec des erreurs Next.js **vendor-chunks** (cache `.next` stale), notamment sur `package-checkout.spec.ts`.

## Objectif

1. Documenter la procédure fiable : `pnpm build && playwright test`
2. Ajouter un script npm `test:e2e:ci` qui build avant test
3. Intégrer dans CI GitHub Actions (label `e2e` ou branche main) :
   - `pnpm install`
   - Démarrer API + web (ou web en mode production sur 3002)
   - Lancer la suite E2E
4. Nettoyer / ignorer `apps/web/test-results/` du suivi git si pertinent

## Critères d'acceptation

- [ ] `pnpm --filter @africatourismgate/web test:e2e:ci` passe localement après clone frais
- [ ] Workflow CI documenté dans README ou commentaire workflow
- [ ] Les 14 specs existantes passent (ou liste des specs flaky documentée avec issue dédiée)

## Fichiers probables

- `apps/web/package.json`
- `.github/workflows/*.yml`
- `apps/web/playwright.config.ts`
```

---

### WEB-007 — E2E checkout location voiture

**Labels :** `web`, `testing`, `priority:medium`  
**Branche suggérée :** `feature/web-e2e-car-checkout`

#### Modèle GitHub

```markdown
## Contexte

Des specs E2E existent pour hôtel, vol, croisière, activité, forfait — **pas pour la location voiture**.

## Objectif

Créer `apps/web/tests/e2e/car-checkout.spec.ts` sur le modèle de `reservation-checkout.spec.ts` :
1. Mock ou seed API véhicule disponible
2. Parcours : `/cars` → fiche → panier → récap → Stripe mock → success
3. Auth client si requis (helper `admin-auth.ts` / fixtures existantes)

## Critères d'acceptation

- [ ] Spec verte en local avec `pnpm test:e2e`
- [ ] Couvre mode paiement immédiat (`vehicle` → immediate par défaut)
- [ ] Pas de dépendance à un ID hardcodé fragile (utiliser fixtures ou recherche API)

## Références

- `apps/web/tests/e2e/reservation-checkout.spec.ts`
- `apps/web/tests/e2e/helpers/`
```

---

### WEB-008 — E2E smoke blog, donate, about

**Labels :** `web`, `testing`, `priority:low`  
**Branche suggérée :** `feature/web-e2e-marketing-smoke`

#### Modèle GitHub

```markdown
## Contexte

Pages marketing secondaires sans couverture E2E : `/blog`, `/blog/[slug]`, `/donate`, `/about/*`, `/support`.

## Objectif

Ajouter une spec smoke `marketing-pages.spec.ts` :
- Chaque page charge sans erreur 500
- Éléments clés visibles (titre, nav, footer)
- `/support` : FAQ + formulaire ticket (mock auth optionnel)

## Critères d'acceptation

- [ ] Spec smoke < 2 min
- [ ] Tolère API indisponible avec assertion graceful (empty state, pas crash)
```

---

### WEB-009 — Tests composants checkout & auth

**Labels :** `web`, `testing`, `priority:medium`  
**Branche suggérée :** `feature/web-component-tests`

#### Modèle GitHub

```markdown
## Contexte

Les tests unitaires actuels couvrent uniquement `lib/**/*.test.ts` (13 fichiers). Aucun test composant React.

## Objectif

Introduire un runner de tests composants (React Testing Library + Vitest ou équivalent aligné monorepo) et couvrir :
- `BookingAuthGuard` / redirection login
- `checkout-stepper.tsx` — étapes affichées
- `use-booking-cta.ts` — CTA immédiat vs assisté
- `stripe-payment-error.tsx` — rendu message erreur

## Critères d'acceptation

- [ ] Script `pnpm --filter @africatourismgate/web test:components` (ou extension de `test`)
- [ ] ≥ 4 tests composants significatifs
- [ ] Documenté dans README web

## Hors scope

- Tests snapshot massifs
- E2E (déjà couverts ailleurs)
```

---

### WEB-010 — Audit accessibilité (a11y)

**Labels :** `web`, `a11y`, `priority:medium`  
**Branche suggérée :** `feature/web-a11y-audit`

#### Modèle GitHub

```markdown
## Contexte

Accessibilité partielle : menu mobile, galeries lightbox, formulaires auth et FAQ nécessitent un passage WCAG.

## Objectif

1. Audit ciblé (axe DevTools ou eslint-plugin-jsx-a11y) sur :
   - `home-header.tsx` (menu mobile, focus trap)
   - `swipeable-image-gallery.tsx` / `hotel-gallery.tsx`
   - Pages `/booking/login`, `/support` (FAQ accordéon)
   - Checkout stepper et formulaires
2. Corriger : labels, `aria-*`, focus visible, contrastes dark mode, touch targets ≥ 44px
3. Documenter checklist a11y pour futures PR

## Critères d'acceptation

- [ ] Navigation clavier complète sur login + galerie hôtel
- [ ] FAQ : `aria-expanded`, activation clavier Enter/Space
- [ ] Aucune régression visuelle majeure
- [ ] Liste des pages corrigées dans la PR

## Références

- docs/web-design-improvements.md (WEB-UX-19 M1, WEB-UX-17 SP1)
```

---

### WEB-011 — Gestion erreurs API sur pages listing

**Labels :** `web`, `bug`, `priority:medium`  
**Branche suggérée :** `fix/web-listing-api-error-states`

#### Modèle GitHub

```markdown
## Contexte

Quand l'API est indisponible ou renvoie une erreur, certaines pages listing affichent un écran blanc ou une erreur Next non gérée. Le blog gère partiellement ce cas.

## Objectif

1. Harmoniser error/empty states sur :
   - `/hotels`, `/flights`, `/cars`, `/cruises`, `/activities`, `/packages`
   - `/search/[type]`
2. Réutiliser `EmptyState` ou pattern blog existant
3. Message i18n + CTA retour accueil / réessayer

## Critères d'acceptation

- [ ] Couper l'API en dev → page listing affiche état erreur lisible (pas 500 crash)
- [ ] i18n fr/en/es
- [ ] Pas de régression quand API OK
```

---

### WEB-012 — Créer README local `apps/web`

**Labels :** `web`, `documentation`, `priority:low`  
**Branche suggérée :** `docs/web-readme`

#### Modèle GitHub

```markdown
## Contexte

Pas de README dédié dans `apps/web`. Le contributeur doit lire le README racine et explorer le code.

## Objectif

Créer `apps/web/README.md` avec :
- Rôle de l'app (site public client)
- Prérequis et variables d'environnement
- Commandes dev / build / test / e2e
- Structure dossiers (`app/`, `components/`, `lib/`)
- Flux principaux (recherche → fiche → booking → compte)
- Liens vers docs/web-design-improvements.md, web-github-tasks.md, roadmap

## Critères d'acceptation

- [ ] README ≤ 150 lignes, factuel, à jour
- [ ] Exemple `.env` minimal documenté
```

---

### WEB-013 — Nettoyer code `@deprecated`

**Labels :** `web`, `enhancement`, `priority:low`  
**Branche suggérée :** `chore/web-remove-deprecated`

#### Modèle GitHub

```markdown
## Contexte

Plusieurs helpers et routes sont marqués `@deprecated` :
- `lib/reservations/flow.ts`
- `lib/packages/listings.ts`
- `lib/about/routes.ts` (URLs FR legacy)
- `components/locale-provider.tsx`

## Objectif

1. Lister les usages restants (grep `@deprecated` + imports)
2. Migrer les appels vers les APIs recommandées
3. Supprimer le code mort si aucun usage

## Critères d'acceptation

- [ ] Build et tests passent
- [ ] Aucun import vers symboles supprimés
- [ ] PR limitée au cleanup (pas de refonte fonctionnelle)
```

---

### WEB-014 — E2E flux register + verify OTP

**Labels :** `web`, `testing`, `priority:medium`  
**Branche suggérée :** `feature/web-e2e-register-verify`

#### Modèle GitHub

```markdown
## Contexte

`booking-register.spec.ts` couvre l'inscription ; le flux **vérification e-mail / OTP** (`/booking/verify`) n'a pas de spec dédiée complète.

## Objectif

Spec E2E :
1. Register → redirect verify
2. Saisie code OTP (mock API ou Mailpit en dev)
3. Session active → accès panier / compte

## Critères d'acceptation

- [ ] Spec stable sans flake (> 3 runs locaux OK)
- [ ] Utilise helpers auth existants
```

---

### WEB-015 — E2E erreurs Stripe / échecs API

**Labels :** `web`, `testing`, `priority:medium`  
**Branche suggérée :** `feature/web-e2e-stripe-errors`

#### Modèle GitHub

```markdown
## Contexte

`stripe-payment-error.tsx` existe mais les parcours E2E ne couvrent pas l'échec paiement ou timeout API checkout.

## Objectif

1. Mock Stripe / API pour simuler échec paiement
2. Vérifier affichage `StripePaymentError` + possibilité de réessayer
3. Mock échec `createBookingCheckoutSession` → message utilisateur clair

## Critères d'acceptation

- [ ] Spec `stripe-checkout-errors.spec.ts` (ou extension checkout existante)
- [ ] Messages i18n visibles
- [ ] Pas de fuite d'infos techniques sensibles dans l'UI
```

---

## Tests i18n — revue de toutes les pages

Objectif : **vérifier que chaque page affiche des textes traduits en FR, EN et ES**, sans chaînes EN hardcodées, sans clés i18n manquantes (`[missing]`), et avec une cohérence terminologique (CTA, statuts, erreurs).

### Méthode de test (manuelle)

Pour **chaque page** et **chaque langue** (FR → EN → ES) :

1. Ouvrir la page en français (langue par défaut ou cookie `atg-locale=fr`)
2. Cliquer sur le sélecteur de langue (`Choisir la langue` / `Select language` / `Elegir idioma`)
3. Basculer EN puis ES ; **recharger la page** pour vérifier la persistance du cookie
4. Contrôler :
   - Titres (`h1`, `h2`), navigation header/footer
   - Labels de formulaires, placeholders, boutons, liens
   - Messages d'erreur / empty states / toasts
   - Metadata onglet navigateur (`<title>`) si visible
5. Noter dans l'issue GitHub : route, langue, texte incorrect (capture écran), fichier suspect

**Commandes préalables :**

```bash
pnpm dev:api && pnpm dev:web
node scripts/check-i18n-parity.mjs    # parité clés fr/en/es (si applicable web)
```

**Spec E2E existante (référence) :** `apps/web/tests/e2e/i18n-switch.spec.ts` — ne couvre que `/` et `/booking/login`.

---

### Inventaire des pages à tester (53 routes)

Cocher dans l'issue au fur et à mesure. Remplacer `[id]` par un ID seed/API valide (ex. hôtel, vol, activité du jeu de données demo).

#### Groupe A — Accueil & shell global

| Route | FR | EN | ES | Notes |
| ----- | -- | -- | -- | ----- |
| `/` | ☐ | ☐ | ☐ | Hero, onglets recherche, footer, CTA connexion |
| Header (toutes pages) | ☐ | ☐ | ☐ | Nav verticales, thème, langue, compte |
| Footer (toutes pages) | ☐ | ☐ | ☐ | Liens légaux, contact, réseaux |

#### Groupe B — Verticales (listings)

| Route | FR | EN | ES | Notes |
| ----- | -- | -- | -- | ----- |
| `/hotels` | ☐ | ☐ | ☐ | Formulaire recherche, filtres, pagination |
| `/flights` | ☐ | ☐ | ☐ | |
| `/cars` | ☐ | ☐ | ☐ | |
| `/cruises` | ☐ | ☐ | ☐ | |
| `/activities` | ☐ | ☐ | ☐ | |
| `/packages` | ☐ | ☐ | ☐ | |
| `/search/[type]` | ☐ | ☐ | ☐ | Tester `hotels`, `activities`, type inconnu |

#### Groupe C — Fiches produit (détail)

| Route | FR | EN | ES | Notes |
| ----- | -- | -- | -- | ----- |
| `/hotels/[id]` | ☐ | ☐ | ☐ | Galerie, chambres, sidebar réservation, avis |
| `/flights/[id]` | ☐ | ☐ | ☐ | Itinéraire, classes tarifaires |
| `/cars/[id]` | ☐ | ☐ | ☐ | Specs, équipements |
| `/cruises/[id]` | ☐ | ☐ | ☐ | Itinéraire ports, cabines |
| `/activities/[id]` | ☐ | ☐ | ☐ | Créneaux, difficulté |
| `/packages/[id]` | ☐ | ☐ | ☐ | Composition forfait, config par vertical |

#### Groupe D — Auth & booking

| Route | FR | EN | ES | Notes |
| ----- | -- | -- | -- | ----- |
| `/booking/login` | ☐ | ☐ | ☐ | Déjà partiellement couvert E2E |
| `/booking/register` | ☐ | ☐ | ☐ | |
| `/booking/verify` | ☐ | ☐ | ☐ | OTP, messages erreur |
| `/booking/logout` | ☐ | ☐ | ☐ | |
| `/booking/oauth/callback` | ☐ | ☐ | ☐ | États erreur OAuth |
| `/booking/cart` | ☐ | ☐ | ☐ | Lignes panier, empty state |
| `/booking/recap` | ☐ | ☐ | ☐ | CTA payer / demander réservation |
| `/booking/success` | ☐ | ☐ | ☐ | Post-paiement Stripe |
| `/booking/request-success` | ☐ | ☐ | ☐ | Demande assistée |
| `/booking/cancel` | ☐ | ☐ | ☐ | Annulation paiement |
| `/booking` | ☐ | ☐ | ☐ | **Stub EN connu** — à corriger (WEB-003) |
| `/reservations/cart` | ☐ | ☐ | ☐ | Legacy — même i18n que booking ? |
| `/reservations/recap` | ☐ | ☐ | ☐ | |
| `/reservations/success` | ☐ | ☐ | ☐ | |
| `/reservations/cancel` | ☐ | ☐ | ☐ | |

#### Groupe E — Compte client (auth requise)

| Route | FR | EN | ES | Notes |
| ----- | -- | -- | -- | ----- |
| `/account` | ☐ | ☐ | ☐ | Redirect ou hub compte |
| `/account/profile` | ☐ | ☐ | ☐ | Préférences langue |
| `/account/addresses` | ☐ | ☐ | ☐ | CRUD adresses |
| `/account/reservations` | ☐ | ☐ | ☐ | Liste, badges statut, action requise |
| `/account/reservations/[id]` | ☐ | ☐ | ☐ | Timeline, documents, avis guides |
| `/account/reservations/[id]/chat` | ☐ | ☐ | ☐ | Thread messages assisté |
| `/account/loyalty` | ☐ | ☐ | ☐ | Programme OneKey |
| `/account/payment-methods` | ☐ | ☐ | ☐ | Cartes enregistrées |

#### Groupe F — Marketing & contenu

| Route | FR | EN | ES | Notes |
| ----- | -- | -- | -- | ----- |
| `/about` | ☐ | ☐ | ☐ | |
| `/about/who-we-are` | ☐ | ☐ | ☐ | |
| `/about/our-history` | ☐ | ☐ | ☐ | Fallback locale API possible |
| `/about/team` | ☐ | ☐ | ☐ | |
| `/about/governance` | ☐ | ☐ | ☐ | |
| `/about/responsibility` | ☐ | ☐ | ☐ | |
| `/about/how-we-work` | ☐ | ☐ | ☐ | |
| `/about/reports` | ☐ | ☐ | ☐ | |
| `/about/media-resources` | ☐ | ☐ | ☐ | |
| `/about/contact` | ☐ | ☐ | ☐ | |
| `/blog` | ☐ | ☐ | ☐ | Liste articles, fallback langue |
| `/blog/[slug]` | ☐ | ☐ | ☐ | |
| `/donate` | ☐ | ☐ | ☐ | Campagnes, CTA don |
| `/support` | ☐ | ☐ | ☐ | FAQ accordéon, formulaire ticket |
| `/coming-soon` | ☐ | ☐ | ☐ | |
| `/coming-soon/[vertical]` | ☐ | ☐ | ☐ | Tester `flights`, `cars`, etc. |

---

### Modèles GitHub — tâches i18n

---

#### WEB-I18N-01 — QA manuelle i18n — Accueil & navigation

**Labels :** `web`, `i18n`, `qa`, `priority:high`  
**Branche :** n/a (QA) ou `fix/web-i18n-home-shell`

##### Modèle GitHub

```markdown
## Contexte

Revue i18n du **groupe A** : homepage et éléments globaux (header, footer) visibles sur toutes les pages.

## Pages à tester

- `/` (homepage complète : hero, onglets recherche, destinations, avis, section GAP)
- Header : liens nav, bouton connexion/compte, sélecteur langue, thème
- Footer : liens verticales, about, contact

## Procédure

Pour FR, EN, ES :
1. Visiter `/`
2. Changer la langue via le sélecteur
3. Vérifier tous les textes listés ci-dessus
4. Naviguer vers `/hotels` et `/booking/login` sans re-changer la langue → la locale doit persister

## Critères d'acceptation

- [ ] Aucun texte EN sur interface FR (sauf noms propres, codes IATA)
- [ ] Aucun `[missing]` ou clé brute type `nav.home`
- [ ] Sélecteur langue : libellés corrects dans les 3 langues
- [ ] Tableau inventaire (groupe A) entièrement coché dans cette issue
- [ ] Captures des anomalies jointes ; corrections ou issues filles créées

## Référence E2E

`apps/web/tests/e2e/i18n-switch.spec.ts` (home nav EN/ES)
```

---

#### WEB-I18N-02 — QA manuelle i18n — Verticales (listings + fiches)

**Labels :** `web`, `i18n`, `qa`, `priority:high`

##### Modèle GitHub

```markdown
## Contexte

Revue i18n **groupes B et C** : 6 verticales × listing + fiche détail + `/search/[type]`.

## Pages à tester

Listings : `/hotels`, `/flights`, `/cars`, `/cruises`, `/activities`, `/packages`, `/search/hotels`

Fiches (IDs demo à documenter dans l'issue) :
- `/hotels/[id]`, `/flights/[id]`, `/cars/[id]`, `/cruises/[id]`, `/activities/[id]`, `/packages/[id]`

## Points d'attention

- Formulaires recherche (labels, placeholders, bouton submit)
- Filtres, tri, pagination, compteur résultats
- Cartes produit (meta, prix « à partir de », CTA)
- Sidebars réservation (dates, CTA immédiat vs « Demander une réservation »)
- Empty states (aucun résultat)
- Messages « demo / coming soon » (signaler pour WEB-004)

## Critères d'acceptation

- [ ] 7 listings × 3 langues cochés
- [ ] 6 fiches × 3 langues cochés
- [ ] Mode assisté (activité/forfait) : CTA traduit correctement en EN/ES
- [ ] Liste des textes hardcodés trouvés avec fichier + ligne
```

---

#### WEB-I18N-03 — QA manuelle i18n — Parcours booking & auth

**Labels :** `web`, `i18n`, `qa`, `priority:high`

##### Modèle GitHub

```markdown
## Contexte

Revue i18n **groupe D** : authentification client et flux checkout complet.

## Pages à tester

Auth : `/booking/login`, `/register`, `/verify`, `/logout`, `/oauth/callback`

Checkout : `/booking/cart`, `/recap`, `/success`, `/request-success`, `/cancel`

Legacy (si encore actif) : `/reservations/*`

Stub connu : `/booking` (texte EN — ticket WEB-003)

## Scénarios

1. Login → labels, erreurs (mauvais mot de passe)
2. Register → validation champs
3. Panier avec 1 ligne hôtel → libellés quantité, total
4. Récap mode immédiat → « Payer » / Stripe
5. Récap mode assisté (activité) → « Demander une réservation »
6. Pages succès / annulation / demande assistée

## Critères d'acceptation

- [ ] 15 routes × 3 langues (ou redirects documentés)
- [ ] Messages erreur Stripe (`stripe-payment-error.tsx`) traduits
- [ ] Stepper checkout (`checkout-stepper.tsx`) traduit
- [ ] Spec `i18n-switch.spec.ts` passante ; proposer extensions si manques
```

---

#### WEB-I18N-04 — QA manuelle i18n — Espace compte client

**Labels :** `web`, `i18n`, `qa`, `priority:high`

##### Modèle GitHub

```markdown
## Contexte

Revue i18n **groupe E** — nécessite session client (compte demo ou créé via register).

## Pages à tester

`/account`, `/account/profile`, `/addresses`, `/reservations`, `/reservations/[id]`, `/reservations/[id]/chat`, `/loyalty`, `/payment-methods`

## Points d'attention

- Nav compte / sidebar (états actifs)
- Badges statut réservation (`confirmé`, `en attente`, `pending_approval`, etc.)
- Timeline assistée (5 étapes)
- Badge « action requise » sur liste réservations
- Formulaire avis guide / séjour
- Changement langue dans profil → reflété sur le site

## Critères d'acceptation

- [ ] 8 routes × 3 langues cochés
- [ ] Statuts booking traduits (pas de enum API brut visible)
- [ ] Chat : placeholders, bouton envoyer, messages système
- [ ] OneKey : termes fidélité cohérents fr/en/es
```

---

#### WEB-I18N-05 — QA manuelle i18n — Marketing (about, blog, support, donate)

**Labels :** `web`, `i18n`, `qa`, `priority:medium`

##### Modèle GitHub

```markdown
## Contexte

Revue i18n **groupe F** : pages contenu et support.

## Pages à tester (16 routes)

About : `/about`, `/who-we-are`, `/our-history`, `/team`, `/governance`, `/responsibility`, `/how-we-work`, `/reports`, `/media-resources`, `/contact`

Autres : `/blog`, `/blog/[slug]`, `/donate`, `/support`, `/coming-soon`, `/coming-soon/flights`

## Points d'attention

- Contenu API multilingue vs UI shell (bandeau fallback langue)
- FAQ support : questions/réponses traduites
- Formulaire ticket : labels, sujets, confirmation
- Blog : message si article absent dans la locale
- Pages coming-soon : titre vertical + CTA retour

## Critères d'acceptation

- [ ] 16 routes × 3 langues cochés
- [ ] Bandeaux fallback documentés (comportement attendu vs bug)
- [ ] FAQ aria-labels traduits (accordéon)
```

---

#### WEB-I18N-06 — E2E automatisé i18n — toutes les pages publiques

**Labels :** `web`, `i18n`, `testing`, `priority:high`  
**Branche suggérée :** `feature/web-e2e-i18n-all-pages`

##### Modèle GitHub

```markdown
## Contexte

La spec `i18n-switch.spec.ts` ne couvre que `/` et `/booking/login`. Il faut automatiser la détection de régressions i18n sur l'ensemble des routes publiques.

## Objectif

Étendre ou créer `apps/web/tests/e2e/i18n-pages.spec.ts` :

1. **Helper** `switchLanguage(page, 'en' | 'es' | 'fr')` réutilisable
2. **Smoke i18n** par route : après switch EN, assert qu'aucun texte FR courant n'apparaît (heuristique)
3. **Assertions ciblées** : au moins 1 `heading` ou `button` traduit par page critique
4. Grouper par describe : home, verticals, booking, account (mock auth), marketing

## Routes minimum (sans auth)

`/`, `/hotels`, `/flights`, `/cars`, `/cruises`, `/activities`, `/packages`, `/booking/login`, `/support`, `/about`, `/blog`, `/donate`, `/coming-soon`

## Routes avec auth (mock session)

`/booking/cart`, `/account/profile`, `/account/reservations`

## Critères d'acceptation

- [ ] ≥ 20 routes testées en FR → EN (minimum)
- [ ] Script `pnpm test:e2e -- i18n-pages` passant en CI
- [ ] Pas de faux positifs fragiles (éviter assert sur contenu API dynamique)
- [ ] Documentation des textes « ancres » choisis par page (commentaire spec)

## Références

- `apps/web/tests/e2e/i18n-switch.spec.ts`
- `apps/web/components/language-switcher.tsx`
```

---

#### WEB-I18N-07 — Corriger textes hardcodés identifiés (revue i18n)

**Labels :** `web`, `i18n`, `bug`, `priority:high`  
**Branche suggérée :** `fix/web-i18n-hardcoded-strings`

##### Modèle GitHub

```markdown
## Contexte

Issue **fourre-tout corrective** alimentée par les QA WEB-I18N-01 à 05. À créer une fois la revue terminée, ou ouverte dès le début et mise à jour au fil des découvertes.

## Objectif

Corriger tous les textes hardcodés / non traduits identifiés :

| Route | Langue | Texte incorrect | Fichier | Statut |
| ----- | ------ | --------------- | ------- | ------ |
| `/booking` | all | « Booking Checkout » EN | `app/booking/page.tsx` | ☐ |
| … | | | | |

## Procédure correction

1. Déplacer la chaîne vers `messages/{fr,en,es}.json` (next-intl) ou `translations.ts` (legacy en attendant WEB-001)
2. Remplacer par `useTranslations` / `t('key')`
3. Re-tester la page en FR, EN, ES
4. Cocher la ligne du tableau

## Critères d'acceptation

- [ ] Toutes les lignes du tableau cochées
- [ ] `node scripts/check-i18n-parity.mjs` OK
- [ ] Specs `i18n-switch.spec.ts` + `i18n-pages.spec.ts` passantes
- [ ] Aucune régression visuelle sur parcours checkout

## Dépendances

- Peut être découpée en sous-PR par groupe (A→F) si trop volumineux
- Liée à WEB-001 (migration next-intl) si le fix touche beaucoup de fichiers legacy
```

---

### Ordre recommandé — revue i18n

```
WEB-I18N-01 (accueil) → WEB-I18N-02 (verticales) → WEB-I18N-03 (booking)
→ WEB-I18N-04 (compte) → WEB-I18N-05 (marketing)
→ WEB-I18N-07 (corrections) en parallèle des découvertes
→ WEB-I18N-06 (automatisation E2E) une fois les textes ancres stabilisés
→ WEB-001 (migration next-intl globale)
```

---

## Backlog design (issues séparées)

Créer des issues GitHub **distinctes** pour chaque livrable WEB-UX en copiant les prompts depuis [web-design-improvements.md](./web-design-improvements.md).

| Epic GitHub | Livrables | Priorité suggérée |
| ----------- | --------- | ----------------- |
| Design system web | WEB-UX-1, WEB-UX-2 | Haute |
| Shell & homepage | WEB-UX-3, WEB-UX-4 | Haute |
| Recherche & listes | WEB-UX-5, WEB-UX-6 | Haute |
| Fiches verticales | WEB-UX-7 … WEB-UX-12 | Moyenne |
| Checkout & sidebar | WEB-UX-13, WEB-UX-14 | Haute |
| Compte & auth | WEB-UX-15, WEB-UX-16 | Moyenne |
| Support & finitions | WEB-UX-17 … WEB-UX-20 | Moyenne |

**Titre issue type :** `[WEB-UX-6] Unifier grilles résultats et filtres multi-verticales`

---

## Ordre de travail recommandé

Pour un·e nouveau·elle contributeur·rice, enchaîner dans cet ordre :

```
WEB-012 (README) → WEB-006 (CI E2E) → WEB-002 + WEB-003 (cleanup routes)
→ WEB-004 (copy)
→ WEB-I18N-01 … WEB-I18N-05 (revue manuelle toutes pages, FR/EN/ES)
→ WEB-I18N-07 (corriger hardcodés trouvés) + WEB-001 (migration next-intl)
→ WEB-I18N-06 (E2E i18n automatisé) → WEB-005 (metadata)
→ WEB-007 … WEB-015 (autres tests) → WEB-010 (a11y)
→ WEB-UX-1 … (design, en parallèle possible)
```

---

## Documents liés

| Document | Usage |
| -------- | ----- |
| [web-design-improvements.md](./web-design-improvements.md) | Polish UI, livrables WEB-UX-1 à 20 |
| [roadmap-development.md](./roadmap-development.md) | Roadmap fonctionnelle globale |
| [roadmap-development-client-enhance.md](./roadmap-development-client-enhance.md) | Réservation assistée, chat (CE — largement implémenté côté web) |
| [README.md](../README.md) | Monorepo, quick start |
| `.github/ISSUE_TEMPLATE/` | Templates bug / feature génériques |

---

## Suivi des issues (à remplir sur GitHub)

| ID | Issue GitHub | Assigné | Statut |
| -- | ------------ | ------- | ------ |
| WEB-001 | | | ☐ |
| WEB-002 | | | ☐ |
| WEB-003 | | | ☐ |
| WEB-004 | | | ☐ |
| WEB-005 | | | ☐ |
| WEB-006 | | | ☐ |
| WEB-007 | | | ☐ |
| WEB-008 | | | ☐ |
| WEB-009 | | | ☐ |
| WEB-010 | | | ☐ |
| WEB-011 | | | ☐ |
| WEB-012 | | | ☐ |
| WEB-013 | | | ☐ |
| WEB-014 | | | ☐ |
| WEB-015 | | | ☐ |
| WEB-I18N-01 | | | ☐ |
| WEB-I18N-02 | | | ☐ |
| WEB-I18N-03 | | | ☐ |
| WEB-I18N-04 | | | ☐ |
| WEB-I18N-05 | | | ☐ |
| WEB-I18N-06 | | | ☐ |
| WEB-I18N-07 | | | ☐ |

---

*Document pour onboarding contributeur web et création d'issues GitHub. Mettre à jour ce fichier quand une tâche est terminée ou lorsque de nouvelles dettes techniques sont identifiées.*
