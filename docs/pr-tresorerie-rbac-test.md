# TRESO-044 — QA manuelle RBAC trésorerie

Branche suggérée : `docs/tresorerie-rbac-qa`  
Réf. : [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md) (TRESO-008, TRESO-044) · [tresorerie-domain-model.md](./tresorerie-domain-model.md) §7

## Objectif

Valider la matrice **créateur / valideur / autorisateur / enregistreur (trésorier) / contrôle (rapports + audit) / finance admin / super_admin** : nav masquée, boutons `PermissionGate`, **403 API**.

## Prérequis

1. API + Admin démarrés ; `pnpm db:sync` + `pnpm --filter @africatourismgate/api sync:rbac`.
2. Compte `super_admin` (seed : `admin@africatourismgate.local`).
3. Org de test (ex. org plateforme seed).

## Comptes de test (création via `/systeme/roles`)

Créer **un rôle custom + un utilisateur** par profil. Permissions exactes = `TREASURY_ROLE_PROFILE_PERMISSIONS` (`apps/api/src/modules/rbac/rbac.constants.ts`).

| Compte (suggestion) | Rôle custom | Permissions |
| ------------------- | ----------- | ----------- |
| `treso.createur@test.local` | `treasury_request_creator` | `treasury.read`, `treasury.expense_requests.create` |
| `treso.valideur@test.local` | `treasury_validator` | + `expense_requests.validate` |
| `treso.autorisateur@test.local` | `treasury_authorizer` | + `authorize`, `externals.manage`, `void` (et garder create + validate) |
| `treso.enregistreur@test.local` | `treasury_cashier` | `treasury.read`, `entries.write`, `exits.write` |
| `treso.controle@test.local` | `treasury_controller` | `treasury.read`, `reports.read`, `audit.read`, `accounting_link.read` |
| `treso.finance@test.local` | `treasury_finance_admin` | **toutes** les `treasury.*` |
| seed admin | `super_admin` | bypass PermissionsGuard |

Procédure Admin :

1. `/systeme/roles` → Nouveau rôle → cocher les permissions du tableau.
2. `/utilisateurs` (ou flux staff) → créer user → assigner le rôle (scope org).
3. Se déconnecter / reconnecter avec chaque compte pour chaque ligne de matrice.

---

## Nav attendue (`filterAdminNav` + `ADMIN_ROUTE_ACCESS_RULES`)

| Route | Permission route | Créateur | Valideur | Autorisateur | Enregistreur | Contrôle | Finance | super_admin |
| ----- | ---------------- | -------- | -------- | ------------ | ------------ | -------- | ------- | ----------- |
| Groupe Trésorerie | ≥1 enfant | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie` (hub) | `treasury.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie/entrees` | `treasury.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie/sorties` | `treasury.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie/besoins` | `treasury.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie/budgets` | `treasury.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie/externes` | `read` **ou** `externals.manage` | ✅ (lecture) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/tresorerie/rapports` | `treasury.reports.read` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/tresorerie/audit` | `treasury.audit.read` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/tresorerie/comptabilite` | `treasury.accounting_link.read` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

Sans aucune `treasury.*` : **groupe Trésorerie absent** ; URL directe `/tresorerie` → accès refusé (middleware / page gate).

---

## Matrice actions × rôles

Légende : ✅ autorisé · ❌ 403 / bouton masqué · △ visible lecture seule (pas d’action write)

### A. États de besoin (workflow)

| Action | API / UI | Créateur | Valideur | Autorisateur | Enregistreur | Contrôle | Finance | super_admin |
| ------ | -------- | -------- | -------- | ------------ | ------------ | -------- | ------- | ----------- |
| Liste / fiche | `GET …/expense-requests` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer draft | `POST …/expense-requests` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Soumettre `→ submitted` | `POST …/:id/transition` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Valider `→ validated` | transition | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Autoriser `→ authorized` | transition | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Bouton décaissement (lien sortie) | UI `exits.write` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |

### B. Sorties / entrées (enregistreur)

| Action | API / UI | Créateur | Enregistreur | Autorisateur | Contrôle | Finance | super_admin |
| ------ | -------- | -------- | ------------ | ------------ | -------- | ------- | ----------- |
| Créer / éditer entrée | `entries.write` | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Créer / éditer sortie + transition draft→disbursed→recorded | `exits.write` | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Void entrée/sortie | `treasury.void` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |

### C. Rapports / audit / compta / budgets / externes

