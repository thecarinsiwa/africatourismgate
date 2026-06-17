# Africa Tourism Gate — Roadmap & prompts de développement (v2)

> **Mise à jour : juin 2026** — Document pour guider les PRs et les sessions Cursor Agent.  
> Branche de base : `main`. **Une PR = un livrable = une branche.**  
> Document précédent (obsolète) : [roadmap-prompts.md](./roadmap-prompts.md)

---

## Comment utiliser ce document

1. Consultez **l'état actuel** pour savoir ce qui est déjà en place.
2. Choisissez un livrable dans le **tableau récapitulatif** (numéros 53+).
3. Copiez le **prompt détaillé** correspondant dans Cursor Agent.
4. Ouvrez une branche `feature/…`, implémentez, testez avec `pnpm dev`.
5. Ne demandez un commit que lorsque vous êtes satisfait du résultat.
6. Pour les **PRs design / UX** (sans nouvelle feature API), utilisez plutôt :
   - Admin : [admin-design-improvements.md](./admin-design-improvements.md) (livrables UX-1 à UX-22)
   - Site public : [web-design-improvements.md](./web-design-improvements.md) (livrables WEB-UX-1 à WEB-UX-20)

### Prompt méta (modèle réutilisable)

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `[BRANCHE]`.

Livrable #N : [TITRE]
Références :
- apps/api (NestJS, prefix /api, Swagger http://localhost:3000/api)
- apps/admin | apps/web | apps/pos (Next.js 14, App Router)
- packages/ui, packages/api-client, packages/types
- database/africatourismgate_database.sql, database/seeds/install.seed.sql
- docs/roadmap-development.md, docs/production-domains.md
- docs/admin-design-improvements.md, docs/web-design-improvements.md (PRs design uniquement)

Règles :
- Réutiliser les patterns existants (CrudService, BookingEngineService, composants admin, @africatourismgate/ui, api-client).
- Ne pas refactorer hors scope.
- Respecter RBAC (PermissionsGuard + @RequirePermissions) sur les nouveaux endpoints sensibles.
- Messages utilisateur en français par défaut ; web i18n FR/EN/ES via apps/web/lib/i18n/.
- Pas de commit sauf si je le demande explicitement.

[PROMPT DÉTAILLÉ]

À la fin : résumer les fichiers modifiés et comment tester localement (pnpm dev, curl, Playwright si pertinent).
```

---

## État actuel du projet (juin 2026)

| Domaine | État | Notes |
|---------|------|-------|
| Schéma MySQL + seeds + `pnpm db:sync` | ✅ | Auto-schema/seed au démarrage API (configurable) |
| ~50 modules API CRUD + Swagger | ✅ | `apps/api/src/modules/resources/` |
| Auth JWT (login, register, refresh, logout, forgot/reset) | ✅ | Throttle sur login/forgot ; reset loggé en dev |
| Google OAuth (API + web callback) | ✅ | `apps/api/src/modules/auth/strategies/google.strategy.ts` |
| RBAC (PermissionsGuard) | ⚠️ | Appliqué sur ~12 contrôleurs (users, orgs, bookings, payments, roles…) — **pas** sur le catalogue (properties, flights, etc.) |
| Client API typé | ✅ | `packages/api-client` (~1700 lignes, auth + CRUD + booking + Stripe) |
| Admin — auth + middleware + session | ✅ | Refresh silencieux, routes protégées |
| Admin — shell + navigation | ✅ | Sidebar, groupes EN / labels FR |
| Admin — CRUD opérationnels | ✅ | Organisations, utilisateurs, employés, rôles, audit, paramètres org, hébergements, vols, locations, croisières, activités, forfaits, destinations, réservations |
| Admin — pages placeholder | ❌ | Paiements, codes promo, promotions, avis, tickets, fidélité, adresses, sessions… → `DashboardSectionPage` « Contenu à venir » |
| BookingEngine polymorphe | ✅ | Chambres, vols, véhicules, cabines, activités + promo checkout |
| Stripe (PaymentIntent + webhook) | ✅ | Remboursements API via `POST /payments/:id/refund` |
| Site web — homepage marketing | ✅ | Hero, onglets recherche, destinations, i18n FR/EN/ES |
| Site web — hôtels (recherche, fiche, checkout) | ✅ | API publique `public/accommodations` |
| Site web — compte client | ✅ | Profil, adresses, réservations, moyens de paiement, fidélité |
| Site web — avis, support, fidélité | ✅ | Tests Playwright présents |
| Site web — vols / voitures / croisières / tours | ❌ | Onglets UI présents mais **toutes les recherches redirigent vers `/hotels`** |
| POS — shell, auth, vente rapide | ✅ | Cash + Stripe, multi-types produits |
| POS — reçus / impression | ❌ | Page succès seulement |
| Tests Playwright web | ✅ | 7 specs dans `apps/web/tests/e2e/` |
| Tests API e2e | ❌ | Aucun spec Jest/supertest |
| Tests Playwright admin | ❌ | — |
| CI GitHub Actions | ❌ | Pas de `.github/workflows/` |
| Health check | ⚠️ | `GET /api/health` sans ping DB |
| Module email (SMTP) | ❌ | Reset password loggé en console en dev |
| i18n admin | ❌ | Textes FR en dur |
| OpenAPI codegen | ❌ | Client maintenu manuellement |
| Deploy prod (PM2, nginx, SSL) | ✅ | Voir README et `docs/production-domains.md` |

### Comptes & URLs locales

| App | URL | Identifiants seed |
|-----|-----|-------------------|
| API + Swagger | http://localhost:3000/api | — |
| Admin | http://localhost:3001/login | `admin@africatourismgate.local` / `ChangeMe123!` |
| Web | http://localhost:3002 | Inscription client via `/booking/login` |
| POS | http://localhost:3003/login | Compte employé seed |

---

## Livrables historiques (1–52) — statut

Les livrables du document v1 sont **essentiellement réalisés**. Exceptions notables :

| # | Livrable v1 | Statut |
|---|-------------|--------|
| 9 | RBAC sur endpoints | ⚠️ Partiel — voir #62 |
| 14–17, 22–26 | Admin catalogue | ✅ |
| 27–33 | Booking + Stripe + promo + refunds | ✅ |
| 34–41 | Site public | ⚠️ Hôtels OK ; autres verticales manquantes (#67–72) |
| 42–43 | POS shell + vente | ✅ |
| 44 | Reçus POS | ❌ → #73 |
| 45–47 | Tests API + CI | ❌ → #75–77 |
| 48 | Observabilité | ⚠️ → #78 |
| 49 | i18n FR/EN/ES | ⚠️ Web OK (FR/EN/ES), admin FR/EN manquant → #80 |
| 50 | OpenAPI codegen | ❌ → #81 |
| 51 | Durcissement prod | ⚠️ → #82 |
| 52 | Notifications email | ❌ → #79 |

---

## Légende des phases (suite)

| Phase | Objectif |
|-------|----------|
| **7** | Admin — sections placeholder → CRUD complet |
| **8** | API publique & site web — verticales au-delà des hôtels |
| **9** | Sécurité — RBAC étendu & multi-tenant |
| **10** | POS — reçus & finitions |
| **11** | Qualité — tests & CI |
| **12** | Emails & notifications transactionnelles |
| **13** | i18n admin & polish UX |
| **14** | Production, observabilité & scale |

---

## Tableau récapitulatif — livrables restants

| # | Phase | Livrable | Priorité | Branche PR | Dépend de |
|---|-------|----------|----------|------------|-----------|
| 53 | 7 | Admin — Paiements (liste + remboursement) | Haute | `feature/admin-payments` | — |
| 54 | 7 | Admin — Codes promo | Haute | `feature/admin-promo-codes` | — |
| 55 | 7 | Admin — Promotions | Moyenne | `feature/admin-promotions` | — |
| 56 | 7 | Admin — Modération avis | Moyenne | `feature/admin-reviews` | — |
| 57 | 7 | Admin — Tickets support | Moyenne | `feature/admin-support-tickets` | — |
| 58 | 7 | Admin — Messages support | Moyenne | `feature/admin-support-messages` | 57 |
| 59 | 7 | Admin — Comptes fidélité | Basse | `feature/admin-loyalty` | — |
| 60 | 7 | Admin — Sous-pages utilisateurs | Moyenne | `feature/admin-user-subpages` | — |
| 61 | 7 | Admin — Lignes de réservation | Basse | `feature/admin-booking-items` | — |
| 62 | 9 | RBAC complet endpoints catalogue | Haute | `feature/api-rbac-catalog` | — |
| 63 | 8 | API publique — recherche vols | Haute | `feature/api-public-flights` | — |
| 64 | 8 | API publique — recherche véhicules | Haute | `feature/api-public-vehicles` | — |
| 65 | 8 | API publique — recherche croisières | Moyenne | `feature/api-public-cruises` | — |
| 66 | 8 | API publique — recherche activités | Moyenne | `feature/api-public-activities` | — |
| 67 | 8 | Web — Vols (recherche + fiche + checkout) | Haute | `feature/web-flights` | 63 |
| 68 | 8 | Web — Locations véhicules | Haute | `feature/web-cars` | 64 |
| 69 | 8 | Web — Croisières | Moyenne | `feature/web-cruises` | 65 |
| 70 | 8 | Web — Activités / tours | Moyenne | `feature/web-activities` | 66 |
| 71 | 8 | Web — Forfaits combinés | Moyenne | `feature/web-packages` | 67, 34 |
| 72 | 8 | Web — Onglets recherche → routes dédiées | Haute | `feature/web-search-tabs-routing` | 67–70 |
| 73 | 10 | POS — Reçus imprimables | Moyenne | `feature/pos-receipts` | — |
| 74 | 9 | Upload images propriétés (API + admin) | Moyenne | `feature/property-image-upload` | — |
| 75 | 11 | Tests API e2e (Jest + supertest) | Haute | `feature/api-e2e-tests` | — |
| 76 | 11 | Tests E2E admin (Playwright) | Moyenne | `feature/admin-e2e-playwright` | — |
| 77 | 11 | CI GitHub Actions | Haute | `feature/ci-github-actions` | 75 |
| 78 | 14 | Health DB + observabilité | Moyenne | `feature/api-observability` | — |
| 79 | 12 | Module email SMTP | Haute | `feature/email-notifications` | — |
| 80 | 13 | i18n admin FR/EN | Moyenne | `feature/admin-i18n` | — |
| 81 | 14 | OpenAPI → codegen client | Basse | `feature/openapi-codegen` | — |
| 82 | 14 | Durcissement production | Haute | `feature/production-hardening` | 77 |
| 83 | 9 | Audit scope organisation (multi-tenant) | Haute | `feature/org-scoping-audit` | 62 |

---

## MVP v2 — priorités courtes

Objectif : **plateforme multi-verticales en production** avec admin complet et pipeline CI.

| Priorité | Livrables |
|----------|-----------|
| **Critique** | 53, 62, 63–64, 67–68, 72, 75, 77, 79, 82 |
| **Haute** | 54, 65–66, 69–70, 78, 83 |
| **Moyenne** | 55–58, 73–74, 76, 80 |
| **Basse** | 59–61, 71, 81 |

### Ordre d'exécution recommandé

```
62 → 53 → 54 → 63 → 64 → 67 → 68 → 72 → 75 → 77 → 79 → 82
         ↘ 65 → 69
         ↘ 66 → 70 → 71
```

---

## Conventions de branches PR

- Préfixe : `feature/`, `fix/`, `chore/`
- Une PR = un livrable testable
- Titre PR exemple : `[#67] Web: flight search, detail and checkout flow`
- Corps PR : résumé + plan de test + captures si UI

---

## Prompts détaillés (copier-coller dans Cursor Agent)

### #53 — Admin — Paiements (liste + remboursement)

**Branche :** `feature/admin-payments`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-payments`.

Livrable #53 : Admin — Paiements (liste + remboursement)
Références :
- Route placeholder : apps/admin/app/(dashboard)/[...segments]/page.tsx → section `paiements`
- Registry : apps/admin/config/admin-sections.registry.ts (apiResource: payments)
- API : apps/api/src/modules/resources/payments/ (RequirePermissions payments.read/refund)
- Stripe : apps/api/src/modules/stripe/stripe.service.ts (refund)
- Patterns UI : apps/admin/components/bookings/bookings-list.tsx

Créer apps/admin/app/(dashboard)/paiements/page.tsx avec :
- Tableau paginé des paiements (montant, statut, booking, client, date, méthode)
- Filtres : statut, date, organisation (super_admin)
- Page ou drawer détail avec lien vers réservation
- Action « Rembourser » (modal confirmation, montant partiel optionnel) → POST /api/payments/:id/refund
- Permission payments.read / payments.refund vérifiée côté UI (masquer boutons)

Critères :
- Liste charge avec token admin seed
- Remboursement test Stripe mode test OK
- Retirer la route du catch-all placeholder

À la fin : fichiers modifiés + test pnpm dev:admin.
```

### #54 — Admin — Codes promo

**Branche :** `feature/admin-promo-codes`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-promo-codes`.

Livrable #54 : Admin — Codes promo
Références :
- Section `paiements/codes-promo` dans admin-sections.registry.ts
- API : apps/api/src/modules/resources/promo-codes/
- Checkout promo : apps/api/src/modules/resources/bookings/booking-checkout-promo.service.ts
- Pattern CRUD admin : apps/admin/components/organizations/ ou destinations

Créer CRUD complet codes promo :
- Liste paginée, recherche par code
- Create/edit : code, type (% ou montant fixe), dates validité, usage max, statut actif
- Validation : code unique, dates cohérentes

Critères :
- Code créé utilisable dans checkout-preview web
- Page dédiée remplace le placeholder

À la fin : fichiers modifiés + test création code + preview checkout.
```

### #55 — Admin — Promotions

**Branche :** `feature/admin-promotions`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-promotions`.

Livrable #55 : Admin — Promotions
Références : API promotions, admin-sections `paiements/promotions`.

CRUD campagnes promotions (titre, description, dates, cible produit/destination, remise).
Lier visuellement aux promo_codes si le schéma le permet.

Critères : liste + create/edit ; cohérent avec schéma DB existant.

À la fin : fichiers modifiés + test.
```

### #56 — Admin — Modération avis

**Branche :** `feature/admin-reviews`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-reviews`.

Livrable #56 : Admin — Modération avis
Références :
- API : apps/api/src/modules/resources/reviews/reviews.service.ts
- Web : apps/web/components/hotels/hotel-reviews-section.tsx

Page admin /contenu/avis :
- Liste paginée reviews (note, auteur, entité, date, statut)
- Filtres par note, propriété, statut
- Actions : approuver / masquer / supprimer (soft delete)
- Détail avec lien booking si entityType=booking

Critères : modération visible ; avis masqué disparaît de la fiche hôtel web.

À la fin : fichiers modifiés + test.
```

### #57 — Admin — Tickets support

**Branche :** `feature/admin-support-tickets`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-support-tickets`.

Livrable #57 : Admin — Tickets support
Références :
- API support-tickets (RequirePermissions)
- Web : apps/web/components/support/support-ticket-form.tsx

Page /contenu/tickets :
- Liste tickets (sujet, client, statut, priorité, date)
- Filtres statut/priorité
- Détail ticket avec fil messages (#58 peut étendre)
- Changer statut (open → in_progress → resolved → closed)

Critères : ticket créé depuis web visible et traitable en admin.

À la fin : fichiers modifiés + test flux web → admin.
```

### #58 — Admin — Messages support

**Branche :** `feature/admin-support-messages`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-support-messages`.

Livrable #58 : Admin — Messages support
Références : API support-messages, page tickets #57.

Dans le détail ticket : thread messages chronologique, formulaire réponse admin, distinction client/agent.

Critères : réponse admin visible côté API ; statut ticket mis à jour.

À la fin : fichiers modifiés + test.
```

### #59 — Admin — Comptes fidélité

**Branche :** `feature/admin-loyalty`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-loyalty`.

Livrable #59 : Admin — Comptes fidélité
Références : API loyalty-accounts, web account-loyalty-panel.

Page /fidelite/comptes : liste comptes (user, solde points, tier, dernière activité), ajustement manuel points (super_admin), historique si table existe.

Critères : solde cohérent avec web ; placeholder remplacé.

À la fin : fichiers modifiés + test.
```

### #60 — Admin — Sous-pages utilisateurs

**Branche :** `feature/admin-user-subpages`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-user-subpages`.

Livrable #60 : Admin — Sous-pages utilisateurs
Sections placeholder :
- /utilisateurs/adresses → user-addresses
- /utilisateurs/moyens-paiement → user-payment-methods (masquer données sensibles)
- /utilisateurs/sessions → user-sessions (révoquer session)
- /utilisateurs/journaux-securite → rbac-audit-logs (lecture seule)

Réutiliser patterns table admin existants. Filtre par userId via query param ou sélecteur.

Critères : 4 pages fonctionnelles ; pas de placeholder.

À la fin : fichiers modifiés + test.
```

### #61 — Admin — Lignes de réservation

**Branche :** `feature/admin-booking-items`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-booking-items`.

Livrable #61 : Admin — Lignes de réservation
Références : API booking-items, bookings-list admin.

Page /reservations/lignes : tableau global booking_items (type, libellé, dates, montant, booking ref), filtres type/statut/bookingId, lien vers détail réservation.

Critères : données polymorphes lisibles ; pagination OK.

À la fin : fichiers modifiés + test.
```

### #62 — RBAC complet endpoints catalogue

**Branche :** `feature/api-rbac-catalog`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-rbac-catalog`.

Livrable #62 : RBAC complet endpoints catalogue
Références :
- Pattern : apps/api/src/modules/resources/users/users.controller.ts (@RequirePermissions)
- Seeds : database/seeds/install.seed.sql (permissions properties.*, flights.*, etc.)
- rbac.constants.ts

Appliquer @RequirePermissions sur les contrôleurs catalogue non protégés :
properties, rooms, room-availability, amenities, property-images, destinations,
flights, airlines, airports, flight-classes, flight-class-availability,
vehicles, rental-agencies, vehicle-categories, vehicle-availability,
cruise-*, activities, activity-providers, activity-schedules, packages, package-items,
promo-codes, promotions, reviews (admin write).

Endpoints publics (public/accommodations, auth, health, webhooks Stripe) restent @Public().
Lecture customer (bookings own, profile) : garder logique existante.

Logger refus dans rbac_audit_logs. super_admin bypass.

Critères :
- org_admin sans properties.read → GET /api/properties → 403
- super_admin → accès total
- Documenter mapping permission → contrôleur en commentaire rbac.constants.ts

À la fin : fichiers modifiés + tests curl avec rôles seed.
```

### #63 — API publique — recherche vols

**Branche :** `feature/api-public-flights`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-public-flights`.

Livrable #63 : API publique — recherche vols
Références :
- Pattern : apps/api/src/modules/public/accommodations/ (PublicAccommodationsService)
- Entités : flights, flight_classes, flight_class_availability, airports, airlines

Créer module public/flights :
- GET /api/public/flights/search?from=&to=&departureDate=&returnDate=&passengers=
- GET /api/public/flights/:id?departureDate=&returnDate=&passengers=
- @Public(), DTOs Swagger, pagination, prix min par classe, stock > 0

Critères : résultats cohérents avec seed demo ; dates invalides → 400.

À la fin : fichiers modifiés + exemples curl.
```

### #64 — API publique — recherche véhicules

**Branche :** `feature/api-public-vehicles`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-public-vehicles`.

Livrable #64 : API publique — recherche véhicules
Module public/vehicles :
- GET /api/public/vehicles/search?pickupLocation=&pickupDate=&returnDate=
- GET /api/public/vehicles/:id?pickupDate=&returnDate=
- Joindre agence, catégorie, tarif journalier, disponibilité

Critères : recherche par dates ; véhicule indisponible exclu.

À la fin : fichiers modifiés + curl.
```

### #65 — API publique — recherche croisières

**Branche :** `feature/api-public-cruises`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-public-cruises`.

Livrable #65 : API publique — recherche croisières
Module public/cruises :
- GET /api/public/cruises/search?sailFrom=&sailTo=&startDate=&endDate=
- GET /api/public/cruises/sailings/:id — détail sailing, itinéraire, cabines disponibles

Critères : cabines avec stock ; prix min affiché.

À la fin : fichiers modifiés + curl.
```

### #66 — API publique — recherche activités

**Branche :** `feature/api-public-activities`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-public-activities`.

Livrable #66 : API publique — recherche activités
Module public/activities :
- GET /api/public/activities/search?destination=&date=&participants=
- GET /api/public/activities/:id?date=&participants=
- Créneaux activity_schedules avec places restantes

Critères : filtre destination ; activité sans créneau exclue.

À la fin : fichiers modifiés + curl.
```

### #67 — Web — Vols (recherche + fiche + checkout)

**Branche :** `feature/web-flights`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-flights`.

Livrable #67 : Web — Vols (recherche + fiche + checkout)
Références :
- Pattern hôtels : apps/web/app/hotels/, components/hotels/
- Booking : apps/web/app/reservations/ ou booking/
- API #63, BookingEngine (item type flight_class)
- i18n : apps/web/lib/i18n/translations.ts

Créer :
- /flights — recherche + résultats
- /flights/[id] — détail vol + classes + CTA Réserver
- Intégration panier/checkout existant (booking_items flight_class)
- Traductions FR/EN pour les nouvelles chaînes

Critères :
- Parcours recherche → ajout panier → paiement Stripe test OK
- Responsive ; états vides/erreur gérés

À la fin : fichiers modifiés + test manuel + spec Playwright minimal optionnel.
```

### #68 — Web — Locations véhicules

**Branche :** `feature/web-cars`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-cars`.

Livrable #68 : Web — Locations véhicules
Routes /cars et /cars/[id], API #64, checkout vehicle item.
Réutiliser composants hotels (cards, sidebar booking, i18n).

Critères : dates pickup/return obligatoires ; prix total = jours × tarif.

À la fin : fichiers modifiés + test.
```

### #69 — Web — Croisières

**Branche :** `feature/web-cruises`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-cruises`.

Livrable #69 : Web — Croisières
Routes /cruises et /cruises/[id], API #65, sélection cabine, checkout cabin item.

Critères : itinéraire affiché ; cabine sans stock grisée.

À la fin : fichiers modifiés + test.
```

### #70 — Web — Activités / tours

**Branche :** `feature/web-activities`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-activities`.

Livrable #70 : Web — Activités / tours
Routes /activities et /activities/[id], API #66, choix créneau schedule, checkout activity_schedule item.

Critères : participants max respecté ; i18n FR/EN.

À la fin : fichiers modifiés + test.
```

### #71 — Web — Forfaits combinés

**Branche :** `feature/web-packages`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-packages`.

Livrable #71 : Web — Forfaits combinés
Routes /packages et /packages/[id].
API : packages + package_items (afficher remise, items inclus).
Checkout : réservation multi-items ou package dédié selon engine existant.

Critères : prix barré + prix package ; ajout panier multi-lignes.

À la fin : fichiers modifiés + test.
```

### #72 — Web — Onglets recherche → routes dédiées

**Branche :** `feature/web-search-tabs-routing`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-search-tabs-routing`.

Livrable #72 : Web — Onglets recherche → routes dédiées
Références : apps/web/components/home/search-tabs.tsx (handleSubmit redirige tout vers /hotels).

Modifier handleSubmit :
- hotels → /hotels?...
- flights → /flights?...
- cars → /cars?...
- cruises → /cruises?...
- tours → /activities?...

Mapper les champs du formulaire aux query params de chaque vertical (#67–70).
Si vertical pas encore implémentée, rediriger vers page « bientôt disponible » dédiée (pas /hotels).

Critères : chaque onglet mène à la bonne route ; params conservés.

À la fin : fichiers modifiés + test chaque onglet.
```

### #73 — POS — Reçus imprimables

**Branche :** `feature/pos-receipts`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-receipts`.

Livrable #73 : POS — Reçus imprimables
Références : apps/pos/app/(pos)/sale/success/page.tsx, organization branding API.

Après vente réussie :
- Composant reçu HTML (logo org, lignes, taxes, total, mode paiement, n° booking)
- Boutons Imprimer (window.print + @media print) et Télécharger PDF (optionnel : html2canvas ou API)
- Styles print-friendly

Critères : impression navigateur OK sur Chrome ; branding org si configuré.

À la fin : fichiers modifiés + test pnpm dev:pos.
```

### #74 — Upload images propriétés

**Branche :** `feature/property-image-upload`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/property-image-upload`.

Livrable #74 : Upload images propriétés (API + admin)
Références :
- Upload branding : organization-settings.controller.ts (multer, /uploads)
- Admin : property-images-section.tsx (URLs manuelles aujourd'hui)

API POST /api/properties/:id/upload-image (multipart, permissions properties.write).
Servir via /uploads/properties/ (main.ts serveStatic).
Admin : bouton upload + preview, fallback URL externe.

Critères : image uploadée visible sur fiche web hôtel ; taille max 5 Mo ; types jpeg/png/webp.

À la fin : fichiers modifiés + test upload.
```

### #75 — Tests API e2e

**Branche :** `feature/api-e2e-tests`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-e2e-tests`.

Livrable #75 : Tests API e2e (Jest + supertest)
Créer apps/api/test/e2e/ :
- health.spec.ts — GET /api/health
- auth.spec.ts — login seed admin, refresh, 401 sans token
- booking.spec.ts — checkout-preview chambre seed, création booking mock
- stripe-webhook.spec.ts — mock signature webhook payment_intent.succeeded

Config Jest e2e, script pnpm --filter api test:e2e.
DB test : DATABASE_NAME=africatourismgate_test ou transactions rollback.

Critères : suite verte en local ; documenter prérequis dans apps/api/README.md.

À la fin : fichiers modifiés + commande test.
```

### #76 — Tests E2E admin (Playwright)

**Branche :** `feature/admin-e2e-playwright`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-e2e-playwright`.

Livrable #76 : Tests E2E admin (Playwright)
Références : apps/web/tests/e2e/ (config Playwright).

Setup apps/admin/tests/e2e/ :
- admin-login.spec.ts — login seed → dashboard
- admin-property.spec.ts — créer propriété minimale
- admin-booking.spec.ts — liste réservations visible

Script test:e2e dans apps/admin/package.json.

Critères : 3 specs headless stables ; CI-ready (#77).

À la fin : fichiers modifiés + commande test.
```

### #77 — CI GitHub Actions

**Branche :** `feature/ci-github-actions`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/ci-github-actions`.

Livrable #77 : CI GitHub Actions
Créer .github/workflows/ci.yml :
- trigger : pull_request, push main
- Node 20, pnpm 9 (cache)
- steps : pnpm install → pnpm lint → pnpm build (api, admin, web)
- MySQL service container pour test:e2e API (#75) si faisable
- Optionnel : Playwright web sur PR label e2e

Critères : PR déclenche CI ; échec si lint/build casse.

À la fin : fichiers modifiés + note README Contributing.
```

### #78 — Health DB + observabilité

**Branche :** `feature/api-observability`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-observability`.

Livrable #78 : Health DB + observabilité
Étendre GET /api/health :
- Ping DB (SELECT 1) → status degraded si échec
- Version app (package.json) + uptime

Middleware NestJS : request-id (header X-Request-Id), log structuré JSON (method, path, status, durationMs).

Critères : health unhealthy si MySQL down ; request-id dans logs.

À la fin : fichiers modifiés + test arrêt MySQL.
```

### #79 — Module email SMTP

**Branche :** `feature/email-notifications`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/email-notifications`.

Livrable #79 : Module email SMTP
Créer apps/api/src/modules/email/ :
- EmailService (nodemailer), templates HTML (handlebars ou inline)
- Variables .env.example : SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
- Dev : log + option Mailpit (SMTP localhost:1025)

Intégrer :
- forgot-password → envoi lien (remplacer log-only en prod)
- booking confirmed (webhook Stripe ou status change)
- welcome register (optionnel)

Critères : reset password reçu en dev Mailpit ; pas de crash si SMTP absent (warn + log).

À la fin : fichiers modifiés + doc .env.example.
```

### #80 — i18n admin FR/EN

**Branche :** `feature/admin-i18n`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-i18n`.

Livrable #80 : i18n admin FR/EN
Références : apps/web/lib/i18n/ (LocaleProvider, translations.ts).

Porter le pattern vers apps/admin :
- Provider + hook useTranslations
- Externaliser login/register configs, dashboard-nav labels, messages erreur communs
- Language switcher header admin ; preferred_language user si dispo
- FR défaut, EN secondaire

Critères : bascule langue sur login + nav ; pas de régression FR.

À la fin : fichiers modifiés + test bascule.
```

### #81 — OpenAPI → codegen client

**Branche :** `feature/openapi-codegen`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/openapi-codegen`.

Livrable #81 : OpenAPI → codegen client
Script scripts/codegen-api-client.mjs :
- Fetch openapi-json depuis API running ou fichier exporté
- Générer types + méthodes dans packages/api-client/src/generated/
- Wrapper manuel conservé pour auth/session

pnpm codegen:api documenté dans README.

Critères : régénération sans erreur ; login typé ; diff reviewable.

À la fin : fichiers modifiés + commande codegen.
```

### #82 — Durcissement production

**Branche :** `feature/production-hardening`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/production-hardening`.

Livrable #82 : Durcissement production
Checklist implémentée :
- CORS strict (CORS_ORIGIN obligatoire en prod, pas de wildcard)
- DATABASE_AUTO_SEED=false documenté prod
- Helmet ou headers sécurité API (NestJS)
- nginx : HSTS, CSP baseline dans nginx/africatourismgate.conf
- Doc rotation JWT / STRIPE keys dans docs/
- Rate limit global API (ThrottlerModule app-level) en plus auth
- Vérifier aucun secret dans repo

Critères : checklist docs/production-hardening.md ; review sécurité PR.

À la fin : fichiers modifiés + checklist.
```

### #83 — Audit scope organisation (multi-tenant)

**Branche :** `feature/org-scoping-audit`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/org-scoping-audit`.

Livrable #83 : Audit scope organisation (multi-tenant)
Auditer et corriger filtrage organization_id :
- Liste bookings, payments, properties, employees → org_admin ne voit que son org
- super_admin voit tout
- Tests API : org_admin A ne accède pas ressource org B → 403 ou 404

Pattern : helper OrgScopeService ou filtre dans services existants (bookings.service.ts, etc.).

Critères : tests automatisés (#75) couvrent 2 orgs seed ; doc comportement multi-tenant.

À la fin : fichiers modifiés + tests + résumé audit.
```

---

## Fichiers associés

| Fichier | Description |
|---------|-------------|
| [roadmap-prompts.md](./roadmap-prompts.md) | Roadmap v1 (historique, livrables 1–52) |
| [roadmap-prompts.csv](./roadmap-prompts.csv) | Export CSV v1 |
| [production-domains.md](./production-domains.md) | URLs prod, nginx, dépannage VPS |
| [../README.md](../README.md) | Quick start monorepo |
| [../apps/api/README.md](../apps/api/README.md) | API, db:sync, scripts |

---

## Documents design UX/UI (complémentaires)

Ces roadmaps couvrent le **polish visuel** et la cohérence — à croiser avec les livrables fonctionnels ci-dessus (ex. #67–72 web) sans les mélanger dans une même PR si possible.

| Application | Document | Commande dev | Préfixe branche |
| ----------- | -------- | -------------- | --------------- |
| Admin | [admin-design-improvements.md](./admin-design-improvements.md) | `pnpm dev:admin` | `feature/admin-ui-*` |
| Site public | [web-design-improvements.md](./web-design-improvements.md) | `pnpm dev:web` | `feature/web-ui-*` |

Composants partagés : `packages/ui`, `packages/config/theme.css` — toute extraction UI doit profiter aux deux apps quand c’est pertinent.

---

## Notes pour l'agent Cursor

- **Ne pas réimplémenter** auth, booking engine, Stripe, ou CRUD admin déjà présents — étendre seulement.
- **Toujours vérifier** `database/seeds/install.seed.sql` pour permissions et données demo avant d'écrire des tests.
- **Swagger** est la source de vérité pour les contrats API : http://localhost:3000/api
- En cas de doute sur une page admin : chercher une page dédiée sous `apps/admin/app/(dashboard)/` avant le catch-all `[...segments]`.
- Les tests Playwright web existants sont une référence pour les nouveaux parcours (#67–70).
- Pour le design web sans feature : suivre [web-design-improvements.md](./web-design-improvements.md) ; commencer par **WEB-UX-1** (fondations).
- Pour le design admin sans feature : suivre [admin-design-improvements.md](./admin-design-improvements.md) ; commencer par **UX-1**.
