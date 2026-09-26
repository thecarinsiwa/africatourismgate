# Africa Tourism Gate — Tâches GitHub Module Trésorerie (Admin)

> **Document opérationnel** pour créer des issues GitHub destinées à intégrer le **module Trésorerie** côté Admin (`apps/admin`) avec contrats API Nest minimaux (`apps/api`).  
> **Mise à jour : septembre 2026** — Basé sur le plan feature `feature/tresorerie-admin-module`.

**Modèle de domaine (TRESO-001) :** [tresorerie-domain-model.md](./tresorerie-domain-model.md)

---

## Comment utiliser ce document

1. **Lire** la [prise en main](#prise-en-main-contributeur) et le [modèle de domaine](./tresorerie-domain-model.md).
2. **Parcourir** le [tableau récapitulatif](#tableau-récapitulatif-treso-001--treso-045).
3. **Copier** le bloc « Modèle GitHub » de chaque tâche dans une nouvelle issue.
4. **Adapter** labels, assignation et priorité.
5. Une PR d'implémentation = un scope testable (`feature/tresorerie-*`).

### Création rapide via CLI

```bash
gh issue create \
  --title "[TRESO] Spec domaine Trésorerie + schéma cible" \
  --label "admin,tresorerie,docs,priority:high" \
  --body-file docs/admin-tresorerie-github-tasks/issue-treso-001.md
```

---

## Prise en main contributeur

### Stack

| Domaine | Technologie |
| -------- | ----------- |
| Admin | Next.js 14 App Router, React 18, Tailwind, next-intl — port **3001** (`pnpm dev:admin`) |
| API | NestJS 10, TypeORM, MySQL, JWT, RBAC — port **3000** (`pnpm dev:api`) |
| Types | `packages/types` |
| UI | `@africatourismgate/ui` (DataTable, toasts, …) |

### Prérequis locaux

```bash
pnpm install
cp .env.example .env
pnpm dev:api    # terminal 1
pnpm dev:admin  # terminal 2 — http://localhost:3001
```

### Conventions issues & PR

| Élément | Convention |
| -------- | ----------- |
| Préfixe titre | `[TRESO]` |
| Branches | `feature/tresorerie-*` |
| Labels | `admin`, `tresorerie`, `enhancement` / `api` / `testing` / `i18n` / `docs`, `priority:high\|medium\|low` |
| Effort | S = 1–2 j, M = 3–5 j, L = 1–2 sem |

### Périmètre de ce lot

| Inclus | Exclu (épic SYSCOHADA / TRESO-041) |
| ------ | ----------------------------------- |
| UI Admin + API CRUD/workflow minimale | Plan comptable, journal, grand livre, bilan, clôtures |
| Migrations, RBAC, audit, budgets | Moteur d'écritures automatiques |
| Lien (0,N) ↔ `Bookings` | Refonte du module `payments` |
| Stub `accounting_links` | États financiers réglementaires |

### Documents liés

- [tresorerie-domain-model.md](./tresorerie-domain-model.md) — TRESO-001
- [web-github-tasks.md](./web-github-tasks.md) — convention documentaire
- Patterns : `apps/admin/config/dashboard-nav.config.ts`, `admin-route-permissions.ts`, `apps/api/src/modules/rbac/`

---

## Tableau récapitulatif TRESO-001 → TRESO-045

| ID        | Titre court                                              | Priorité | Type        | Effort |
| --------- | -------------------------------------------------------- | -------- | ----------- | ------ |
| TRESO-001 | Spec domaine Trésorerie + schéma cible — ✅              | Haute    | Docs / Spec | M      |
| TRESO-002 | Migration DB entrées de fonds + pivots réservations — ✅ | Haute    | API / DB    | M      |
| TRESO-003 | Migration DB états de besoin + sorties + pivots — ✅     | Haute    | API / DB    | M      |
| TRESO-004 | Migration DB budgets (période / activité / produit) — ✅ | Haute    | API / DB    | M      |
| TRESO-005 | Migration DB collaborateurs externes + jetons — ✅       | Haute    | API / DB    | M      |
| TRESO-006 | Migration / extension journal d’audit trésorerie — ✅    | Haute    | API / DB    | S      |
| TRESO-007 | Types partagés `packages/types` (enums, DTOs) — ✅       | Haute    | API / Types | M      |
| TRESO-008 | Catalogue RBAC `treasury.*` + sync seed — ✅             | Haute    | API / RBAC  | M      |
| TRESO-009 | Shell Admin nav + routes + permissions + registry — ✅   | Haute    | Admin       | M      |
| TRESO-010 | Scaffold i18n fr/en/es modules trésorerie — ✅           | Haute    | i18n        | S      |
| TRESO-011 | API Nest CRUD `fund-entries` + filtres — ✅              | Haute    | API         | L      |
| TRESO-012 | API liaison entrées ↔ réservations (0,N) + justificatifs — ✅ | Haute    | API         | M      |
| TRESO-013 | UI Admin liste + filtres entrées de fonds — ✅           | Haute    | Admin       | M      |
| TRESO-014 | UI Admin formulaire création/édition entrée — ✅         | Haute    | Admin       | L      |
| TRESO-015 | UI Admin fiche détail entrée + traçabilité — ✅          | Haute    | Admin       | M      |
| TRESO-016 | API Nest `expense-requests` CRUD + statuts — ✅          | Haute    | API         | L      |
| TRESO-017 | API Nest `fund-exits` liées à un état de besoin — ✅     | Haute    | API         | L      |
| TRESO-018 | API sorties ↔ réservations (0,N) + justificatifs — ✅    | Haute    | API         | M      |
| TRESO-019 | UI Admin liste/création états de besoin — ✅             | Haute    | Admin       | M      |
| TRESO-020 | UI Admin circuit validation → décaissement — ✅          | Haute    | Admin       | L      |
| TRESO-021 | UI Admin liste/création/détail sorties — ✅              | Haute    | Admin       | L      |
| TRESO-022 | API transitions d’état + historique immutable — ✅       | Haute    | API         | M      |
| TRESO-023 | API budgets mensuels / annuels — ✅                      | Moyenne  | API         | M      |
| TRESO-024 | API budgets par activité et produit/service — ✅         | Moyenne  | API         | M      |
| TRESO-025 | UI Admin budgets liste + formulaires — ✅                | Moyenne  | Admin       | M      |
| TRESO-026 | UI suivi budget vs réalisé (agrégats légers) — ✅        | Moyenne  | Admin       | M      |
| TRESO-027 | API invitation e-mail + jeton/lien sécurisé — ✅         | Moyenne  | API         | M      |
| TRESO-028 | API activate/deactivate + permissions externes — ✅      | Moyenne  | API         | M      |
| TRESO-029 | UI Admin gestion collaborateurs externes — ✅            | Moyenne  | Admin       | M      |
| TRESO-030 | Flux minimal état de besoin via jeton — ✅               | Moyenne  | Admin / API | L      |
| TRESO-031 | API journal d’audit (user, action, old/new) — ✅         | Haute    | API         | M      |
| TRESO-032 | UI Admin consultation audit trésorerie — ✅              | Haute    | Admin       | M      |
| TRESO-033 | Annulation / void d’opérations + gates — ✅              | Haute    | API / Admin | M      |
| TRESO-034 | Lien croisé fiche réservation → opérations — ✅         | Moyenne  | Admin       | S      |
| TRESO-035 | API agrégats rapports (période, source, mode) — ✅       | Moyenne  | API         | M      |
| TRESO-036 | UI Admin page rapports trésorerie — ✅                   | Moyenne  | Admin       | M      |
| TRESO-037 | Export CSV des opérations                                | Moyenne  | API / Admin | S      |
| TRESO-038 | Hub `/tresorerie` + cartes stats                         | Moyenne  | Admin       | S      |
| TRESO-039 | Stub pont comptable `accounting_link` + mapping          | Basse    | API         | M      |
| TRESO-040 | UI placeholder section Comptabilité                      | Basse    | Admin       | S      |
| TRESO-041 | Doc handoff épic SYSCOHADA suivant                       | Basse    | Docs        | S      |
| TRESO-042 | E2E smoke nav + CRUD entrée                              | Haute    | Testing     | M      |
| TRESO-043 | E2E happy path circuit sortie                            | Haute    | Testing     | M      |
| TRESO-044 | QA manuelle RBAC rôles trésorerie                        | Haute    | Testing     | M      |
| TRESO-045 | Sync OpenAPI + api-client + README module                | Basse    | Docs / API  | S      |

---

## Modèles GitHub — prêts à copier

### TRESO-001 — Spec domaine Trésorerie + schéma cible — ✅

**Labels :** `admin`, `tresorerie`, `docs`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-admin-module`  
**Livrable :** [`docs/tresorerie-domain-model.md`](./tresorerie-domain-model.md)

#### Modèle GitHub

```markdown
## Contexte

Le module Trésorerie n’existe pas encore. Avant migrations et API, il faut figer le modèle métier : entrées/sorties (0,N) ↔ réservations, états de besoin, budgets, externes, audit, pont comptable stub.

## Objectif

1. Documenter entités, cardinaux, enums (sources, modes paiement, statuts workflow)
2. Décrire le circuit : État de besoin → Validation → Autorisation → Décaissement → Justificatif → Enregistrement
3. Lister les permissions `treasury.*` cibles
4. Marquer SYSCOHADA hors scope (lien vers TRESO-041)

## Fichiers clés

- `docs/admin-tresorerie-github-tasks.md`
- `docs/tresorerie-domain-model.md`
- `apps/api/src/entities/generated/commerce.entity.ts` (réf. Bookings)

## Critères d'acceptation

- [x] Schéma entités + relations (0,N) documenté
- [x] Circuit de validation formalisé avec statuts
- [x] Hors-scope SYSCOHADA explicite
- [ ] Revue validée (tech lead / finance)

## Plan de test

Revue documentaire ; croisement avec TRESO-002…006.

## Références

- docs/admin-tresorerie-github-tasks.md (TRESO-001)
- docs/tresorerie-domain-model.md
```

---

### TRESO-002 — Migration DB entrées de fonds + pivots réservations — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-migration-fund-entries`  
**Livrable :** [`database/migrations/add_treasury_fund_entries.sql`](../database/migrations/add_treasury_fund_entries.sql) · [`apps/api/src/entities/fund-entry.entity.ts`](../apps/api/src/entities/fund-entry.entity.ts)

#### Modèle GitHub

```markdown
## Contexte

Les entrées de fonds doivent stocker montant, date, devise, source, mode, référence, auteur, observations, et lier 0..N réservations.

## Objectif

1. Créer migration `fund_entries` (+ pièces jointes métadonnées)
2. Créer pivot `fund_entry_bookings` (FK bookings)
3. Indexes filtres (date, devise, source, created_by)

## Fichiers clés

- `database/migrations/add_treasury_fund_entries.sql`
- `apps/api/src/entities/fund-entry.entity.ts`
- `apps/api/src/database/database.module.ts`

## Critères d'acceptation

- [x] Migration up/down OK (`pnpm db:sync` ; DOWN commenté en bas du SQL)
- [x] Pivot (0,N) avec Bookings (`fund_entry_bookings`)
- [x] Colonnes métier présentes (montant, date, devise, source, mode, référence, user, observations)

## Plan de test

```bash
pnpm db:sync
# SHOW TABLES LIKE 'fund_%';
```

## Références

- TRESO-001, Bookings existants
- docs/tresorerie-domain-model.md §4.1
```

### TRESO-003 — Migration DB états de besoin + sorties + pivots — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-migration-expense-exits`  
**Livrable :** [`database/migrations/add_treasury_expense_exits.sql`](../database/migrations/add_treasury_expense_exits.sql) · [`apps/api/src/entities/fund-exit.entity.ts`](../apps/api/src/entities/fund-exit.entity.ts)

#### Modèle GitHub

```markdown
## Contexte

Toute sortie doit être justifiée par un état de besoin ; sorties aussi (0,N) ↔ réservations.

## Objectif

1. Tables `expense_requests` (statuts workflow)
2. Tables `fund_exits` + FK obligatoire vers expense_request
3. Pivot `fund_exit_bookings` + justificatifs métadonnées

## Fichiers clés

- `database/migrations/add_treasury_expense_exits.sql`
- `apps/api/src/entities/fund-exit.entity.ts`
- `apps/api/src/database/database.module.ts`

## Critères d'acceptation

- [x] Impossible de créer une sortie sans état de besoin (`expense_request_id` NOT NULL + FK RESTRICT)
- [x] Statuts workflow persistés (`expense_requests.status` + `expense_request_status_history`)
- [x] Pivot (0,N) réservations (`fund_exit_bookings`)

## Plan de test

```bash
pnpm db:sync
# SHOW COLUMNS FROM fund_exits; — expense_request_id NOT NULL
```

## Références

- TRESO-001, TRESO-002
- docs/tresorerie-domain-model.md §4.2–4.3
```

---

### TRESO-004 — Migration DB budgets — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-migration-budgets`  
**Livrable :** [`database/migrations/add_treasury_budgets.sql`](../database/migrations/add_treasury_budgets.sql) · [`apps/api/src/entities/budget.entity.ts`](../apps/api/src/entities/budget.entity.ts)

#### Modèle GitHub

```markdown
## Contexte

Budgétisation mensuelle/annuelle, par activité, et liée à un produit/service.

## Objectif

1. Table `budgets` (type période, montants, devise, année/mois)
2. Liens optionnels activité / produit-service (polymorphe ou FKs typées)
3. Indexes période + type

## Fichiers clés

- `database/migrations/add_treasury_budgets.sql`
- `apps/api/src/entities/budget.entity.ts`
- `apps/api/src/database/database.module.ts`

## Critères d'acceptation

- [x] Support mensuel + annuel (`period_type` monthly|annual)
- [x] Support activité + produit/service (`scope_type` + `activity_id` / `product_type`+`product_id`)
- [x] Migration réversible (DOWN commenté en bas du SQL)

## Plan de test

```bash
pnpm db:sync
# INSERT smoke mensuel / annuel / activité / produit
```

## Références

- TRESO-001
- docs/tresorerie-domain-model.md §4.4
```

---

### TRESO-005 — Migration DB collaborateurs externes + jetons — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-migration-external-access`  
**Livrable :** [`database/migrations/add_treasury_external_access.sql`](../database/migrations/add_treasury_external_access.sql) · [`apps/api/src/entities/treasury-external.entity.ts`](../apps/api/src/entities/treasury-external.entity.ts)

#### Modèle GitHub

```markdown
## Contexte

Intervenants externes : accès par e-mail, jeton/lien sécurisé, permissions, activation/désactivation.

## Objectif

1. Tables collaborateurs externes (email, statut actif)
2. Jetons d’accès (hash, expiry, scopes)
3. Traçabilité minimale des actions (lien audit TRESO-006)

## Fichiers clés

- `database/migrations/add_treasury_external_access.sql`
- `apps/api/src/entities/treasury-external.entity.ts`
- `apps/api/src/database/database.module.ts`

## Critères d'acceptation

- [x] Email unique par org (`uk_treasury_external_collaborators_org_email`)
- [x] Jeton stocké hashé + expiration (`token_hash`, `expires_at`)
- [x] Flag active/inactive (`is_active`)

## Plan de test

```bash
pnpm db:sync
# UNIQUE (organization_id, email) ; FK expense_requests.requested_by_external_id
```

## Références

- TRESO-001, TRESO-027
- docs/tresorerie-domain-model.md §4.5
```

---

### TRESO-006 — Migration / extension journal d’audit trésorerie — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-migration-audit`  
**Livrable :** [`database/migrations/add_treasury_audit_logs.sql`](../database/migrations/add_treasury_audit_logs.sql) · [`apps/api/src/entities/treasury-audit-log.entity.ts`](../apps/api/src/entities/treasury-audit-log.entity.ts)

#### Modèle GitHub

```markdown
## Contexte

Opérations sensibles : user, date, action, anciennes/nouvelles valeurs. Réutiliser ou étendre les patterns `rbac-audit-logs` / security logs existants.

## Objectif

1. Table `treasury_audit_logs` (ou extension catalogue audit)
2. Champs entity_type, entity_id, action, actor_id, old_json, new_json, created_at

## Fichiers clés

- `database/migrations/add_treasury_audit_logs.sql`
- `apps/api/src/entities/treasury-audit-log.entity.ts`
- `apps/api/src/database/database.module.ts`
- Pattern : `apps/api/src/modules/rbac/rbac-audit.service.ts`

## Critères d'acceptation

- [x] Schéma audit adapté trésorerie (`entity_type`, `action`, `old_json`/`new_json`)
- [x] Indexes entity + date
- [x] Pas de perte d’historique (append-only : pas de `updated_at` / `deleted_at`)

## Plan de test

```bash
pnpm db:sync
# INSERT exemple create fund_entry ; pas d’UPDATE métier
```

## Références

- TRESO-031, rbac-audit-logs existants
- docs/tresorerie-domain-model.md §4.6
```

---

### TRESO-007 — Types partagés packages/types — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-shared-types`  
**Livrable :** [`packages/types/src/treasury.ts`](../packages/types/src/treasury.ts)

#### Modèle GitHub

```markdown
## Contexte

Admin et API doivent partager enums/DTOs (comme `packages/types/src/booking.ts`).

## Objectif

1. Créer `packages/types/src/treasury.ts` (FundEntry, ExpenseRequest, FundExit, Budget, ExternalCollaborator, Audit…)
2. Exporter depuis le barrel package
3. Aligner noms avec DTOs Nest futurs

## Fichiers clés

- `packages/types/src/treasury.ts`
- `packages/types/src/index.ts`

## Critères d'acceptation

- [x] Enums workflow et sources documentés (+ constantes runtime `FUND_ENTRY_SOURCES`, etc.)
- [x] Types consommables Admin + API (Create/Update/ListQuery)
- [x] Build package types OK

## Plan de test

```bash
pnpm --filter @africatourismgate/types build
```

## Références

- TRESO-001, packages/types/src/booking.ts
- docs/tresorerie-domain-model.md
```

---

### TRESO-008 — Catalogue RBAC treasury.* + sync seed — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-rbac`  
**Livrable :** migration + `ensure-rbac-permissions` + `TREASURY_PERMISSION_CODES`

#### Permissions `treasury.*` (figées)

| Code | ID | Usage |
| ---- | -- | ----- |
| `treasury.read` | …001057 | Navigation / listes / fiches |
| `treasury.entries.write` | …001058 | CRUD entrées |
| `treasury.exits.write` | …001059 | CRUD sorties |
| `treasury.expense_requests.create` | …001060 | Créer / soumettre besoins |
| `treasury.expense_requests.validate` | …001061 | Validation |
| `treasury.expense_requests.authorize` | …001062 | Autorisation dépense |
| `treasury.budgets.write` | …001063 | CRUD budgets |
| `treasury.reports.read` | …001064 | Rapports / export |
| `treasury.externals.manage` | …001065 | Collaborateurs externes |
| `treasury.void` | …001066 | Annulation opérations |
| `treasury.audit.read` | …001067 | Journal d’audit |
| `treasury.accounting_link.read` | …001068 | Stub pont comptable |

#### Profils → permissions (`TREASURY_ROLE_PROFILE_PERMISSIONS`)

| Profil | Permissions |
| ------ | ----------- |
| Créateur | `read` + `expense_requests.create` |
| Valideur | + `expense_requests.validate` |
| Autorisateur | + `authorize`, `externals.manage`, `void` |
| Trésorier | `read` + `entries.write` + `exits.write` |
| Contrôle | `read` + `reports.read` + `audit.read` + `accounting_link.read` |
| Finance admin | toutes |

#### Modèle GitHub

```markdown
## Contexte

Permissions fines trésorerie. Pattern `{resource}.{action}` + permissions métier.

## Objectif

1. Seed / ensure-rbac-permissions / migration SQL
2. Constantes `TREASURY_PERMISSION_CODES` + profils dans rbac.constants.ts
3. Documenter mapping rôles

## Fichiers clés

- `apps/api/src/modules/rbac/rbac.constants.ts`
- `apps/api/src/database/ensure-rbac-permissions.ts`
- `apps/api/scripts/sync-rbac-permissions.mjs`
- `database/migrations/add_treasury_rbac_permissions.sql`
- `database/seeds/install.seed.sql` / `install.seed.prod.sql`

## Critères d'acceptation

- [x] Permissions `treasury.*` synchronisées
- [x] super_admin bypass inchangé (grant all + PermissionsGuard)
- [x] Liste documentée dans ce doc + domain model §7

## Plan de test

```bash
pnpm db:sync
pnpm --filter @africatourismgate/api sync:rbac
# SELECT code FROM permissions WHERE code LIKE 'treasury.%';
```

## Références

- TRESO-044, admin-route-permissions (TRESO-009)
- docs/tresorerie-domain-model.md §7
```

---

### TRESO-009 — Shell Admin nav + routes + permissions + registry — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-admin-shell`  
**Livrable :** groupe nav `/tresorerie/*` + stubs + registry + `treasury.*` route gates

#### Modèle GitHub

```markdown
## Contexte

Aucun groupe « Trésorerie » dans la nav. Pattern : nav + `ADMIN_ROUTE_ACCESS_RULES` + `admin-sections.registry`.

## Objectif

1. Groupe nav `/tresorerie` (hub, entrées, sorties, besoins, budgets, rapports, externes, audit, compta placeholder)
2. Règles permissions routes
3. Pages stub `page.tsx` + `*PageContent` vides ou « bientôt »
4. Entrées registry sections

## Fichiers clés

- `apps/admin/config/dashboard-nav.config.ts`
- `apps/admin/config/admin-route-permissions.ts`
- `apps/admin/config/admin-sections.registry.ts`
- `apps/admin/app/(dashboard)/tresorerie/**`
- `apps/admin/components/pages/tresorerie-stub-page-content.tsx`
- `apps/admin/messages/{fr,en,es}/nav.json` + `pages.json`

## Critères d'acceptation

- [x] Nav visible selon permissions (`treasury.read` et sous-permissions)
- [x] Routes FR cohérentes (`/tresorerie/...`)
- [x] Middleware / RouteAccessGate OK (matcher dérivé du nav)

## Plan de test

Connexion admin ; ouvrir `/tresorerie` et chaque sous-route.

## Références

- TRESO-010, pattern /paiements
```

---

### TRESO-010 — Scaffold i18n fr/en/es modules trésorerie — ✅

**Labels :** `admin`, `tresorerie`, `i18n`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-i18n-scaffold`  
**Livrable :** `messages/{fr,en,es}/modules/treasury.json` + enregistrement `ADMIN_MODULE_NAMES`

#### Modèle GitHub

```markdown
## Contexte

Admin i18n via `messages/{fr,en,es}/` + `pnpm check:admin-i18n`.

## Objectif

1. Créer modules JSON treasury (pages, listes, formulaires, workflow, erreurs)
2. Clés nav + pages (déjà posées en TRESO-009)
3. Parité fr/en/es

## Fichiers clés

- `apps/admin/messages/{fr,en,es}/modules/treasury.json`
- `apps/admin/lib/i18n/load-messages.ts`
- `apps/admin/messages/*/nav.json` + `pages.json`

## Critères d'acceptation

- [x] Parité i18n validée (`pnpm check:admin-i18n`)
- [x] Aucune clé manquante pour shell TRESO-009

## Plan de test

```bash
pnpm check:admin-i18n
```

## Références

- TRESO-009
```

---

### TRESO-011 — API Nest CRUD fund-entries + filtres — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-fund-entries`  
**Livrable :** `apps/api/src/modules/resources/fund-entries/**` + enregistrement `ApiResourcesModule`

#### Modèle GitHub

```markdown
## Contexte

Contrats API minimaux pour alimenter l’Admin : liste paginée, CRUD, champs métier.

## Objectif

1. Module `resources/fund-entries` (controller, service, DTOs)
2. `@RequirePermissions` treasury read/write
3. Filtres : date, devise, source, mode, bookingId
4. Enregistrer `createdBy` depuis JWT

## Fichiers clés

- `apps/api/src/modules/resources/fund-entries/**`
- DTOs create/update/list
- Swagger / OpenAPI

## Critères d'acceptation

- [x] CRUD + pagination
- [x] Champs : montant, date, devise, source, mode, référence, observations
- [x] RBAC appliqué (`treasury.read` / `treasury.entries.write`)
- [x] Spec OpenAPI à jour (tags Swagger `fund-entries`)

## Plan de test

```bash
pnpm dev:api
# smoke Swagger / curl CRUD
```

## Références

- TRESO-002, TRESO-008, packages/types treasury
```

---

### TRESO-012 — API liaison entrées ↔ réservations + justificatifs — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-fund-entry-links`  
**Livrable :** attach/detach bookings + upload/list/delete attachments sur `fund-entries`

#### Modèle GitHub

```markdown
## Contexte

Cardinalité (0,N) entrée ↔ bookings ; justificatifs optionnels.

## Objectif

1. Endpoints attach/detach bookingIds
2. Validation existence bookings
3. Métadonnées fichiers justificatifs (reuse pattern payment proofs si possible)

## Fichiers clés

- `apps/api/src/modules/resources/fund-entries/**`
- `booking-payment-proof` pattern

## Critères d'acceptation

- [x] 0, 1 ou N réservations (`POST/DELETE …/bookings`)
- [x] Erreur claire si booking inexistant (`404 Booking(s) not found: …`)
- [x] Justificatifs listables sur l’entrée (`GET …/attachments`, inclus dans `GET :id`)

## Plan de test

Créer entrée sans / avec 1 / avec N bookings ; upload justificatif.

## Références

- TRESO-011, Bookings
```

---

### TRESO-013 — UI Admin liste + filtres entrées — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-fund-entries-list`  
**Livrable :** `fund-entries-list.tsx` + `tresorerie-entrees-page-content.tsx` + `listFundEntries` api-client

#### Modèle GitHub

```markdown
## Contexte

Pattern DataTable + `getApiClient` + `AdminListPageHeader`.

## Objectif

1. `fund-entries-list.tsx` + page content
2. Filtres date/devise/source
3. Lien vers création et détail
4. PermissionGate write

## Fichiers clés

- `apps/admin/components/treasury/fund-entries-list.tsx`
- `apps/admin/components/pages/tresorerie-entrees-page-content.tsx`
- `apps/admin/app/(dashboard)/tresorerie/entrees/page.tsx`

## Critères d'acceptation

- [x] Liste paginée
- [x] Filtres fonctionnels (date, devise, source, search)
- [x] i18n
- [x] Empty / error states

## Plan de test

`pnpm dev:admin` + API ; scénarios filtres.

## Références

- destinations-list / payments-list
```

---

### TRESO-014 — UI Admin formulaire création/édition entrée — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-fund-entry-form`  
**Livrable :** `fund-entry-form.tsx` + attachments + routes `nouveau` / `[id]`

#### Modèle GitHub

```markdown
## Contexte

Formulaire complet + multi-select réservations.

## Objectif

1. Form create/edit (montant, date, devise, source, mode, référence, observations)
2. Sélecteur multi-réservations (recherche)
3. Upload / rattachement justificatifs
4. Validation client + toasts erreurs API

## Fichiers clés

- `apps/admin/components/treasury/fund-entry-form.tsx`
- `apps/admin/components/treasury/fund-entry-attachments-section.tsx`
- `apps/admin/app/(dashboard)/tresorerie/entrees/nouveau/page.tsx`
- `apps/admin/app/(dashboard)/tresorerie/entrees/[id]/page.tsx`

## Critères d'acceptation

- [x] Create + edit OK
- [x] 0..N bookings
- [x] Permissions write
- [x] i18n fr/en/es

## Plan de test

Créer entrée liée à 2 réservations ; éditer ; vérifier liste.

## Références

- TRESO-011, TRESO-012
```

---

### TRESO-015 — UI Admin fiche détail entrée + traçabilité — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-fund-entry-detail`  
**Livrable :** `fund-entry-view-page.tsx` + route `[id]/voir` (void/audit placeholders)

#### Modèle GitHub

```markdown
## Contexte

Traçabilité : auteur, dates, bookings, justificatifs, lien audit si dispo.

## Objectif

1. View page lecture seule + actions (edit/void selon droits)
2. Afficher historique / audit lié
3. Liens vers réservations

## Fichiers clés

- `apps/admin/components/treasury/fund-entry-view-page.tsx`
- `apps/admin/app/(dashboard)/tresorerie/entrees/[id]/voir/page.tsx`

## Critères d'acceptation

- [x] Toutes métadonnées visibles
- [x] Liens bookings cliquables (`/reservations/:id`)
- [x] Gate permissions (`treasury.entries.write` / `treasury.void`)

## Plan de test

Ouvrir détail d’une entrée seed/test.

## Références

- TRESO-031, TRESO-033 (placeholders jusqu’aux APIs)
```

---

### TRESO-016 — API Nest expense-requests CRUD + statuts — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-expense-requests`  
**Livrable :** `apps/api/src/modules/resources/expense-requests/**` + api-client

#### Modèle GitHub

```markdown
## Contexte

État de besoin créé par user interne ou externe autorisé.

## Objectif

1. Module `expense-requests` CRUD + list filters
2. Statuts initiaux (draft, submitted, …)
3. Permissions create vs validate séparées si possible
4. DTOs alignés `packages/types`

## Fichiers clés

- `apps/api/src/modules/resources/expense-requests/**`

## Critères d'acceptation

- [x] CRUD + pagination
- [x] Statuts persistés (`draft` à la création + historique)
- [x] RBAC (`treasury.read` / `treasury.expense_requests.create` ; transitions validate/authorize → TRESO-022)
- [x] OpenAPI (tag `expense-requests`)

## Plan de test

Swagger smoke create/list/get/patch.

## Références

- TRESO-003, TRESO-008
```

---

### TRESO-017 — API Nest fund-exits liées à un état de besoin — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-fund-exits`  
**Livrable :** `apps/api/src/modules/resources/fund-exits/**` (create gated `authorized`)

#### Modèle GitHub

```markdown
## Contexte

Sortie de fonds uniquement si état de besoin dans un statut autorisant le décaissement.

## Objectif

1. CRUD `fund-exits` avec FK expense_request obligatoire
2. Rejeter si besoin non autorisé
3. Champs montant/date/devise/mode/référence/observations/auteur

## Fichiers clés

- `apps/api/src/modules/resources/fund-exits/**`

## Critères d'acceptation

- [x] Création refusée sans besoin `authorized` (400)
- [x] CRUD + list
- [x] RBAC (`treasury.read` / `treasury.exits.write`)

## Plan de test

Tenter create sans / avec besoin autorisé.

## Références

- TRESO-016, TRESO-022
```

---

### TRESO-018 — API sorties ↔ réservations + justificatifs — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-fund-exit-links`  
**Livrable :** attach/detach bookings + upload/list/delete attachments sur `fund-exits`

#### Modèle GitHub

```markdown
## Contexte

Même cardinalité (0,N) que les entrées.

## Objectif

1. Attach/detach bookings sur sorties
2. Justificatifs post-décaissement
3. Validation bookings

## Fichiers clés

- `apps/api/src/modules/resources/fund-exits/**`

## Critères d'acceptation

- [x] 0..N bookings (`POST/DELETE …/bookings`)
- [x] Justificatifs rattachables (`GET/POST/DELETE …/attachments`)
- [x] Erreurs métier claires (booking inexistant, voided)

## Plan de test

Lier 0/1/N bookings ; ajouter justificatif.

## Références

- TRESO-012, TRESO-017
```

---

### TRESO-019 — UI Admin liste/création états de besoin — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-expense-requests`

#### Modèle GitHub

```markdown
## Contexte

UI pour demandes internes (avant workflow avancé TRESO-020).

## Objectif

1. Liste + filtres statut
2. Formulaire création
3. Fiche détail basique

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/besoins/**`
- `apps/admin/components/treasury/expense-requests-*`

## Critères d'acceptation

- [ ] CRUD UI connecté API
- [ ] i18n + PermissionGate
- [ ] Affichage statut

## Plan de test

Créer une demande ; la retrouver en liste.

## Références

- TRESO-016
```

---

### TRESO-020 — UI Admin circuit validation → décaissement — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-expense-workflow`

#### Modèle GitHub

```markdown
## Contexte

Circuit : Validation → Autorisation → Décaissement → Justificatif → Enregistrement.

## Objectif

1. UI boutons d’action selon statut + permissions
2. Confirmations + motifs de rejet
3. Timeline visuelle des étapes
4. Appels API transitions (TRESO-022)

## Fichiers clés

- composants workflow expense-request
- messages i18n workflow

## Critères d'acceptation

- [ ] Actions masquées si pas de droit
- [ ] Transitions invalides refusées (toast)
- [ ] Timeline à jour après chaque action

## Plan de test

Parcours complet happy path + rejet à validation.

## Références

- TRESO-022, TRESO-008
```

---

### TRESO-021 — UI Admin liste/création/détail sorties — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-fund-exits`

#### Modèle GitHub

```markdown
## Contexte

Sorties liées à un besoin ; multi-réservations ; justificatifs.

## Objectif

1. Liste sorties + filtres
2. Formulaire (sélection besoin éligible)
3. Détail + liens besoin/bookings

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/sorties/**`
- composants fund-exits

## Critères d'acceptation

- [ ] Impossible de soumettre sans besoin éligible (UI)
- [ ] CRUD UI OK
- [ ] i18n + gates

## Plan de test

Créer sortie depuis besoin autorisé ; vérifier détail.

## Références

- TRESO-017, TRESO-018, TRESO-020
```

---

### TRESO-022 — API transitions d’état + historique immutable — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-workflow-transitions`

#### Modèle GitHub

```markdown
## Contexte

Chaque transition doit être historisée pour audit complet.

## Objectif

1. Endpoint(s) `transition` avec validation machine à états
2. Table/historique append-only (ou audit)
3. Enregistrement actor + timestamp + commentaire

## Fichiers clés

- services expense-requests / fund-exits
- TRESO-006 audit

## Critères d'acceptation

- [x] Transitions illégales → 4xx
- [x] Historique consultable
- [x] Permissions par type d’action

## Plan de test

Matrice de transitions unitaires / e2e API.

## Références

- TRESO-020, TRESO-031
```

---

### TRESO-023 — API budgets mensuels / annuels — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-api-budgets-period`

#### Modèle GitHub

```markdown
## Contexte

Budgets période sans encore le détail activité/produit (TRESO-024).

## Objectif

1. CRUD budgets mensuels/annuels
2. Contraintes unicité période+devise(+org)
3. List/filtre année

## Fichiers clés

- `apps/api/src/modules/resources/budgets/**`

## Critères d'acceptation

- [x] CRUD OK
- [x] Types month/year
- [x] RBAC

## Plan de test

Swagger create mois + année.

## Références

- TRESO-004
```

---

### TRESO-024 — API budgets par activité et produit/service — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-api-budgets-activity-product`

#### Modèle GitHub

```markdown
## Contexte

Budgets liés à une activité ou un produit/service vendu.

## Objectif

1. Étendre DTOs + FKs / morph targets
2. Filtres par activité / produit
3. Validation existence cible

## Fichiers clés

- module budgets
- types treasury

## Critères d'acceptation

- [x] Budget activité OK
- [x] Budget produit/service OK
- [x] Erreurs si cible invalide

## Plan de test

CRUD avec liens activité et package/activity.

## Références

- TRESO-023, activities/packages modules
```

---

### TRESO-025 — UI Admin budgets liste + formulaires — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-ui-budgets`
**Livrable :** routes `/tresorerie/budgets` · liste + formulaires mensuel/annuel/activité/produit · i18n + `PermissionGate` (`treasury.read` / `treasury.budgets.write`)

#### Modèle GitHub

```markdown
## Contexte

Écrans budgets calqués sur list/form Admin.

## Objectif

1. Liste budgets
2. Form mensuel/annuel/activité/produit
3. Routes `/tresorerie/budgets`

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/budgets/**`
- composants budgets

## Critères d'acceptation

- [x] CRUD UI
- [x] i18n + permissions
- [x] Types de budget sélectionnables

## Plan de test

Créer 3 types de budgets ; lister.

## Références

- TRESO-023, TRESO-024
```

---

### TRESO-026 — UI suivi budget vs réalisé — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-ui-budget-vs-actual`  
**Livrable :** `GET /budgets/vs-actual` · page `/tresorerie/budgets/suivi` · totaux + alertes dépassement · i18n

#### Modèle GitHub

```markdown
## Contexte

Agrégats légers depuis entrées/sorties (pas de compta SYSCOHADA).

## Objectif

1. Endpoint ou agrégation côté API (si manquant, mini endpoint)
2. UI écart budget / réalisé par période
3. Alertes simples (dépassement)

## Fichiers clés

- page suivi budgets
- API summary budgets

## Critères d'acceptation

- [x] Affichage prévu vs réalisé
- [x] Filtres période
- [x] i18n

## Plan de test

Budget + quelques opérations ; vérifier écarts.

## Références

- TRESO-035
```

---

### TRESO-027 — API invitation e-mail + jeton/lien sécurisé — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-api-external-invite`  
**Livrable :** `POST /treasury-external-collaborators/invite` · `POST …/tokens/validate` · `POST …/tokens/:id/revoke` · e-mail `sendTreasuryExternalInvite` (SHA-256 + TTL)

#### Modèle GitHub

```markdown
## Contexte

Création d’accès externe à partir d’un e-mail + lien sécurisé.

## Objectif

1. Endpoint invite (email)
2. Génération jeton hashé + URL
3. Envoi e-mail (module email existant)
4. Consommation jeton (validate)

## Fichiers clés

- module external-collaborators
- `apps/api/src/modules/email/`

## Critères d'acceptation

- [x] Invite crée collaborateur + jeton
- [x] E-mail envoyé (ou stub log en dev)
- [x] Jeton expire / invalidable

## Plan de test

Invite → recevoir lien → validate token.

## Références

- TRESO-005
```

---

### TRESO-028 — API activate/deactivate + permissions externes — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-api-external-permissions`  
**Livrable :** `POST …/:id/activate|deactivate` · `PATCH …/:id` (scopes) · audit hooks (`TreasuryAuditService`) · validate + `requiredScope`

#### Modèle GitHub

```markdown
## Contexte

Responsable financier active/désactive ; scopes limités (ex. créer état de besoin).

## Objectif

1. Endpoints activate/deactivate
2. Attribution permissions/scopes
3. Traçabilité actions externes → audit

## Fichiers clés

- module external-collaborators
- TRESO-031 audit hooks

## Critères d'acceptation

- [x] Désactivé → accès refusé
- [x] Scopes respectés
- [x] Actions loggées

## Plan de test

Activer/désactiver ; tenter create besoin.

## Références

- TRESO-027, TRESO-008
```

---

### TRESO-029 — UI Admin gestion collaborateurs externes — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-ui-external-collaborators`  
**Livrable :** `/tresorerie/externes` · liste + invite modal · activate/deactivate · régénérer lien · `GET /treasury-external-collaborators` · i18n + `PermissionGate`

#### Modèle GitHub

```markdown
## Contexte

Back-office pour inviter, activer, attribuer droits.

## Objectif

1. Liste collaborateurs
2. Invite form (email + scopes)
3. Toggle actif + régénérer lien

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/externes/**`

## Critères d'acceptation

- [x] CRUD/gestion UI
- [x] Gates responsable financier
- [x] i18n

## Plan de test

Inviter un email test ; désactiver.

## Références

- TRESO-027, TRESO-028
```

---

### TRESO-030 — Flux minimal état de besoin via jeton — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-external-need-flow`  
**Livrable :** `/tresorerie/externe/acces?token=` · `POST /expense-requests/external` · actor `external` + audit · auto-submit

#### Modèle GitHub

```markdown
## Contexte

Page minimale (route token) pour qu’un externe crée un état de besoin sans compte Admin complet.

## Objectif

1. Route publique/semi-publique tokenisée
2. Formulaire besoin limité
3. Auth par jeton (pas session admin)
4. Traçabilité actor externe

## Fichiers clés

- route Admin ou page dédiée token
- API validate token + create expense-request

## Critères d'acceptation

- [x] Lien jeton ouvre le formulaire
- [x] Jeton expiré → erreur claire
- [x] Demande visible côté Admin

## Plan de test

Parcours invite → lien → submit → visible en liste besoins.

## Références

- TRESO-019, TRESO-027
```

---

### TRESO-031 — API journal d’audit (user, action, old/new) — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-api-audit`  
**Livrable :** `GET /treasury-audit-logs` (+ `:id`) · hooks `TreasuryAuditService.log` sur fund-entries / fund-exits / expense-requests (create/update/transition/void) · permission `treasury.audit.read`

#### Modèle GitHub

```markdown
## Contexte

Toutes opérations sensibles doivent être auditables.

## Objectif

1. Service d’écriture audit appelé depuis fund-entries/exits/expense/void/transitions
2. Endpoint list filtré (entity, user, date)
3. Payload old/new JSON

## Fichiers clés

- module treasury-audit
- hooks services métier

## Critères d'acceptation

- [x] Create/update/void/transition audités
- [x] List API paginée
- [x] Permission `treasury.audit.read` (ou équivalent)

## Plan de test

Effectuer mutation ; vérifier log.

## Références

- TRESO-006, TRESO-022
```

---

### TRESO-032 — UI Admin consultation audit trésorerie — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-ui-audit`  
**Livrable :** `/tresorerie/audit` · `TreasuryAuditLogsList` (filtres entity/action/dates) · modal old/new JSON · liens entité · gate `treasury.audit.read`

#### Modèle GitHub

```markdown
## Contexte

Écran lecture seule pour contrôleurs / responsables.

## Objectif

1. Liste audit + filtres
2. Affichage diff old/new
3. Lien vers entité source

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/audit/**`

## Critères d'acceptation

- [x] Liste filtrable
- [x] Diff lisible
- [x] Gate permission audit

## Plan de test

Générer 3 logs ; filtrer par entity.

## Références

- TRESO-031, /systeme/audit pattern
```

---

### TRESO-033 — Annulation / void d’opérations + gates — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-void-operations`  
**Livrable :** `POST /fund-entries|fund-exits/:id/void` · permission `treasury.void` · audit `action: void` · UI `TreasuryVoidDialog` · gate compta si `accounting_links.status=linked` (no-op tant que TRESO-039)

#### Modèle GitHub

```markdown
## Contexte

Modification/annulation sensibles avec permission dédiée + audit.

## Objectif

1. Endpoint void entrée/sortie (soft cancel, pas delete hard)
2. UI action void + motif
3. Interdire void si règles métier (ex. déjà pontée compta stub)

## Fichiers clés

- API fund-entries / fund-exits
- UI détail + PermissionGate

## Critères d'acceptation

- [x] Void réservé aux droits adaptés
- [x] Audit old/new
- [x] Opération marquée annulée en liste

## Plan de test

Void avec/sans permission.

## Références

- TRESO-031, TRESO-008
```

---

### TRESO-034 — Lien croisé fiche réservation → opérations — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-booking-crosslink`  
**Livrable :** `BookingTreasuryOpsPanel` sur `/reservations/[id]` · `listFundEntries|Exits({ bookingId })` · `PermissionGate treasury.read` · liens `/tresorerie/…/voir`

#### Modèle GitHub

```markdown
## Contexte

Depuis une réservation Admin, voir entrées/sorties liées.

## Objectif

1. Endpoint ou inclusion dans booking detail
2. Panneau UI sur fiche réservation
3. Liens vers détails trésorerie

## Fichiers clés

- `apps/admin/components/bookings/**`
- API bookings ou treasury-by-booking

## Critères d'acceptation

- [x] Panneau visible si permission treasury.read
- [x] Liste opérations liées
- [x] Empty state si aucune

## Plan de test

Lier une entrée à une booking ; ouvrir fiche booking.

## Références

- TRESO-012, TRESO-018
```

---

### TRESO-035 — API agrégats rapports — ✅

**Labels :** `admin`, `tresorerie`, `api`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-api-reports`  
**Livrable :** `GET /treasury-reports/summary` · `GET /treasury-reports/by-dimension?groupBy=source|paymentMethod` · permission `treasury.reports.read` · hors voided (+ draft sorties)

#### Modèle GitHub

```markdown
## Contexte

Rapports légers : entrées/sorties par période, source, mode.

## Objectif

1. Endpoints summary (totals, groupBy)
2. Filtres date range + devise
3. Pas de bilans SYSCOHADA

## Fichiers clés

- `apps/api/src/modules/resources/treasury-reports/**`

## Critères d'acceptation

- [x] Totaux cohérents avec CRUD
- [x] GroupBy source/mode
- [x] RBAC reports

## Plan de test

Seed opérations ; comparer agrégats.

## Références

- TRESO-026, TRESO-036
```

---

### TRESO-036 — UI Admin page rapports trésorerie — ✅

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-ui-reports`  
**Livrable :** `/tresorerie/rapports` · `TreasuryReportsPanel` (filtres période/devise, KPIs, tableaux source/mode, BarChart Recharts) · gate `treasury.reports.read`

#### Modèle GitHub

```markdown
## Contexte

Page rapports consommant TRESO-035.

## Objectif

1. Filtres période/devise
2. Tableaux / graphiques simples (pattern analytics existant si adapté)
3. i18n

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/rapports/**`
- `apps/admin/components/analytics/` (réutilisation prudente)

## Critères d'acceptation

- [x] Affichage totaux + groupements
- [x] Permission reports
- [x] Responsive OK

## Plan de test

Changer filtres ; vérifier refresh données.

## Références

- TRESO-035
```

---

### TRESO-037 — Export CSV des opérations

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-export-csv`

#### Modèle GitHub

```markdown
## Contexte

Export opérationnel pour contrôle / Excel.

## Objectif

1. Endpoint export CSV entrées et/ou sorties (filtres courants)
2. Bouton export UI
3. Encodage UTF-8

## Fichiers clés

- API reports/export
- boutons listes Admin

## Critères d'acceptation

- [ ] CSV téléchargeable
- [ ] Colonnes métier présentes
- [ ] Permission reports/export

## Plan de test

Exporter et ouvrir dans tableur.

## Références

- TRESO-035, TRESO-013
```

---

### TRESO-038 — Hub /tresorerie + cartes stats

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/tresorerie-ui-hub`

#### Modèle GitHub

```markdown
## Contexte

Page d’accueil du module avec accès rapide et KPI légers.

## Objectif

1. Hub liens vers sous-modules
2. Stat cards (entrées/sorties période, besoins en attente)
3. Pattern `*-stat-cards`

## Fichiers clés

- `apps/admin/app/(dashboard)/tresorerie/page.tsx`
- composants hub/stat-cards

## Critères d'acceptation

- [ ] KPI cohérents
- [ ] Liens permission-aware
- [ ] i18n

## Plan de test

Ouvrir `/tresorerie` avec jeu de données.

## Références

- TRESO-035, TRESO-009
```

---

### TRESO-039 — Stub pont comptable accounting_link + mapping

**Labels :** `admin`, `tresorerie`, `api`, `priority:low`  
**Branche suggérée :** `feature/tresorerie-accounting-bridge-stub`

#### Modèle GitHub

```markdown
## Contexte

Traçabilité opération financière ↔ écriture future, sans moteur SYSCOHADA.

## Objectif

1. Table/API `accounting_links` (fund_op_type, fund_op_id, journal_entry_id nullable, status)
2. Config skeleton règles mapping (JSON/settings)
3. Pas de génération d’écritures

## Fichiers clés

- migration + module stub
- config mapping

## Critères d'acceptation

- [ ] Lien créable/consultable
- [ ] journal_entry_id optionnel
- [ ] Documenté comme stub

## Plan de test

Créer link sur une entrée ; GET.

## Références

- TRESO-040, TRESO-041
```

---

### TRESO-040 — UI placeholder section Comptabilité

**Labels :** `admin`, `tresorerie`, `enhancement`, `priority:low`  
**Branche suggérée :** `feature/tresorerie-ui-accounting-placeholder`

#### Modèle GitHub

```markdown
## Contexte

Branche comptabilité visible mais non SYSCOHADA dans ce lot.

## Objectif

1. Page `/tresorerie/comptabilite` placeholder
2. Liste des accounting_links (lecture)
3. Message « épic SYSCOHADA à venir » + lien doc TRESO-041

## Fichiers clés

- routes + page content comptabilité

## Critères d'acceptation

- [ ] Page accessible selon permission
- [ ] Stub links visibles
- [ ] Pas de faux écrans journal/bilan

## Plan de test

Navigation manuelle.

## Références

- TRESO-039
```

---

### TRESO-041 — Doc handoff épic SYSCOHADA suivant

**Labels :** `admin`, `tresorerie`, `docs`, `priority:low`  
**Branche suggérée :** `docs/tresorerie-syscohada-epic`

#### Modèle GitHub

```markdown
## Contexte

Ce lot exclut volontairement la comptabilité réglementaire.

## Objectif

1. Créer `docs/tresorerie-syscohada-epic-next.md`
2. Lister livrables reportés (plan comptable, journal, grand livre, balance, caisse/banque, rapprochements, clôtures, bilan, CR)
3. Décrire comment le stub `accounting_link` sera consommé

## Fichiers clés

- `docs/tresorerie-syscohada-epic-next.md`
- référence TRESO-039

## Critères d'acceptation

- [ ] Périmètre reporté exhaustif
- [ ] Dépendances au lot actuel listées
- [ ] Prêt à dériver un futur doc tâches

## Plan de test

Revue documentaire.

## Références

- cahier des charges module Trésorerie §2
```

---

### TRESO-042 — E2E smoke nav + CRUD entrée

**Labels :** `admin`, `tresorerie`, `testing`, `priority:high`  
**Branche suggérée :** `feature/tresorerie-e2e-fund-entry`

#### Modèle GitHub

````markdown
## Contexte

Couvrir le happy path Admin entrées (Playwright / helpers e2e existants).

## Objectif

1. Spec : login → nav Trésorerie → créer entrée → liste → détail
2. Données de test isolées
3. Intégrer CI si pipeline admin e2e existant

## Fichiers clés

- `apps/admin/tests/e2e/**`
- helpers phase QA existants

## Critères d'acceptation

- [ ] Spec verte localement
- [ ] Couvre create + view
- [ ] Sélecteurs stables

## Plan de test

```bash
pnpm --filter @africatourismgate/admin test:e2e -- tresorerie
```
````

## Références

- TRESO-013, TRESO-014, TRESO-015

````

---

### TRESO-043 — E2E happy path circuit sortie

**Labels :** `admin`, `tresorerie`, `testing`, `priority:high`
**Branche suggérée :** `feature/tresorerie-e2e-expense-workflow`

#### Modèle GitHub

```markdown
## Contexte

Valider le circuit complet côté Admin.

## Objectif

1. Spec : créer besoin → valider → autoriser → décaisser → justificatif → sortie enregistrée
2. Vérifier timeline / statuts UI

## Fichiers clés

- `apps/admin/tests/e2e/**`

## Critères d'acceptation

- [ ] Happy path vert
- [ ] Échec transition illégale couvert (optionnel assert API/UI)

## Plan de test

Exécuter la spec workflow.

## Références

- TRESO-019…022, TRESO-021
````

---

### TRESO-044 — QA manuelle RBAC rôles trésorerie

**Labels :** `admin`, `tresorerie`, `testing`, `priority:high`  
**Branche suggérée :** `docs/tresorerie-rbac-qa` (checklist) ou branche test

#### Modèle GitHub

```markdown
## Contexte

Vérifier la matrice : créateur, valideur, autorisateur, enregistreur, lecture rapports, audit.

## Objectif

1. Checklist manuelle dans le doc ou `docs/pr-tresorerie-rbac-test.md`
2. Compte de test par rôle
3. Vérifier nav masquée + 403 API

## Fichiers clés

- doc QA
- `/systeme/roles`

## Critères d'acceptation

- [ ] Matrice rôles × actions exécutée
- [ ] Écarts listés / corrigés
- [ ] super_admin OK

## Plan de test

Parcourir checklist TRESO-008.

## Références

- TRESO-008, TRESO-020
```

---

### TRESO-045 — Sync OpenAPI + api-client + README module

**Labels :** `admin`, `tresorerie`, `docs`, `priority:low`  
**Branche suggérée :** `feature/tresorerie-openapi-readme`

#### Modèle GitHub

```markdown
## Contexte

Finaliser l’intégration client Admin et documenter le module.

## Objectif

1. Régénérer OpenAPI / `packages/api-client` pour ressources treasury
2. README court `docs/` ou section Admin (routes, permissions, flux)
3. Pointer vers `admin-tresorerie-github-tasks.md` + handoff SYSCOHADA

## Fichiers clés

- `packages/api-client`
- scripts OpenAPI monorepo
- README module

## Critères d'acceptation

- [ ] Client régénéré consommé par Admin
- [ ] README à jour
- [ ] Liens docs croisés

## Plan de test

Build api-client ; smoke import Admin.

## Références

- ensemble TRESO-011…040
```

---