| Action | Permission | Créateur | Enregistreur | Contrôle | Autorisateur | Finance | super_admin |
| ------ | ---------- | -------- | ------------ | -------- | ------------ | ------- | ----------- |
| Rapports + export CSV | `reports.read` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Journal audit | `audit.read` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Liste `accounting_links` | `accounting_link.read` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| CRUD budgets | `budgets.write` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Inviter / gérer externes | `externals.manage` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## Checklist d’exécution manuelle

Cocher après passage réel avec chaque compte.

### Setup

- [ ] 6 rôles custom créés (`/systeme/roles`) selon tableau comptes
- [ ] 6 users de test assignés + mots de passe connus
- [ ] `sync:rbac` OK (`SELECT code FROM permissions WHERE code LIKE 'treasury.%'` → 12 lignes)

### Par profil (répéter)

- [ ] **Créateur** — nav OK (pas rapports/audit/compta) ; créer + soumettre OK ; valider/autoriser/sortie/write ❌ ; `POST /fund-entries` → **403**
- [ ] **Valideur** — valider OK ; autoriser ❌
- [ ] **Autorisateur** — autoriser OK ; void UI visible ; invite externes OK ; pas `entries.write` / `exits.write`
- [ ] **Enregistreur** — créer entrée + sortie + transitions sortie OK ; valider besoin ❌ ; rapports nav ❌
- [ ] **Contrôle** — rapports + audit + compta OK ; create besoin / write flux ❌
- [ ] **Finance admin** — toutes actions OK
- [ ] **super_admin** — bypass : toutes routes + toutes API OK sans grants manquants

### Smoke API 403 (exemple curl)

Remplacer `$TOKEN_*` et `$API` (`http://localhost:3000/api`).

```bash
# Créateur ne peut pas créer une entrée
curl -s -o /dev/null -w "%{http_code}" -X POST "$API/fund-entries" \
  -H "Authorization: Bearer $TOKEN_CREATEUR" -H "Content-Type: application/json" \
  -d '{}'
# Attendu: 403

# Contrôle ne peut pas transitionner un besoin
curl -s -o /dev/null -w "%{http_code}" -X POST "$API/expense-requests/$ID/transition" \
  -H "Authorization: Bearer $TOKEN_CONTROLE" -H "Content-Type: application/json" \
  -d '{"toStatus":"submitted"}'
# Attendu: 403

# Sans reports.read → listes rapports
curl -s -o /dev/null -w "%{http_code}" "$API/treasury-reports/summary" \
  -H "Authorization: Bearer $TOKEN_CREATEUR"
# Attendu: 403

# Audit
curl -s -o /dev/null -w "%{http_code}" "$API/treasury-audit-logs" \
  -H "Authorization: Bearer $TOKEN_ENREGISTREUR"
# Attendu: 403
```

- [ ] Curls 403 exécutés et conformes

---

## Revue code (agent) — écarts

| # | Écart | Statut |
| - | ----- | ------ |
| 1 | Profil `authorizer` dans `TREASURY_ROLE_PROFILE_PERMISSIONS` **sans** `expense_requests.create` alors que TRESO-008 / domain §7 sont additifs (Créateur → Valideur → Autorisateur) | **Corrigé** — `create` ajouté au profil `authorizer` |
| 2 | Route `/tresorerie/externes` accessible avec seul `treasury.read` (anyOf) ; actions write gated `externals.manage` | **Accepté** (lecture liste possible ; invite masquée) — documenté |
| 3 | Hub / listes flux visibles dès `treasury.read` (boutons write gated) | **Accepté** — by design |
| 4 | `budgets.write` hors profils sauf finance admin | **Accepté** — aligné constantes |

### super_admin

- Guard : `isSuperAdmin` → `isRouteAllowed` true ; API `PermissionsGuard` bypass + grants seed sur toutes permissions.
- Attendu QA : aucun écran trésorerie bloqué ; aucune 403 sur endpoints `treasury.*`.

---

## Fichiers de référence

| Fichier | Rôle |
| ------- | ---- |
| `apps/api/src/modules/rbac/rbac.constants.ts` | Codes + profils |
| `apps/admin/config/admin-route-permissions.ts` | Gates routes / nav |
| `apps/admin/lib/auth/filter-admin-nav.ts` | Filtrage sidebar |
| Controllers `fund-*`, `expense-requests`, `treasury-*` | `@RequirePermissions` |
| UI `PermissionGate` sous `components/treasury/**` | Boutons |

## Critères TRESO-044

- [x] Checklist manuelle livrée (`docs/pr-tresorerie-rbac-test.md`)
- [x] Comptes / rôles de test documentés
- [x] Nav masquée + 403 API spécifiés
- [x] Écarts listés / corrigés (profil autorisateur)
- [x] super_admin documenté
- [ ] Passage manuel signé (cocher section « Checklist d’exécution » ci-dessus en environnement local/staging)
