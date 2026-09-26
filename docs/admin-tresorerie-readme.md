# Module Admin — Trésorerie

Guide court d’intégration : routes UI, permissions RBAC, flux métier, client API.

**Lot :** TRESO-001 → TRESO-045  
**Tâches détaillées :** [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md)  
**Modèle domaine :** [tresorerie-domain-model.md](./tresorerie-domain-model.md)  
**QA RBAC :** [pr-tresorerie-rbac-test.md](./pr-tresorerie-rbac-test.md)  
**Suite compta (hors scope) :** [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md)

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
| `/tresorerie/comptabilite` | Stub pont `accounting_links` | `treasury.accounting_link.read` |

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
| `treasury.accounting_link.read` | Stub pont comptable |

Profils indicatifs (`TREASURY_ROLE_PROFILE_PERMISSIONS`) : créateur, valideur, autorisateur, trésorier (enregistreur), contrôle, finance admin — voir QA RBAC.  
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
| Pont compta (stub) | `/api/accounting-links` |

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

## Hors scope (SYSCOHADA)

Pas de plan comptable, journal, bilan, génération d’écritures.  
Le stub `accounting_links` + UI `/tresorerie/comptabilite` prépare le handoff — détails dans [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md).
