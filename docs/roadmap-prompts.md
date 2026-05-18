# Africa Tourism Gate — Roadmap & prompts de développement

> Document pour guider les PRs et les sessions Cursor Agent.  
> Branche de base suggérée : `main`. **Une PR = un livrable = une branche.**

## Légende des phases

| Phase | Objectif |
|-------|----------|
| **0** | Fondations (auth, sécurité, client API) |
| **1** | Back-office admin |
| **2** | Catalogue & inventaire |
| **3** | Réservations & paiements |
| **4** | Site public voyageur |
| **5** | POS |
| **6** | Qualité, prod, croissance |

## État actuel du projet (référence)

| Élément | État |
|---------|------|
| Schéma MySQL + auto-seed | ✅ |
| ~50 modules API CRUD + Swagger | ✅ |
| UI login/register admin (config FR) | ✅ UI seulement |
| Scripts deploy / nginx / PM2 | ✅ |
| Site web | Page « Coming Soon » uniquement |
| Auth JWT | Variables `.env` seulement, pas de module |

## Prompt méta (modèle réutilisable)

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `[BRANCHE]`.

Livrable #N : [TITRE]
Références : apps/api (NestJS), apps/admin|web|pos (Next.js 14), packages/ui, packages/api-client, database/africatourismgate_database.sql, database/seeds/install.seed.sql.

Règles :
- Réutiliser patterns existants (CrudService, configs admin dans apps/admin/config/, composants @africatourismgate/ui).
- Ne pas refactorer hors scope.
- Respecter RBAC seeds si endpoints protégés.
- Pas de commit sauf si je le demande.

[PROMPT DÉTAILLÉ]

