# Africa Tourism Gate — Roadmap POS (caisse)

> **Mise à jour : août 2026** — Document pour corriger, stabiliser et améliorer `apps/pos`.  
> Branche de base : `main`. **Une PR = un livrable = une branche.**  
> Complète : [roadmap-development.md](./roadmap-development.md) (livrable historique #73).  
> Contexte plateforme : [presentation-plateforme.md](./presentation-plateforme.md).

---

## Comment utiliser ce document

1. Lire **l’état actuel** et les **bugs / dettes** avant de coder.
2. Choisir un livrable **POS-N** dans le tableau récapitulatif.
3. Copier le **prompt détaillé** dans Cursor Agent.
4. Ouvrir une branche `feature/pos-…` ou `fix/pos-…`, implémenter, tester avec `pnpm --filter @africatourismgate/pos dev` (port **3003**).
5. Ne demander un commit que lorsque le résultat est validé.

### Prompt méta (modèle réutilisable)

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `[BRANCHE]`.

Livrable POS-N : [TITRE]
Références :
- apps/pos (Next.js 14, App Router, port 3003)
- apps/api — BookingEngineService, bookings.controller (checkout-preview, bookings, cash-payment, payment-intent)
- packages/api-client, packages/types (booking.ts)
- docs/roadmap-pos.md, docs/production-domains.md

Règles :
- Réutiliser les patterns POS existants (cart-context, sale-checkout, pos-shell-layout, api-client).
- Ne pas refactorer hors scope.
- UI tactile : boutons larges, feedback clair, messages en français.
- Pas de commit sauf si je le demande explicitement.

[PROMPT DÉTAILLÉ]

À la fin : résumer les fichiers modifiés et comment tester (pnpm dev:pos, vente cash, vente carte, curl si API).
```

---

## Architecture rapide

```
Employé → apps/pos (login JWT + cookies)
       → sélection organisation (branding / session)
       → catalogue CRUD staff (activités, chambres, vols, véhicules, cabines)
       → POST /bookings/checkout-preview
       → POST /bookings  (stock alloué)
            ├─ cash  → POST /bookings/:id/cash-payment → confirmed
            └─ card  → PaymentIntent Stripe → confirmed
       → /sale/success + reçu HTML (print / mailto)
```

| Zone | Chemins clés |
|------|----------------|
| Auth / shell | `apps/pos/components/pos-login-form.tsx`, `pos-org-select.tsx`, `pos-shell-layout.tsx`, `middleware.ts` |
| Accueil | `apps/pos/config/home.ts`, `components/pos-home-actions.tsx` |
| Vente | `components/sale/pos-sale-screen.tsx`, `sale-search-panel.tsx`, `sale-cart-panel.tsx`, `sale-payment-bar.tsx` |
| Checkout | `lib/sale/sale-checkout.ts`, `cart-context.tsx`, `search-catalog.ts` |
| Reçus | `components/sale/pos-receipt.tsx`, `lib/sale/receipt.ts`, `pos-sale-success-content.tsx` |
| API cash script | `apps/api/scripts/test-pos-sale-cash.mjs` (`pnpm test:pos-sale-cash`) |

**URLs locales**

| App | URL | Compte |
|-----|-----|--------|
| POS | http://localhost:3003/login | Employé seed |
| API / Swagger | http://localhost:3000/api | — |
| Admin (vérif bookings) | http://localhost:3001 | `admin@africatourismgate.local` / `ChangeMe123!` |

---

## État actuel (août 2026)

| Domaine | État | Notes |
|---------|------|-------|
| Login employé + refresh + cookies | ✅ | Session staff |
| Sélection / changement d’organisation | ✅ | Branding UI + cookies |
| Shell tactile (thème clair/sombre) | ✅ | Boutons larges |
| Catalogue multi-verticales | ✅ | Activité, chambre, vol, véhicule, cabine |
| Config ligne (dates, créneaux, qty, dispo) | ✅ | Sheet de configuration |
| Panier + preview temps réel | ✅ | `checkout-preview` |
| Paiement espèces | ✅ | `POST …/cash-payment` |
| Paiement carte Stripe | ✅ | Si `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Page succès + attente confirmation carte | ✅ | `wait-booking-confirmed` |
| Reçu HTML + impression navigateur | ✅ | `window.print` + styles print |
| « PDF » via dialogue d’impression | ✅ | Pas de PDF serveur natif |
| Email reçu | ⚠️ | `mailto:` local seulement (pas d’email transactionnel serveur) |
| Historique ventes du jour | ❌ | Bouton « Bientôt disponible » (`config/home.ts`) |
| Forfaits (`packageId`) au POS | ❌ | Absents du catalogue caisse |
| Codes promo / promotions | ❌ | Non branchés dans le panier POS |
| Client nominatif (`customerUserId`) | ❌ | API prête ; UI POS n’envoie jamais le champ |
| Filtre catalogue par organisation | ✅ | Listes + preview/create avec `organizationId` ; `NULL` = partagé |
| Bookings orphelins `pending_payment` | ✅ | Cancel client POS (échec cash/intent, fermeture sheet, bouton succès) ; pas de cron TTL (risque web) |
| Tests unit/e2e dans `apps/pos` | ❌ | Aucun Playwright POS |
| CI GitHub Actions | ✅ | Job `pos` (lint + build) ; E2E POS → POS-10 |
| Déploiement prod | ⚠️ | Optionnel (`ATG_ENABLE_POS=1`, `pos.africatourismgate.org`) |
| Mode offline | ❌ | Hors scope (réseau API requis) |

### Note sur la roadmap globale (#73)

`docs/roadmap-development.md` est **aligné (août 2026)** : reçus / impression ✅ (HTML + print + mailto). Le livrable #73 est clos côté base ; les finitions restantes (historique, email serveur, PDF natif, CI, etc.) sont les livrables **POS-1+** de ce document.

---

## Bugs & dettes à corriger en premier

| ID | Problème | Impact | Livrable |
|----|----------|--------|----------|
| D1 | Bookings `pending_payment` orphelins si cash/Stripe échoue après création | Stock bloqué, panier « fantôme » | ✅ POS-2 |
| D2 | Catalogue non scopé à l’org sélectionnée | Multi-tenant incorrect / fuite de produits | ✅ POS-3 |
| D3 | Booking souvent au nom de l’employé (pas de client) | Ownership, emails, historique client faux | POS-4 |
| D4 | Aucun test POS + hors CI | Régressions silencieuses | ✅ POS-1 (CI) ; E2E → POS-10 |
| D5 | Doc roadmap globale obsolète sur les reçus | Mauvaises priorités | ✅ POS-0 |

---

## Phases

| Phase | Objectif |
|-------|----------|
| **A** | Stabiliser — CI, orphelins, scope org |
| **B** | Parcours caisse — client, historique, forfaits, promos |
| **C** | Reçus & notifications — email serveur, PDF natif |
| **D** | Qualité & prod — E2E, polish UX, déploiement |

---

## Tableau récapitulatif

| # | Phase | Livrable | Priorité | Branche PR | Dépend de |
|---|-------|----------|----------|------------|-----------|
| POS-0 | A | Alignement doc (reçus faits, ce fichier = source) | Haute | `chore/pos-roadmap-docs` | — |
| POS-1 | A | CI — build + lint `apps/pos` | Haute | `chore/ci-pos` | — |
| POS-2 | A | Annulation / cleanup bookings abandonnés | Haute | `fix/pos-orphan-bookings` | — |
| POS-3 | A | Catalogue filtré par organisation sélectionnée | Haute | `fix/pos-org-catalog-scope` ✅ | — |
| POS-4 | B | Sélecteur client (`customerUserId`) | Haute | `feature/pos-customer-select` | — |
| POS-5 | B | Historique ventes du jour | Haute | `feature/pos-sales-history` | POS-3 |
| POS-6 | B | Codes promo / remises au panier POS | Moyenne | `feature/pos-promo-codes` | — |
| POS-7 | B | Forfaits (`packageId`) au POS | Moyenne | `feature/pos-packages` | — |
| POS-8 | C | Email reçu transactionnel (serveur) | Moyenne | `feature/pos-receipt-email` | 79 (SMTP) |
| POS-9 | C | PDF reçu natif (serveur ou lib) | Basse | `feature/pos-receipt-pdf` | — |
| POS-10 | D | Tests E2E Playwright POS | Haute | `feature/pos-e2e-playwright` | POS-1 |
| POS-11 | D | Polish UX caisse (erreurs, retry, feedback tactile) | Moyenne | `feature/pos-ux-polish` | — |
| POS-12 | D | Déploiement POS prod non optionnel (si besoin métier) | Basse | `chore/pos-prod-enable` | POS-1, POS-10 |

### Ordre d’exécution recommandé

```
POS-0 → POS-1 → POS-2 → POS-3 → POS-4 → POS-5
                              ↘ POS-6 → POS-7
POS-10 (dès que POS-1 OK)
POS-8 → POS-9 (après SMTP / emails plateforme)
POS-11 en continu sur les PRs UI
POS-12 en dernier selon prod
```

### Priorités courtes (2–3 semaines)

| Priorité | Livrables |
|----------|-----------|
| **Critique** | POS-1, POS-2, POS-3, POS-4 |
| **Haute** | POS-5, POS-10 |
| **Moyenne** | POS-6, POS-7, POS-8, POS-11 |
| **Basse** | POS-9, POS-12 |

---

## Critères de done communs

- Une PR = un livrable testable sur `http://localhost:3003`
- Messages utilisateur en français
- Pas de régression cash / carte sur le parcours `/sale` → `/sale/success`
- Si API touchée : permissions RBAC cohérentes + Swagger à jour si endpoint public staff
- Plan de test décrit dans la PR

---

## Prompts détaillés (copier-coller)

### POS-0 — Alignement documentation

**Branche :** `chore/pos-roadmap-docs`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `chore/pos-roadmap-docs`.

Livrable POS-0 : Alignement doc POS
Références : docs/roadmap-development.md, docs/roadmap-pos.md, docs/presentation-plateforme.md

Mettre à jour roadmap-development.md :
- Marquer POS reçus / impression comme ✅ (HTML + print + mailto)
- Remplacer / renvoyer #73 vers docs/roadmap-pos.md (finitions restantes : email serveur, PDF natif, historique…)
- Ne pas inventer de features non présentes dans le code

Critères : docs cohérentes entre elles ; aucun statut faux sur les reçus.

À la fin : liste des fichiers doc modifiés.
```

---

### POS-1 — CI build + lint POS

**Branche :** `chore/ci-pos`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `chore/ci-pos`.

Livrable POS-1 : CI — build + lint apps/pos
Références : .github/workflows/ci.yml, apps/pos/package.json, apps/web (pattern CI existant)

Étendre le workflow GitHub Actions pour builder (et lint si script présent) apps/pos.
Réutiliser la même stratégie de cache / pnpm que les autres apps.
Ne pas bloquer toute la CI sur des apps optionnelles si le repo a déjà un pattern « continue-on-error » — préférer un job dédié `pos` qui doit passer.

Critères : PR rouge si `apps/pos` ne compile pas ; job visible dans Actions.

À la fin : fichiers CI + comment vérifier en local (pnpm --filter … lint/build).
```

---

### POS-2 — Cleanup bookings abandonnés (livré)

**Statut :** ✅ — `cancelAbandonedPosBooking` + annulation sur échec cash/intent, fermeture sheet carte, bouton manuel page succès. **Pas de job TTL API** (`pending_payment` aussi utilisé par le web).

**Branche historique :** `fix/pos-orphan-bookings`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `fix/pos-orphan-bookings`.

Livrable POS-2 : Annulation / cleanup des bookings POS abandonnés
Références :
- apps/pos/lib/sale/sale-checkout.ts, sale-payment-bar.tsx, sale-card-payment-sheet.tsx
- apps/api BookingEngine (cancel, restore stock)
- Statuts : pending_payment → cancelled

Problème : après POST /bookings, si cash-payment ou Stripe échoue / est abandonné, le booking reste pending_payment avec stock alloué.

À faire (côté POS + API minimale si besoin) :
1. Sur échec paiement ou fermeture sheet carte : proposer / déclencher annulation du booking créé (endpoint cancel existant si disponible).
2. Sur timeout d’attente confirmation carte : message clair + lien / action annuler.
3. Option API (si absente) : job ou règle « pending_payment POS > N minutes → cancel + restore stock » — seulement si simple et alignée BookingEngine.
4. Ne pas casser le parcours succès cash/carte.

Critères :
- Abandon paiement → stock restauré (vérifier admin / API)
- Pas de double annulation
- Messages FR explicites

À la fin : fichiers + scénario de test manuel (créer → abandonner → vérifier statut).
```

---

### POS-3 — Scope catalogue par organisation (livré)

**Statut :** ✅ — migration `organization_id` catalogue (NULL = partagé) ; listes API scopées ; POS `search-catalog` + preview/create envoient l’org session ; seed 2e org + activité exclusive.

**Branche historique :** `fix/pos-org-catalog-scope`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `fix/pos-org-catalog-scope`.

Livrable POS-3 : Catalogue POS filtré par organisation
Références :
- apps/pos/lib/sale/search-catalog.ts
- Session / cookies org (pos-org-select, auth)
- listActivities, listProperties, listFlights, listVehicles, listCabins (api-client)

Aujourd’hui l’org sélectionnée sert surtout au branding. Les listes catalogue n’envoient pas (ou pas correctement) organizationId.

Corriger pour que toute recherche / liste POS soit limitée à l’organisation de session.
Gérer le cas « pas d’org » : rediriger vers /select-org.
Vérifier que la preview et createBooking restent cohérents (pas de ligne hors org).

Critères : avec 2 orgs seed, la caisse org A ne voit pas les produits exclusifs org B.

À la fin : fichiers + test manuel multi-org.
```

**Test manuel multi-org (seed) :**
1. `pnpm db:sync` (migration `add_pos_second_org_exclusive_activity` + seeds)
2. POS login admin → sélectionner **Africa Tourism Gate** → recherche « Atelier exclusif » → **0 résultat**
3. Changer d’établissement → **Kinshasa Guichet Est** → « Atelier exclusif Guichet Est » **visible**
4. Produits partagés (ex. Gombe City Tour, `organization_id` NULL) visibles sur les deux orgs
5. Preview / createBooking avec org B + produit exclusif B → OK ; forcer un produit exclusif B sous org A → 400

**IDs seed :** `ORG_POS_GUICHET_EST`, `ACTIVITY_POS_EXCLUSIVE_GUICHET_EST` — voir `database/seeds/seed-ids.txt`

---

### POS-4 — Sélecteur client

**Branche :** `feature/pos-customer-select`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-customer-select`.

Livrable POS-4 : Client nominatif sur vente POS (customerUserId)
Références :
- packages/types/src/booking.ts (customerUserId)
- apps/pos/lib/sale/sale-checkout.ts (createBookingFromCart)
- API recherche utilisateurs / clients staff

UI tactile :
- Champ / sheet « Client » sur l’écran de vente (recherche email ou nom)
- Option « Client de passage » (pas de customerUserId) clairement labellisée
- createBooking envoie customerUserId quand sélectionné

Critères : booking créé visible côté admin avec le bon user ; emails confirmation au client si le flux email le permet.

À la fin : fichiers + test cash avec client sélectionné.
```

---

### POS-5 — Historique ventes du jour

**Branche :** `feature/pos-sales-history`

**Dépend de :** POS-3

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-sales-history`.

Livrable POS-5 : Historique ventes du jour
Références :
- apps/pos/config/home.ts (actions.history.comingSoon)
- apps/pos/components/pos-home-actions.tsx
- API list bookings staff (filtres date / org / createdBy)

Remplacer « Bientôt disponible » par une page /history (ou équivalent) :
- Liste des ventes du jour pour l’org courante (et idéalement l’employé connecté)
- Statut, total, mode paiement, n° booking
- Tap → détail ou réimpression reçu si booking confirmed
- Empty state FR + loading skeleton tactile

Réutiliser patterns admin bookings si possible via api-client ; UI adaptée POS (pas de DataTable dense admin).

Critères : après une vente cash, elle apparaît dans l’historique du jour ; bouton accueil actif.

À la fin : fichiers + test parcours vente → historique.
```

---

### POS-6 — Codes promo au POS

**Branche :** `feature/pos-promo-codes`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-promo-codes`.

Livrable POS-6 : Codes promo / remises dans le panier POS
Références :
- BookingEngine checkout-preview (promo déjà supporté côté web/API)
- apps/pos sale-cart-panel, cart-context, sale-checkout

Ajouter un champ code promo sur le panier POS.
Passer le code à checkout-preview et createBooking comme le fait le web.
Afficher remise + total mis à jour ; erreurs FR (code invalide / expiré).

Critères : même code valide que sur le web réduit le total à la caisse ; cash et carte OK.

À la fin : fichiers + test avec un code seed.
```

---

### POS-7 — Forfaits au POS

**Branche :** `feature/pos-packages`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-packages`.

Livrable POS-7 : Vente de forfaits (packageId) au POS
Références :
- packages/types booking items package
- apps/web parcours forfait (référence comportement)
- apps/pos search-catalog + sale-line-config-sheet

Étendre le catalogue POS avec le type « forfait ».
Config ligne adaptée (dates / voyageurs selon le modèle package existant).
Checkout via BookingEngine inchangé autant que possible.

Critères : ajouter un forfait seed au panier → preview OK → cash → confirmed.

À la fin : fichiers + test manuel forfait.
```

---

### POS-8 — Email reçu serveur

**Branche :** `feature/pos-receipt-email`

**Dépend de :** module email SMTP plateforme (#79 / emails existants)

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-receipt-email`.

Livrable POS-8 : Envoi email reçu POS (serveur)
Références :
- apps/api modules/email (templates existants booking_*)
- apps/pos pos-receipt / pos-sale-success-content (mailto actuel)

Remplacer ou compléter mailto par :
- Bouton « Envoyer le reçu par email » → API (booking confirmed + email destinataire)
- Template HTML reçu (logo org, lignes, total, mode paiement, n° booking)
- Si customerUserId : email du client par défaut ; sinon champ saisie email

Critères : email reçu en boîte (Mailhog / SMTP dev) ; pas de régression impression.

À la fin : fichiers + preview template + test envoi.
```

---

### POS-9 — PDF reçu natif

**Branche :** `feature/pos-receipt-pdf`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-receipt-pdf`.

Livrable POS-9 : PDF reçu natif
Références : apps/pos/components/sale/pos-receipt.tsx, lib/sale/receipt.ts

Aujourd’hui « PDF » = dialogue d’impression navigateur.
Ajouter génération PDF (lib client légère ou endpoint API) + bouton Télécharger PDF.
Garder impression HTML existante.

Critères : fichier PDF téléchargeable avec branding ; lisible sur mobile/tablette caisse.

À la fin : fichiers + test téléchargement.
```

---

### POS-10 — E2E Playwright POS

**Branche :** `feature/pos-e2e-playwright`

**Dépend de :** POS-1

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-e2e-playwright`.

Livrable POS-10 : Tests E2E Playwright apps/pos
Références :
- apps/web/tests/e2e (patterns)
- apps/api/scripts/test-pos-sale-cash.mjs
- apps/admin/tests/e2e/helpers/admin-auth.ts (inspiration auth)

Créer apps/pos/tests/e2e/ avec au minimum :
1. login employé → select-org → accueil
2. vente cash bout-en-bout (mock API ou env seed) → success + reçu visible
3. (optionnel) abandon paiement / historique si POS-2/POS-5 déjà mergés

Brancher le job dans CI (POS-1).

Critères : `pnpm --filter @africatourismgate/pos test:e2e` (ou script équivalent) vert en local et CI.

À la fin : fichiers specs + README court comment lancer.
```

---

### POS-11 — Polish UX caisse

**Branche :** `feature/pos-ux-polish`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-ux-polish`.

Livrable POS-11 : Polish UX POS
Références : sale-payment-bar, sale-line-config-sheet, pos-sale-screen, globals.css

Améliorer sans changer le métier :
- États erreur / retry explicites sur preview et paiement
- Désactiver double-submit encaissement
- Feedback loading sur boutons tactiles
- Empty states catalogue / panier
- Accessibilité basique (focus, aria sur sheets)

Ne pas refondre le design system ; rester cohérent avec le shell actuel.

Critères : parcours vente moins d’erreurs silencieuses ; pas de double charge cash.

À la fin : fichiers + checklist manuelle.
```

---

### POS-12 — Activation prod POS

**Branche :** `chore/pos-prod-enable`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `chore/pos-prod-enable`.

Livrable POS-12 : Déploiement POS prod
Références :
- ecosystem.config.cjs, scripts/pm2-start-pos.sh
- nginx/snippets/atg-pos-servers*.conf
- docs/production-domains.md
- ATG_ENABLE_POS

Documenter et (si demandé) activer le process PM2 + vhost nginx SSL pour pos.africatourismgate.org.
Vérifier variables d’env (API URL, Stripe publishable, cookies domaine).
Smoke test post-deploy : login → vente cash test → reçu.

Critères : checklist ops dans docs ; pas de secrets commités.

À la fin : doc ops + commandes de vérif.
```

---

## Plan de test manuel (régression caisse)

À rejouer après chaque livrable touchant la vente :

1. Login employé → sélection org → **Nouvelle vente**
2. Ajouter 1 activité (ou chambre) → vérifier preview total
3. **Espèces** → `/sale/success` → imprimer reçu
4. Nouvelle vente → **Carte** (si Stripe configuré) → success confirmé
5. Admin : booking `confirmed`, paiement cohérent, stock décrémenté
6. (Après POS-2) Abandonner un paiement carte → booking annulé / stock OK
7. (Après POS-3) Org A : pas d’« Atelier exclusif Guichet Est » ; org B : visible ; partagés sur les deux
8. (Après POS-4) Vente avec client → bon `customerUserId`
9. (Après POS-5) Vente visible dans historique du jour

Script API complémentaire : `pnpm test:pos-sale-cash`

---

## Hors scope (volontaire)

| Sujet | Raison |
|-------|--------|
| Mode offline / file d’attente locale | POS conçu pour guichet avec réseau API |
| Remplacer BookingEngine par un module Nest « POS » dédié | Trop large ; la caisse = façade booking |
| i18n multi-langue POS | FR métier guichet pour l’instant |
| Hardware printers ESC/POS | Impression navigateur suffit en V1 finitions |

---

## Lien avec les autres roadmaps

| Document | Lien POS |
|----------|----------|
| [roadmap-development.md](./roadmap-development.md) | Historique #42–44, #73 → ce fichier |
| [presentation-plateforme.md](./presentation-plateforme.md) | Statut ~85 % ; CI POS lint/build OK |
| Emails / SMTP (#79) | Prérequis POS-8 |
| Admin cash-payment | Même endpoint ; cohérence statut bookings |

---

## Suivi (cocher au merge)

- [x] POS-0 Doc alignée
- [x] POS-1 CI POS
- [x] POS-2 Orphelins / abandon paiement
- [x] POS-3 Scope org catalogue
- [ ] POS-4 Client nominatif
- [ ] POS-5 Historique du jour
- [ ] POS-6 Promos
- [ ] POS-7 Forfaits
- [ ] POS-8 Email reçu
- [ ] POS-9 PDF natif
- [ ] POS-10 E2E Playwright
- [ ] POS-11 UX polish
- [ ] POS-12 Prod enable
