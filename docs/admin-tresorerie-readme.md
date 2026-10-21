# Module Admin — Trésorerie

Guide court d’intégration : routes UI, permissions RBAC, flux métier, client API.

**Lot :** TRESO-001 → TRESO-046  
**Tâches détaillées :** [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md)  
**Modèle domaine :** [tresorerie-domain-model.md](./tresorerie-domain-model.md)  
**QA RBAC :** [pr-tresorerie-rbac-test.md](./pr-tresorerie-rbac-test.md)  
**Suite compta :** [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md) · [syscohada-domain-model.md](./syscohada-domain-model.md)

---

## Routes Admin

Préfixe hub : `/tresorerie` · permission de base `treasury.read` (sauf exceptions ci-dessous).

| Route | Contenu | Gate route |
| ----- | ------- | ---------- |
| `/tresorerie` | Hub + KPI | `treasury.read` |
| `/tresorerie/entrees` | Entrées de fonds | `treasury.read` |
| `/tresorerie/sorties` | Sorties / décaissements | `treasury.read` |
| `/tresorerie/besoins` | États de besoin + workflow | `treasury.read` |
| `/tresorerie/budgets` | Budgets + suivi vs réalisé | `treasury.read` |
| `/tresorerie/rapports` | Agrégats + export CSV | `treasury.reports.read` |
| `/tresorerie/externes` | Collaborateurs externes | `read` **ou** `externals.manage` |
| `/tresorerie/audit` | Journal d’audit | `treasury.audit.read` |
| `/tresorerie/taux-change` | Catalogue taux de change (manuel) | `treasury.fx_rates.read` |
| `/tresorerie/comptabilite` | Hub pont / livres SYSCOHADA | `treasury.accounting_link.read` **ou** `accounting.*` |

Config : `apps/admin/config/admin-route-permissions.ts`, `dashboard-nav.config.ts`.

---

## Permissions `treasury.*`

| Code | Usage |
| ---- | ----- |
| `treasury.read` | Nav / listes / fiches |
| `treasury.entries.write` | CRUD entrées |
| `treasury.exits.write` | CRUD sorties + transitions draft→disbursed→recorded |
| `treasury.expense_requests.create` | Créer / soumettre besoins |
| `treasury.expense_requests.validate` | Valider |
| `treasury.expense_requests.authorize` | Autoriser |
| `treasury.budgets.write` | CRUD budgets |
| `treasury.reports.read` | Rapports + export |
| `treasury.externals.manage` | Inviter / activer externes |
| `treasury.void` | Annuler (void) une opération |
| `treasury.audit.read` | Journal d’audit |
| `treasury.accounting_link.read` | Stub / lecture pont comptable |
| `treasury.fx_rates.read` | Catalogue taux de change |
| `treasury.fx_rates.write` | CRUD taux de change |

Profils indicatifs (`TREASURY_ROLE_PROFILE_PERMISSIONS`) : créateur, valideur, autorisateur, trésorier (enregistreur), contrôle (+ `fx_rates.read`), finance admin (toutes `treasury.*`) — voir QA RBAC.  
`super_admin` : bypass inchangé.

---

## Flux métier (happy path sortie)

```
Besoin draft → submit → validate → authorize
  → Sortie (draft) → justificatif(s) → disbursed → recorded
  → Besoin closed
```

- Transitions besoin : UI workflow + `POST /expense-requests/:id/transition`
- Sortie : `POST /fund-exits` (lié à un besoin `authorized`) puis `POST /fund-exits/:id/transition`
- `recorded` exige ≥1 pièce jointe ; clôture le besoin lié

E2E : `apps/admin/tests/e2e/tresorerie-expense-workflow-smoke.spec.ts` (TRESO-043).

---

## API & api-client

| Ressource | Préfixe REST |
| --------- | ------------ |
| Entrées | `/api/fund-entries` |
| Besoins | `/api/expense-requests` |
| Sorties | `/api/fund-exits` |
| Budgets | `/api/budgets` |
| Rapports | `/api/treasury-reports/*` |
| Audit | `/api/treasury-audit-logs` |
| Externes | `/api/treasury-external-collaborators` |
| Pont compta (stub → SYSCO) | `/api/accounting-links` |
| Taux de change | `/api/exchange-rates` |

**Client Admin :** méthodes typées sur `ApiClient` dans `packages/api-client/src/index.ts` (consommées via `getApiClient()`).  
**Schéma OpenAPI généré :** `packages/api-client/src/generated/schema.ts` (types `paths` / `components`).

Régénération :

```bash
pnpm --filter @africatourismgate/api openapi:export   # Nest → apps/api/openapi.json (MySQL)
pnpm codegen:api                                       # → packages/api-client/src/generated/*
pnpm --filter @africatourismgate/api-client build
```

Variante : `pnpm codegen:api -- --refresh-spec` (fetch live `/api-json` ou re-export).

Export CSV rapports : `GET /treasury-reports/export` — helper Admin `apps/admin/lib/treasury-reports-export.ts`.

---

## Taux de change (TRESO-046)

Catalogue **manuel** org-scoped : `1 fromCurrency = rate × toCurrency`.  
Utilisé à la comptabilisation SYSCO quand `fund_*.currency ≠ accounting_exercises.currency` ([syscohada-domain-model.md](./syscohada-domain-model.md) §7.4).  
Sans taux applicable → `POST /accounting-links/post` refuse (400).  
**Hors MVP :** feed BCEAO/API, inverse auto, conversion des rapports trésorerie.

---

## Hors scope (SYSCOHADA — lot TRESO initial)

Le lot TRESO-001…045 ne livrait pas plan / journal / bilan. L’épic SYSCOHADA + TRESO-046 (taux) complètent la chaîne — détails [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md) · [admin-syscohada-github-tasks.md](./admin-syscohada-github-tasks.md).