À la fin : résumer fichiers modifiés et comment tester localement (pnpm dev).
```

---

## Tableau récapitulatif

| # | Phase | Livrable | Priorité | Branche PR | Dépend de |
|---|-------|----------|----------|------------|-----------|
| 1 | 0 | Module Auth API | Critique | `feature/auth-api` | — |
| 2 | 0 | JWT & guards NestJS | Critique | `feature/api-jwt-guards` | 1 |
| 3 | 0 | DTOs auth & validation | Haute | `feature/auth-dtos-validation` | 1 |
| 4 | 0 | Client API typé | Haute | `feature/api-client-auth` | 1 |
| 5 | 0 | Connexion admin → API | Critique | `feature/admin-login-api` | 1, 4 |
| 6 | 0 | Inscription admin → API | Haute | `feature/admin-register-api` | 1, 5 |
| 7 | 0 | Session & middleware admin | Critique | `feature/admin-auth-middleware` | 5 |
| 8 | 0 | Mot de passe oublié | Moyenne | `feature/auth-password-reset` | 1 |
| 9 | 0 | RBAC sur endpoints | Haute | `feature/api-rbac-enforcement` | 2 |
| 10 | 1 | Shell dashboard admin | Critique | `feature/admin-dashboard-shell` | 7 |
| 11 | 1 | Page tableau de bord | Haute | `feature/admin-dashboard-home` | 10 |
| 12 | 1 | CRUD Organisations | Haute | `feature/admin-organizations` | 10, 9 |
| 13 | 1 | CRUD Utilisateurs | Haute | `feature/admin-users` | 10, 9 |
| 14 | 1 | CRUD Employés | Moyenne | `feature/admin-employees` | 13 |
| 15 | 1 | Gestion rôles & permissions | Haute | `feature/admin-rbac-ui` | 10, 9 |
| 16 | 1 | Journal audit RBAC | Basse | `feature/admin-rbac-audit-logs` | 15 |
| 17 | 1 | Paramètres organisation | Moyenne | `feature/admin-org-settings` | 12 |
| 18 | 2 | Destinations (admin) | Haute | `feature/admin-destinations` | 10 |
| 19 | 2 | Hébergements — propriétés | Haute | `feature/admin-properties` | 18 |
| 20 | 2 | Chambres & équipements | Haute | `feature/admin-rooms-amenities` | 19 |
| 21 | 2 | Disponibilités chambres | Haute | `feature/admin-room-availability` | 20 |
| 22 | 2 | Vols (catalogue) | Moyenne | `feature/admin-flights-catalog` | 10 |
| 23 | 2 | Location véhicules | Moyenne | `feature/admin-vehicle-rental` | 10 |
| 24 | 2 | Croisières | Moyenne | `feature/admin-cruises-catalog` | 10 |
| 25 | 2 | Activités | Moyenne | `feature/admin-activities-catalog` | 18 |
| 26 | 2 | Packages combinés | Moyenne | `feature/admin-packages` | 19, 22 |
| 27 | 3 | Logique métier réservation | Critique | `feature/api-booking-engine` | 21 |
| 28 | 3 | Booking items polymorphes | Haute | `feature/api-booking-items-logic` | 27 |
| 29 | 3 | Admin — liste réservations | Haute | `feature/admin-bookings` | 27, 10 |
| 30 | 3 | Admin — détail réservation | Haute | `feature/admin-booking-detail` | 29 |
| 31 | 3 | Intégration Stripe | Critique | `feature/stripe-payments` | 27 |
| 32 | 3 | Codes promo & promotions | Moyenne | `feature/promo-codes-checkout` | 27, 31 |
| 33 | 3 | Remboursements | Moyenne | `feature/payments-refunds` | 31 |
| 34 | 4 | Remplacer « Coming Soon » | Haute | `feature/web-homepage-v1` | — |
| 35 | 4 | Recherche hébergements | Haute | `feature/web-hotel-search` | 21, 34 |
| 36 | 4 | Fiche produit hébergement | Haute | `feature/web-property-detail` | 35 |
| 37 | 4 | Parcours réservation web | Critique | `feature/web-booking-checkout` | 27, 31, 35 |
| 38 | 4 | Compte client web | Haute | `feature/web-customer-account` | 1, 37 |
| 39 | 4 | Avis & notes | Moyenne | `feature/web-reviews` | 37 |
| 40 | 4 | Support client | Moyenne | `feature/web-support` | 34 |
| 41 | 4 | Fidélité OneKey | Basse | `feature/web-loyalty` | 38 |
| 42 | 5 | Shell POS | Haute | `feature/pos-shell-auth` | 1, 7 |
| 43 | 5 | Vente sur place | Haute | `feature/pos-quick-sale` | 27, 42 |
| 44 | 5 | Reçus & impression | Moyenne | `feature/pos-receipts` | 43 |
| 45 | 6 | Tests API (e2e) | Haute | `feature/api-e2e-tests` | 1, 27 |
| 46 | 6 | Tests E2E front | Moyenne | `feature/e2e-playwright` | 5, 37 |
| 47 | 6 | CI GitHub Actions | Haute | `feature/ci-github-actions` | — |
| 48 | 6 | Observabilité | Moyenne | `feature/api-observability` | — |
| 49 | 6 | i18n FR/EN | Moyenne | `feature/i18n-fr-en` | 10, 34 |
| 50 | 6 | OpenAPI → client | Basse | `feature/openapi-codegen` | 4 |
| 51 | 6 | Durcissement prod | Haute | `feature/production-hardening` | 2, 31 |
| 52 | 6 | Notifications email | Moyenne | `feature/email-notifications` | 8, 37 |

---

## MVP (priorité courte)

| # | Livrable |
|---|----------|
| 1–7, 9 | Auth complet |
| 10–13, 15 | Admin opérationnel |
| 18–21 | Catalogue hôtel |
| 27–31 | Réservation + Stripe |
| 34–37 | Site public booking |

## Ordre d'exécution recommandé

```
1 → 4 → 5 → 7 → 9 → 10 → 12 → 13 → 15 → 18 → 21 → 27 → 31 → 34 → 37
```

## Conventions de branches PR

- Préfixe : `feature/`, `fix/`, `chore/`
- Une PR = un livrable testable
- Titre PR exemple : `[#5] Admin: connect login form to auth API`

---

## Prompts détaillés (copier-coller dans Cursor Agent)

### #1 — Module Auth API

**Branche :** `feature/auth-api`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/auth-api`.

Livrable #1 : Module Auth API
Références : apps/api (NestJS), MySQL, database/seeds/install.seed.sql, entités TypeORM dans apps/api/src/entities/generated.

Implémente un module `auth` avec :
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout

Utiliser bcrypt pour password_hash, tables users et user_sessions. Ne jamais exposer password_hash. Retourner access + refresh JWT. DTOs + Swagger.

Critères : login admin@africatourismgate.local / ChangeMe123! OK ; register crée user active ; 401/409 clairs.

À la fin : fichiers modifiés + test via pnpm dev:api et Swagger.
```

### #2 — JWT & guards NestJS

**Branche :** `feature/api-jwt-guards`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-jwt-guards` (après merge #1).

Livrable #2 : JWT & guards NestJS
Références : .env JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, apps/api.

Ajouter JwtAuthGuard, JwtRefreshGuard, @Public(), @CurrentUser(), stratégie Passport JWT.
Protéger tous les contrôleurs sauf /health et routes auth. Swagger Bearer déjà configuré.

Critères : GET /api/users sans token → 401 ; avec token valide → 200.

À la fin : fichiers modifiés + commandes de test.
```

### #3 — DTOs auth & validation

**Branche :** `feature/auth-dtos-validation`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/auth-dtos-validation`.

Livrable #3 : DTOs auth & validation
ValidationPipe global déjà actif (whitelist, forbidNonWhitelisted).

Créer LoginDto, RegisterDto, RefreshTokenDto (class-validator). Messages d'erreur en français. Optionnel : @nestjs/throttler sur login.

Critères : body invalide → 400 avec détails ; pas de champs inconnus.

À la fin : fichiers modifiés + exemples curl/Swagger.
```

### #4 — Client API typé

**Branche :** `feature/api-client-auth`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-client-auth`.

Livrable #4 : Client API typé
Références : packages/api-client (ApiClient.request, health).

Étendre le client : login(), register(), refresh(), logout(), header Authorization optionnel. Types dans packages/types si pertinent.

Critères : utilisable depuis apps/admin avec NEXT_PUBLIC_API_URL.

À la fin : fichiers modifiés + exemple d'appel.
```

### #5 — Connexion admin → API

**Branche :** `feature/admin-login-api`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-login-api`.

Livrable #5 : Connexion admin → API
Références : apps/admin/components/admin-login-form.tsx, apps/admin/config/login.ts.

Brancher le formulaire sur POST /api/auth/login via @africatourismgate/api-client. Gérer loading/erreurs FR. Rediriger vers /dashboard après succès. Préparer stockage tokens (#7).

Critères : connexion seed admin OK ; mauvais mot de passe → message erreur.

À la fin : fichiers modifiés + test pnpm dev:admin.
```

### #6 — Inscription admin → API

**Branche :** `feature/admin-register-api`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-register-api`.

Livrable #6 : Inscription admin → API
Références : apps/admin/components/admin-register-form.tsx, apps/admin/config/register.ts.

Brancher inscription sur POST /api/auth/register. Créer user + rôle org_admin (user_role_assignments). Org par défaut du seed. Valider confirmPassword côté client.

Critères : nouveau compte peut se connecter ; email dupliqué → 409.

À la fin : fichiers modifiés + test manuel.
```

### #7 — Session & middleware admin

**Branche :** `feature/admin-auth-middleware`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-auth-middleware`.

Livrable #7 : Session & middleware admin
Next.js 14 App Router, routes (auth) vs (dashboard).

Middleware protégeant (dashboard) ; redirect /login si non auth ; redirect /dashboard si déjà auth sur /login. Refresh token silencieux si expiré.

Critères : URL protégée sans session → login ; session valide → accès dashboard.

À la fin : fichiers modifiés + scénarios de test.
```

### #8 — Mot de passe oublié

**Branche :** `feature/auth-password-reset`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/auth-password-reset`.

Livrable #8 : Mot de passe oublié
Lien « Mot de passe oublié » dans adminLoginFormConfig pointe vers #.

API POST /auth/forgot-password (token TTL 1h), POST /auth/reset-password. Pages /forgot-password et /reset-password?token=. En dev : logger le lien en console.

Critères : reset complet token valide ; token expiré → 400.

À la fin : fichiers modifiés + test flow complet.
```

### #9 — RBAC sur endpoints

**Branche :** `feature/api-rbac-enforcement`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-rbac-enforcement`.

Livrable #9 : RBAC sur endpoints
Références : install.seed.sql (permissions, roles, role_permissions).

PermissionsGuard + @RequirePermissions('properties.read'). Appliquer users, organizations, bookings, payments. super_admin bypass. Logger refus dans rbac_audit_logs si pertinent.

Critères : sans permission → 403 ; super_admin → accès total.

À la fin : fichiers modifiés + tests permission.
```

### #10 — Shell dashboard admin

**Branche :** `feature/admin-dashboard-shell`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-dashboard-shell`.

Livrable #10 : Shell dashboard admin
Références : packages/ui AppShell.

Layout (dashboard) : sidebar, header, user menu, logout, theme toggle. Nav : Dashboard, Organisations, Utilisateurs, Hébergements, Réservations, Paramètres. Style cohérent login/register.

Critères : navigation entre sections ; logout fonctionne.

À la fin : fichiers modifiés + capture routes.
```

### #11 — Page tableau de bord

**Branche :** `feature/admin-dashboard-home`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-dashboard-home`.

Livrable #11 : Page tableau de bord
Page /dashboard : cartes KPI (users, bookings, revenus, properties) via API paginée.

Critères : page charge authentifiée ; chiffres cohérents avec DB seed.

À la fin : fichiers modifiés + test.
```

### #12 — CRUD Organisations

**Branche :** `feature/admin-organizations`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-organizations`.

Livrable #12 : CRUD Organisations
Liste + create/edit organizations. Pagination, recherche nom/slug. Permissions organizations.read/write.

Critères : CRUD complet ; slug unique.

À la fin : fichiers modifiés + test.
```

### #13 — CRUD Utilisateurs

**Branche :** `feature/admin-users`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-users`.

Livrable #13 : CRUD Utilisateurs
Liste, filtres statut/org, édition, soft delete. Ne jamais afficher password_hash.

Critères : création par admin ; statuts active/suspended.

À la fin : fichiers modifiés + test.
```

### #14 — CRUD Employés

**Branche :** `feature/admin-employees`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-employees`.

Livrable #14 : CRUD Employés
UI employees liée users et organizations selon schéma entity.

Critères : liste par org ; FK intactes.

À la fin : fichiers modifiés + test.
```

### #15 — Gestion rôles & permissions

**Branche :** `feature/admin-rbac-ui`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-rbac-ui`.

Livrable #15 : Gestion rôles & permissions
Écrans roles, permissions, role_permissions, user_role_assignments. Matrice checkboxes.

Critères : modifier rôle non-system ; assigner rôle à user.

À la fin : fichiers modifiés + test.
```

### #16 — Journal audit RBAC

**Branche :** `feature/admin-rbac-audit-logs`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-rbac-audit-logs`.

Livrable #16 : Journal audit RBAC
Page lecture rbac_audit_logs : paginé, filtres date/action/user.

Critères : données visibles pour super_admin.

À la fin : fichiers modifiés + test.
```

### #17 — Paramètres organisation

**Branche :** `feature/admin-org-settings`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-org-settings`.

Livrable #17 : Paramètres organisation
Onglets organization_settings + organization_bank_accounts. Masquer IBAN partiel. Scope org user sauf super_admin.

Critères : sauvegarde OK ; validation email/devise.

À la fin : fichiers modifiés + test.
```

### #18 — Destinations (admin)

**Branche :** `feature/admin-destinations`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-destinations`.

Livrable #18 : Destinations (admin)
CRUD destinations + points_of_interest. Champs lat/lng si colonnes existent.

Critères : destination avec POI ; liste paginée.

À la fin : fichiers modifiés + test.
```

### #19 — Hébergements — propriétés

**Branche :** `feature/admin-properties`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-properties`.

Livrable #19 : Hébergements — propriétés
CRUD properties : nom, type, destination, statut, description. property_images, property_amenities.

Critères : fiche complète ; filtre par destination.

À la fin : fichiers modifiés + test.
```

### #20 — Chambres & équipements

**Branche :** `feature/admin-rooms-amenities`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-rooms-amenities`.

Livrable #20 : Chambres & équipements
CRUD rooms par property ; amenities globales réutilisables.

Critères : chambres par propriété ; amenities multi-select.

À la fin : fichiers modifiés + test.
```

### #21 — Disponibilités chambres

**Branche :** `feature/admin-room-availability`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-room-availability`.

Livrable #21 : Disponibilités chambres
UI calendrier/grille room_availability : dates, stock, prix/nuit. Bulk update sur plage.

Critères : créer dispo ; conflits gérés proprement.

À la fin : fichiers modifiés + test.
```

### #22 — Vols (catalogue)

**Branche :** `feature/admin-flights-catalog`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-flights-catalog`.

Livrable #22 : Vols (catalogue)
Admin airlines, airports, flights, flight_classes, flight_class_availability.

Critères : vol avec classes et dispo ; recherche par code vol.

À la fin : fichiers modifiés + test.
```

### #23 — Location véhicules

**Branche :** `feature/admin-vehicle-rental`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-vehicle-rental`.

Livrable #23 : Location véhicules
Admin rental_agencies, vehicle_categories, vehicles, vehicle_availability.

Critères : véhicule + agence + dispo dates.

À la fin : fichiers modifiés + test.
```

### #24 — Croisières

**Branche :** `feature/admin-cruises-catalog`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-cruises-catalog`.

Livrable #24 : Croisières
Admin cruise_lines, ships, cabins, cruise_sailings, itineraries, itinerary_ports, cruise_ports, cabin_availability.

Critères : sailing avec itinéraire ; cabines réservables.

À la fin : fichiers modifiés + test.
```

### #25 — Activités

**Branche :** `feature/admin-activities-catalog`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-activities-catalog`.

Livrable #25 : Activités
CRUD activity_providers, activities, activity_schedules liés destinations.

Critères : activité avec créneaux ; filtre destination.

À la fin : fichiers modifiés + test.
```

### #26 — Packages combinés

**Branche :** `feature/admin-packages`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-packages`.

Livrable #26 : Packages combinés
CRUD packages + package_items polymorphes. Afficher remise.

Critères : package multi-items ; prix cohérent.

À la fin : fichiers modifiés + test.
```

### #27 — Logique métier réservation

**Branche :** `feature/api-booking-engine`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-booking-engine`.

Livrable #27 : Logique métier réservation
BookingsService actuel = CrudService générique. Créer BookingEngine : vérif room_availability, calcul total, statuts pending→confirmed→cancelled, transactions DB. POST /bookings/checkout-preview et POST /bookings.

Critères : pas de réservation sans stock ; prix = somme items.

À la fin : fichiers modifiés + test API.
```

### #28 — Booking items polymorphes

**Branche :** `feature/api-booking-items-logic`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-booking-items-logic`.

Livrable #28 : Booking items polymorphes
Étendre engine pour booking_items multi-types (room, flight_class, vehicle, cabin, activity). Annulation libère stock.

Critères : réservation mixte OK.

À la fin : fichiers modifiés + test.
```

### #29 — Admin — liste réservations

**Branche :** `feature/admin-bookings`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-bookings`.

Livrable #29 : Admin — liste réservations
Tableau bookings paginé, filtres statut/date/client/org. Permission bookings.read.

Critères : données API live.

À la fin : fichiers modifiés + test.
```

### #30 — Admin — détail réservation

**Branche :** `feature/admin-booking-detail`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/admin-booking-detail`.

Livrable #30 : Admin — détail réservation
Page /dashboard/bookings/[id] : client, items, paiements, changer statut, annuler avec raison.

Critères : annulation via engine #27 ; historique statuts.

À la fin : fichiers modifiés + test.
```

### #31 — Intégration Stripe

**Branche :** `feature/stripe-payments`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/stripe-payments`.

Livrable #31 : Intégration Stripe
PaymentIntent ou Checkout Session, webhook payment_intent.succeeded, table payments. STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET dans .env.example. Suivre bonnes pratiques Stripe.

Critères : paiement test mode OK ; booking confirmed via webhook.

À la fin : fichiers modifiés + test Stripe CLI.
```

### #32 — Codes promo & promotions

**Branche :** `feature/promo-codes-checkout`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/promo-codes-checkout`.

Livrable #32 : Codes promo & promotions
Appliquer promo_codes/promotions dans checkout-preview. Validation dates, usage max.

Critères : code invalide → erreur ; réduction correcte.

À la fin : fichiers modifiés + test.
```

### #33 — Remboursements

**Branche :** `feature/payments-refunds`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/payments-refunds`.

Livrable #33 : Remboursements
POST /payments/:id/refund via Stripe, statut refunded, booking annulé seulement.

Critères : partiel/total ; idempotence webhook.

À la fin : fichiers modifiés + test.
```

### #34 — Remplacer « Coming Soon »

**Branche :** `feature/web-homepage-v1`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-homepage-v1`.

Livrable #34 : Remplacer Coming Soon
Remplacer apps/web/app/page.tsx par homepage marketing : hero, verticales, CTA recherche, footer, SEO layout.tsx.

Critères : responsive ; liens vers /hotels.

À la fin : fichiers modifiés + test pnpm dev:web.
```

### #35 — Recherche hébergements

**Branche :** `feature/web-hotel-search`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-hotel-search`.

Livrable #35 : Recherche hébergements
Page /hotels : destination, dates, voyageurs, résultats API, prix min nuit.

Critères : filtres OK ; état vide géré.

À la fin : fichiers modifiés + test.
```

### #36 — Fiche produit hébergement

**Branche :** `feature/web-property-detail`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-property-detail`.

Livrable #36 : Fiche produit hébergement
Page /hotels/[id] : galerie, amenities, chambres, calendrier, CTA Réserver.

Critères : prix selon dates ; mobile OK.

À la fin : fichiers modifiés + test.
```

### #37 — Parcours réservation web

**Branche :** `feature/web-booking-checkout`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-booking-checkout`.

Livrable #37 : Parcours réservation web
Panier → récap → Stripe → confirmation. Auth client. Engine #27 + Stripe #31.

Critères : E2E test mode ; page confirmation.

À la fin : fichiers modifiés + test.
```

### #38 — Compte client web

**Branche :** `feature/web-customer-account`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-customer-account`.

Livrable #38 : Compte client web
/account : profil, user_addresses, réservations, user_payment_methods. Rôle customer.

Critères : voir uniquement ses bookings.

À la fin : fichiers modifiés + test.
```

### #39 — Avis & notes

**Branche :** `feature/web-reviews`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-reviews`.

Livrable #39 : Avis & notes
Afficher reviews sur fiche ; formulaire post-séjour booking completed. Un avis par booking.

Critères : note moyenne affichée.

À la fin : fichiers modifiés + test.
```

### #40 — Support client

**Branche :** `feature/web-support`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-support`.

Livrable #40 : Support client
/support : FAQ + formulaire → support_tickets + support_messages.

Critères : ticket créé en DB.

À la fin : fichiers modifiés + test.
```

### #41 — Fidélité OneKey

**Branche :** `feature/web-loyalty`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/web-loyalty`.

Livrable #41 : Fidélité OneKey
Afficher loyalty_accounts ; points après paiement confirmé.

Critères : solde mis à jour.

À la fin : fichiers modifiés + test.
```

### #42 — Shell POS

**Branche :** `feature/pos-shell-auth`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-shell-auth`.

Livrable #42 : Shell POS
Layout POS tactile apps/pos, login employé, sélection org.

Critères : session employé ; UI grands boutons.

À la fin : fichiers modifiés + test pnpm dev:pos.
```

### #43 — Vente sur place

**Branche :** `feature/pos-quick-sale`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-quick-sale`.

Livrable #43 : Vente sur place
Recherche produit, panier, cash/Stripe, booking+payment via API #27/#31.

Critères : vente complète < 10 clics.

À la fin : fichiers modifiés + test.
```

### #44 — Reçus & impression

**Branche :** `feature/pos-receipts`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/pos-receipts`.

Livrable #44 : Reçus & impression
Reçu HTML/PDF imprimable + email optionnel. Template logo ATG.

Critères : impression navigateur OK.

À la fin : fichiers modifiés + test.
```

### #45 — Tests API (e2e)

**Branche :** `feature/api-e2e-tests`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-e2e-tests`.

Livrable #45 : Tests API e2e
Jest + supertest : health, auth login, booking mock, webhook Stripe mock. pnpm --filter api test:e2e.

Critères : suite verte sur DB test.

À la fin : fichiers modifiés + commande CI.
```

### #46 — Tests E2E front

**Branche :** `feature/e2e-playwright`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/e2e-playwright`.

Livrable #46 : Tests E2E front
Playwright : admin login + propriété ; web checkout Stripe test card.

Critères : 2 specs headless stables.

À la fin : fichiers modifiés + commande test.
```

### #47 — CI GitHub Actions

**Branche :** `feature/ci-github-actions`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/ci-github-actions`.

Livrable #47 : CI GitHub Actions
.github/workflows/ci.yml : pnpm install, lint, build api+admin+web, tests api. Cache pnpm.

Critères : PR déclenche CI ; échec si lint/build casse.

À la fin : fichiers modifiés.
```

### #48 — Observabilité

**Branche :** `feature/api-observability`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/api-observability`.

Livrable #48 : Observabilité
Logs structurés request id ; GET /health avec DB ping ; middleware timing.

Critères : unhealthy si DB down.

À la fin : fichiers modifiés + test health.
```

### #49 — i18n FR/EN

**Branche :** `feature/i18n-fr-en`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/i18n-fr-en`.

Livrable #49 : i18n FR/EN
next-intl admin + web ; preferred_language user ; externaliser configs login/register.

Critères : FR défaut ; EN sur auth + nav.

À la fin : fichiers modifiés + test bascule langue.
```

### #50 — OpenAPI → client

**Branche :** `feature/openapi-codegen`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/openapi-codegen`.

Livrable #50 : OpenAPI → client
Script codegen Swagger → packages/api-client. pnpm codegen:api documenté.

Critères : régénération sans erreur ; login typé.

À la fin : fichiers modifiés + README api.
```

### #51 — Durcissement prod

**Branche :** `feature/production-hardening`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/production-hardening`.

Livrable #51 : Durcissement prod
CORS strict, nginx HSTS/CSP, doc rotation JWT, rate limit auth, DATABASE_AUTO_SEED false en prod.

Critères : checklist sécurité PR ; pas de secrets commités.

À la fin : fichiers modifiés + doc.
```

### #52 — Notifications email

**Branche :** `feature/email-notifications`

```
Projet : Africa Tourism Gate (pnpm monorepo).
Branche : crée et bascule sur `feature/email-notifications`.

Livrable #52 : Notifications email
Module email NestJS : confirmation booking, reset password, bienvenue. Templates HTML. SMTP .env.example. Dev Mailpit/Ethereal.

Critères : emails envoyés en dev.

À la fin : fichiers modifiés + test.
```

---

## Fichiers associés

| Fichier | Description |
|---------|-------------|
| [roadmap-prompts.csv](./roadmap-prompts.csv) | Export CSV (import Excel, Notion, etc.) |
| [roadmap-development.pdf](./roadmap-development.pdf) | Roadmap visuelle PDF |
