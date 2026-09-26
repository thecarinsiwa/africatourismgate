# Africa Tourism Gate — Tâches GitHub Épic SYSCOHADA (suite Trésorerie)

> **Document opérationnel** pour créer des issues GitHub destinées à brancher la **comptabilité réglementaire SYSCOHADA (OHADA)** sur le module Trésorerie déjà livré.  
> **Mise à jour : septembre 2026** — Dérivé de [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md) (TRESO-041).

**Handoff / périmètre :** [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md)  
**Lot amont (stub pont) :** [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md) — TRESO-039 / TRESO-040 / TRESO-041  
**Modèle domaine Trésorerie :** [tresorerie-domain-model.md](./tresorerie-domain-model.md) §4.7 / §10  
**Modèle domaine SYSCOHADA (SYSCO-001) :** [syscohada-domain-model.md](./syscohada-domain-model.md)

---

## Comment utiliser ce document

1. **Lire** le [handoff](./tresorerie-syscohada-epic-next.md) (§2 périmètre, §4 consommation `accounting_link`, §6 décisions ouvertes).
2. **Parcourir** le [tableau récapitulatif](#tableau-récapitulatif-sysco-001--sysco-012).
3. **Copier** le bloc « Modèle GitHub » de chaque tâche dans une nouvelle issue.
4. **Adapter** labels, assignation et priorité (effort / priorités à caler avec finance / tech lead).
5. Une PR d'implémentation = un scope testable (`feature/syscohada-*`).

### Création rapide via CLI

```bash
gh issue create \
  --title "[SYSCO] Spec domaine comptable OHADA + schéma cible" \
  --label "admin,syscohada,comptabilite,docs,priority:high" \
  --body "$(sed -n '/^#### Modèle GitHub/,/^---$/p' docs/admin-syscohada-github-tasks.md | head -n 80)"
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
| Préfixe titre | `[SYSCO]` |
| Branches | `feature/syscohada-*` |
| Labels | `admin`, `syscohada`, `comptabilite`, `enhancement` / `api` / `testing` / `docs`, `priority:high\|medium\|low` |
| Effort | S = 1–2 j, M = 3–5 j, L = 1–2 sem |

### Périmètre de cet épic

| Inclus | Exclu (sauf décision produit) |
| ------ | ----------------------------- |
| Plan comptable, journaux, exercices, écritures | Remplacer le module `payments` commerce |
| Moteur mapping + remplissage `accounting_links` | Fusionner `fund_entries` et `payments` |
| Journal, grand livre, balance, livres caisse/banque | Refonte globale RBAC hors `accounting.*` |
| Clôtures, bilan, CR (MVP réglementaire) | Exports fiscal / liasse (hors MVP sauf exigence) |
| RBAC `accounting.*`, audit écritures, E2E, OpenAPI | Tiers / immos / stocks complets (épic satellite éventuel) |

### Documents liés

- [syscohada-domain-model.md](./syscohada-domain-model.md) — SYSCO-001
- [tresorerie-syscohada-epic-next.md](./tresorerie-syscohada-epic-next.md) — handoff TRESO-041
- [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md) — lot TRESO-001…045
- [tresorerie-domain-model.md](./tresorerie-domain-model.md) — domaine + hors scope §10
- Stub : `apps/api/.../treasury-accounting-mapping.config.ts`, UI `/tresorerie/comptabilite`

### Prérequis avant démarrage

1. Lot TRESO opérationnel stabilisé (CRUD + void + audit + rapports).
2. Décision produit : multi-exercices, multi-org, devise de tenue (§6 handoff).
3. Validation finance des hints de comptes du skeleton (classes 5 / 6 / 7…).
4. Ne pas casser le placeholder Admin tant que journal/bilan ne sont pas réels (SYSCO-010).

---

## Tableau récapitulatif SYSCO-001 → SYSCO-012

| ID        | Titre court                                              | Priorité | Type           | Effort | Dépendances |
| --------- | -------------------------------------------------------- | -------- | -------------- | ------ | ----------- |
| SYSCO-001 | Spec domaine comptable OHADA + schéma cible — ✅         | Haute    | Docs / Spec    | M      | Domaine TRESO §10 |
| SYSCO-002 | Migration plan comptable + exercices — ✅                | Haute    | API / DB       | L      | SYSCO-001 |
| SYSCO-003 | Migration journaux / écritures / lignes — ✅             | Haute    | API / DB       | L      | SYSCO-002 |
| SYSCO-004 | Moteur mapping + job/API « comptabiliser » — ✅          | Haute    | API            | L      | TRESO-039, SYSCO-002 |
| SYSCO-005 | Remplir `accounting_links.journal_entry_id` + statuts — ✅ | Haute    | API            | M      | TRESO-039, SYSCO-003–004 |
| SYSCO-006 | UI journal + grand livre + balance                       | Haute    | Admin          | L      | SYSCO-003 |
| SYSCO-007 | Livres caisse / banque + rapprochements                  | Moyenne  | Admin / API    | L      | SYSCO-003, comptes classe 5 |
| SYSCO-008 | Clôtures + bilan + compte de résultat                    | Moyenne  | Admin / API    | L      | SYSCO-006 |
| SYSCO-009 | RBAC `accounting.*` + audit écritures                    | Haute    | API / RBAC     | M      | TRESO-008 pattern |
| SYSCO-010 | Remplacer placeholder `/tresorerie/comptabilite`         | Haute    | Admin          | M      | TRESO-040, SYSCO-005–006 |
| SYSCO-011 | E2E : opération → linked → visible au journal            | Haute    | Testing        | M      | TRESO-042/043, SYSCO-005–006 |
| SYSCO-012 | Sync OpenAPI + doc module compta                         | Basse    | Docs / API     | S      | TRESO-045 pattern, SYSCO-003–010 |

### Ordre de livraison suggéré

```text
SYSCO-001
    └── SYSCO-002 ──► SYSCO-003 ─┬─► SYSCO-006 ──► SYSCO-008
                                 ├─► SYSCO-007
         TRESO-039 ──► SYSCO-004 ─┴─► SYSCO-005 ──► SYSCO-010
TRESO-008 pattern ──► SYSCO-009 (en parallèle dès API écritures)
SYSCO-005 + SYSCO-006 ──► SYSCO-011
ensemble MVP ──► SYSCO-012
```

---

## Modèles GitHub — prêts à copier

### SYSCO-001 — Spec domaine comptable OHADA + schéma cible — ✅

**Labels :** `admin`, `syscohada`, `comptabilite`, `docs`, `priority:high`  
**Branche suggérée :** `docs/syscohada-domain-model`  
**Livrable :** [`docs/syscohada-domain-model.md`](./syscohada-domain-model.md) — schéma `chart_of_accounts` / `journal_*` / exercices / mapping · décisions §3 · permissions `accounting.*`

#### Modèle GitHub

```markdown
## Contexte

Le lot Trésorerie livre un stub `accounting_links` sans plan SYSCOHADA ni écritures. Avant migrations, figer le modèle comptable OHADA et les décisions ouvertes du handoff.

## Objectif

1. Documenter entités : plan comptable (classes 1–8), journaux, exercices/périodes, écritures + lignes, mapping rules
2. Figer cardinaux multi-org, devise de tenue, numérotation légale
3. Décrire le flux opération → mapping → `accounting_links` → `journal_entry`
4. Lister permissions `accounting.*` cibles et hors-scope (tiers/immos/stocks si satellite)

## Fichiers clés

- `docs/syscohada-domain-model.md` (nouveau) ou § dédiée
- référence `docs/tresorerie-syscohada-epic-next.md`
- `docs/tresorerie-domain-model.md` §4.7 / §10

## Critères d'acceptation

- [x] Schéma tables + enums documentés
- [x] Moments de comptabilisation tranchés (recommandations §3 — revue humaine à confirmer)
- [x] Consommation stub `accounting_link` alignée handoff §4
- [x] Hors-scope explicite (payments, fusion tables, liasse…)

## Plan de test

Revue documentaire finance / tech lead.

## Références

- TRESO-001, TRESO-041
- cahier des charges module Trésorerie §2
- livrable : docs/syscohada-domain-model.md
```

---

### SYSCO-002 — Migration plan comptable + exercices — ✅

**Labels :** `admin`, `syscohada`, `comptabilite`, `api`, `priority:high`  
**Branche suggérée :** `feature/syscohada-chart-exercises`  
**Livrable :** [`database/migrations/add_syscohada_chart_of_accounts.sql`](../database/migrations/add_syscohada_chart_of_accounts.sql) · [`database/migrations/add_syscohada_exercises.sql`](../database/migrations/add_syscohada_exercises.sql) · [`packages/types/src/syscohada.ts`](../packages/types/src/syscohada.ts) · API `GET /chart-of-accounts` · `GET /accounting-exercises` · `GET /accounting-periods`

#### Modèle GitHub

```markdown
## Contexte

Sans référentiel de comptes et d’exercices, aucun journal ni mapping ne peut être validé.

## Objectif

1. Migration plan comptable multi-org (code, libellé, classe, type, actif)
2. Migration exercices / périodes (ouverture, clôture, verrouillage)
3. Seed minimal comptes classe 5 / 6 / 7 utiles trésorerie (validés finance)
4. Types `packages/types` (ChartAccount, AccountingExercise, …)

## Fichiers clés

- `database/migrations/add_syscohada_chart_of_accounts.sql`
- `database/migrations/add_syscohada_exercises.sql`
- `packages/types/src/syscohada.ts`
- `apps/api/src/modules/resources/chart-of-accounts/`
- `apps/api/src/modules/resources/accounting-exercises/`
- seed RBAC optionnel plus tard (SYSCO-009)

## Critères d'acceptation

- [x] CRUD lecture plan + exercices via API minimale (`treasury.accounting_link.read` bridge)
- [x] Contraintes unicité (org + code compte ; org + code exercice) via colonne générée soft-delete
- [x] Soft-delete / actif cohérents avec conventions TRESO
- [x] Pas encore d’écritures (SYSCO-003)

## Plan de test

```bash
pnpm db:sync
# puis API démarrée :
# GET /api/chart-of-accounts?organizationId=00000000-0000-4000-8000-000000000001
# GET /api/accounting-exercises?organizationId=…&includePeriods=true
```

## Références

- SYSCO-001 · docs/syscohada-domain-model.md §5.1–5.3
- handoff §2.1
```

---

### SYSCO-003 — Migration journaux / écritures / lignes — ✅

**Labels :** `admin`, `syscohada`, `comptabilite`, `api`, `priority:high`  
**Branche suggérée :** `feature/syscohada-journals-entries`  
**Livrable :** [`database/migrations/add_syscohada_journals_entries.sql`](../database/migrations/add_syscohada_journals_entries.sql) · API `GET/POST /journal-entries` · `GET /journal-lines` · `GET /accounting-journals` · types `JournalEntry` / `AccountingJournal`

#### Modèle GitHub

```markdown
## Contexte

Les écritures SYSCOHADA doivent vivre hors stub : journal paramétrable + pièce + lignes équilibrées.

## Objectif

1. Migration journaux (achats, ventes, banque, caisse, OD, …) paramétrables par org
2. Migration `journal_entries` + `journal_lines` (compte, débit/crédit cents, libellé, axe optionnel)
3. Règle métier : somme débits = somme crédits ; pièce rattachée à un exercice/période ouverte
4. API Nest : créer/consulter écriture ; liste filtrée (journal, période, compte)

## Fichiers clés

- `database/migrations/add_syscohada_journals_entries.sql`
- `apps/api/src/modules/resources/accounting-journals/`
- `apps/api/src/modules/resources/journal-entries/`
- `packages/types/src/syscohada.ts`

## Critères d'acceptation

- [x] Écriture équilibrée persistée
- [x] Rejet si période verrouillée / exercice clos
- [x] Numérotation légale `{journal.code}-{exercise.code}-{seq:05d}` par journal+exercice
- [x] `journal_entry_id` encore non branché sur `accounting_links` (SYSCO-005)

## Plan de test

```bash
pnpm db:sync
# POST /api/journal-entries — 2 lignes équilibrées (status posted)
# POST déséquilibrée → 400
# GET /api/journal-lines?accountId=…&postedOnly=true
```

## Références

- SYSCO-002 · docs/syscohada-domain-model.md §5.4–5.6 / §8
- handoff §2.2
```

---

### SYSCO-004 — Moteur mapping (remplace skeleton) + job/API « comptabiliser » — ✅

**Labels :** `admin`, `syscohada`, `comptabilite`, `api`, `priority:high`  
**Branche suggérée :** `feature/syscohada-mapping-engine`  
**Livrable :** [`database/migrations/add_syscohada_mapping_rules.sql`](../database/migrations/add_syscohada_mapping_rules.sql) · `AccountingMappingEngine` · `POST /accounting-links/post` · `POST /accounting-links/skip` · `GET mapping-config` `stub:false`

#### Modèle GitHub

```markdown
## Contexte

Aujourd’hui `TREASURY_ACCOUNTING_MAPPING_CONFIG` expose des hints texte (`57`, `70`…) avec `stub: true`. L’épic doit résoudre de vrais comptes du plan.

## Objectif

1. Remplacer le skeleton in-process par référentiel mapping (org + version)
2. Résoudre `mapping_rule_key` depuis `source` / `payment_method` / type d’op
3. API « Comptabiliser » → pending → écriture → linked
4. Flag `stub: false` + schemaVersion sur mapping-config

## Fichiers clés

- `database/migrations/add_syscohada_mapping_rules.sql`
- `apps/api/.../accounting-mapping.engine.ts`
- `apps/api/.../accounting-posting.service.ts`
- `treasury-accounting-mapping.config.ts` (deprecated)

## Critères d'acceptation

- [x] Mapping résolu vers comptes du plan (SYSCO-002)
- [x] Idempotence : rejeu safe si déjà `linked` (noop)
- [x] Cas `skipped` sans écriture (`POST /accounting-links/skip`)
- [x] Hints stub plus utilisés (`stub: false`, config DB)

## Plan de test

```bash
pnpm db:sync
# POST /api/accounting-links/post { fundOpType, fundOpId } sur entrée cash recorded
# Rejeu → noop:true
# POST /api/accounting-links/skip …
```

## Références

- TRESO-039 · SYSCO-001 §3 · handoff §4 · SYSCO-005 inclus dans le flux post
```

---

### SYSCO-005 — Remplir `accounting_links.journal_entry_id` + statuts — ✅

**Labels :** `admin`, `syscohada`, `comptabilite`, `api`, `priority:high`  
**Branche suggérée :** `feature/syscohada-accounting-links-link`  
**Livrable :** flux `pending` → `linked` dans `AccountingPostingService` · gate void inchangée · skip / recreate documentés

#### Modèle GitHub

```markdown
## Contexte

Le stub permet déjà `accounting_links` et interdit le void si `status = linked`. Il faut brancher la génération d’écritures sur ce pont.

## Objectif

1. Après génération écriture : upsert link, `journal_entry_id`, `status = linked`
2. Flux `pending` → reprise ; `linked` → no-op
3. `skipped` : pas d’écriture
4. Soft-delete : unique parmi non-deleted (existant)

## Fichiers clés

- `accounting-posting.service.ts`
- `assertFundOpNotAccountingLinked` (void — inchangé)

## Critères d'acceptation

- [x] Opération comptabilisée → link `linked` + UUID écriture
- [x] Void fond toujours bloqué si linked
- [x] Contrepassation : nouvelle pièce (doc domaine) — hors MVP post
- [x] Unique contrainte respectée (idempotence)

## Plan de test

Créer entrée recorded → POST post → GET link ; tenter void → refus ; rejeu post → noop.

## Références

- TRESO-039, TRESO-033
- SYSCO-003, SYSCO-004
```

---

### SYSCO-006 — UI journal + grand livre + balance

**Labels :** `admin`, `syscohada`, `comptabilite`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/syscohada-ui-books`  
**Livrable :** pages Admin journal / grand livre / balance · filtres période/journal/compte · i18n · permissions lecture

#### Modèle GitHub

```markdown
## Contexte

Les états de livres sont le cœur de la consultation réglementaire ; pas de faux écrans avant données réelles.

## Objectif

1. UI liste/détail journal (écritures d’un journal + période)
2. UI grand livre par compte
3. UI balance générale (et auxiliaire si ouvert)
4. Filtres : exercice, période, journal, compte, org
5. i18n fr/en/es

## Fichiers clés

- `apps/admin/app/.../tresorerie/comptabilite/**` ou routes `/comptabilite/*`
- client API écritures
- nav + `admin-route-permissions`

## Critères d'acceptation

- [ ] Écritures créées via API visibles au journal
- [ ] Balance cohérente avec lignes (totaux débit/crédit)
- [ ] Accès restreint permissions lecture compta
- [ ] Pas de données mock inventées

## Plan de test

Seed écritures → naviguer journal → grand livre compte X → balance période.

## Références

- SYSCO-003
- handoff §2.2 / §4.5
```

---

### SYSCO-007 — Livres caisse / banque + rapprochements

**Labels :** `admin`, `syscohada`, `comptabilite`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/syscohada-cash-bank-books`  
**Livrable :** livre de caisse · livre de banque · rapprochements relevés ↔ écritures/ops · mapping mobile money (sous-compte)

#### Modèle GitHub

```markdown
## Contexte

Aligner la trésorerie réglementaire (classe 5) sur les modes de paiement opérationnels (`cash`, virement, chèque, mobile money).

## Objectif

1. Livre de caisse : mouvements liés espèces / compte caisse
2. Livre de banque : virements / chèques / compte banque
3. Rapprochement bancaire MVP : importer/saisir solde relevé, pointer écritures
4. Mapping distinct mobile money (sous-compte) — hors stub actuel

## Fichiers clés

- API livres + rapprochements
- UI Admin sous Comptabilité / Trésorerie réglementaire
- comptes classe 5 (SYSCO-002)

## Critères d'acceptation

- [ ] Filtre mode paiement / compte cohérent avec fund ops comptabilisées
- [ ] Écart rapprochement visible
- [ ] Mobile money non mélangé à caisse sans règle explicite

## Plan de test

Comptabiliser entrée cash + sortie virement ; vérifier livres ; pointer 1 ligne relevé.

## Références

- SYSCO-003, SYSCO-005
- handoff §2.3
```

---

### SYSCO-008 — Clôtures + bilan + compte de résultat

**Labels :** `admin`, `syscohada`, `comptabilite`, `enhancement`, `priority:medium`  
**Branche suggérée :** `feature/syscohada-closing-statements`  
**Livrable :** clôture périodique/annuelle · verrou écritures · report à nouveau · bilan · CR · annexes MVP selon format OHADA retenu

#### Modèle GitHub

```markdown
## Contexte

États financiers réglementaires après livres opérationnels ; dépend des écritures et de la balance.

## Objectif

1. Clôture période / exercice : verrouiller saisie, OD de clôture si besoin
2. Report à nouveau
3. Bilan actif/passif SYSCOHADA
4. Compte de résultat charges/produits
5. Annexes / états réglementaires MVP (format OHADA décidé en SYSCO-001)

## Fichiers clés

- API clôture + génération états
- UI bilans / CR
- permissions clôture (rôle finance)

## Critères d'acceptation

- [ ] Impossible de poster une écriture sur période close
- [ ] Bilan et CR cohérents avec balance
- [ ] Exports fiscal/liasse hors scope sauf exigence explicite

## Plan de test

Clôturer période test ; tenter POST écriture → refus ; générer bilan/CR.

## Références

- SYSCO-006
- handoff §2.5
```

---

### SYSCO-009 — RBAC `accounting.*` + audit écritures

**Labels :** `admin`, `syscohada`, `comptabilite`, `api`, `priority:high`  
**Branche suggérée :** `feature/syscohada-rbac-audit`  
**Livrable :** catalogue permissions `accounting.*` · seed rôles · audit écritures (corrélation possible avec `treasury_audit_logs`)

#### Modèle GitHub

```markdown
## Contexte

Le stub n’expose que `treasury.accounting_link.read`. La compta réelle exige un RBAC plus fin et un audit des écritures.

## Objectif

1. Permissions : `accounting.chart.read`, `accounting.journal.read|write`, `accounting.post`, `accounting.close`, `accounting.reconcile`, …
2. Seed / sync catalogue (pattern TRESO-008)
3. Journal d’audit écritures (user, action, old/new, `journal_entry_id`)
4. Corrélation optionnelle avec `treasury_audit_logs` (ne pas fusionner les tables)

## Fichiers clés

- `apps/api/src/modules/rbac/`
- seed permissions
- module audit accounting
- Admin route permissions

## Critères d'acceptation

- [ ] 403 sans permission sur POST écriture / clôture
- [ ] Nav Admin masquée selon droits
- [ ] Audit consultable pour une écriture
- [ ] `treasury.*` inchangé pour flux opérationnels

## Plan de test

Compte lecture seule : GET OK, POST 403 ; super_admin bypass ; entrée audit après post.

## Références

- TRESO-008, TRESO-031
- handoff §2.6
```

---

### SYSCO-010 — Remplacer placeholder `/tresorerie/comptabilite`

**Labels :** `admin`, `syscohada`, `comptabilite`, `enhancement`, `priority:high`  
**Branche suggérée :** `feature/syscohada-ui-comptabilite-hub`  
**Livrable :** hub Comptabilité réel · détail lien · actions Comptabiliser / Ignorer / Voir au journal · retrait notice « à venir » (lien doc conservé jusqu’à MVP états)

#### Modèle GitHub

```markdown
## Contexte

TRESO-040 livre une page placeholder + liste stub `accounting_links`. Elle doit devenir le point d’entrée opérationnel compta.

## Objectif

1. Remplacer la notice « épic à venir » par hub : liens, écritures associées, accès livres
2. Actions : Comptabiliser / Ignorer (`skipped`) / Voir au journal
3. Détail d’un `accounting_link` (statut, mapping_rule_key, journal_entry_id)
4. Conserver lien doc handoff jusqu’à MVP bilans (SYSCO-008)

## Fichiers clés

- `apps/admin/.../tresorerie/comptabilite`
- client `listAccountingLinks`, `createAccountingLink`, mapping config
- i18n

## Critères d'acceptation

- [ ] Plus de faux écrans ; UI branchée données réelles
- [ ] Action Comptabiliser appelle SYSCO-004/005
- [ ] Permissions `accounting.*` / bridge respectées
- [ ] Deep-link vers écriture journal

## Plan de test

Depuis une entrée `recorded` : Comptabiliser → statut linked → Voir au journal.

## Références

- TRESO-040
- SYSCO-005, SYSCO-006
- handoff §4.5
```

---

### SYSCO-011 — E2E : opération → linked → visible au journal

**Labels :** `admin`, `syscohada`, `comptabilite`, `testing`, `priority:high`  
**Branche suggérée :** `feature/syscohada-e2e-posting`  
**Livrable :** spec Playwright happy path comptabilisation · helpers · couverture void bloqué si linked

#### Modèle GitHub

```markdown
## Contexte

Valider le pont bout-en-bout comme TRESO-042/043 pour le flux fond → écriture.

## Objectif

1. Spec : créer entrée (ou sortie) → Comptabiliser → link `linked` → visible au journal / balance
2. Assert void refusé après linked
3. Données isolées (`E2E-SYSCO-<timestamp>`)
4. Sélecteurs stables

## Fichiers clés

- `apps/admin/tests/e2e/**`
- helpers treasury / accounting e2e

## Critères d'acceptation

- [ ] Happy path vert localement
- [ ] Void bloqué couvert
- [ ] Pas de dépendance à des mocks UI

## Plan de test

```bash
pnpm --filter @africatourismgate/admin test:e2e -- syscohada
```

## Notes

- Prérequis : API + MySQL seedés, plan comptable + mapping seed (SYSCO-002/004), Chromium Playwright.
- CI : ne pas ajouter de job admin lourd hors demande explicite (même contrainte TRESO-042).

## Références

- TRESO-042, TRESO-043
- SYSCO-005, SYSCO-006, SYSCO-010
```

---

### SYSCO-012 — Sync OpenAPI + doc module compta

**Labels :** `admin`, `syscohada`, `comptabilite`, `docs`, `priority:low`  
**Branche suggérée :** `feature/syscohada-openapi-readme`  
**Livrable :** OpenAPI régénéré · `packages/api-client` · README module comptabilité · liens croisés handoff / tasks

#### Modèle GitHub

```markdown
## Contexte

Finaliser l’intégration client Admin et documenter le module comptable SYSCOHADA (pattern TRESO-045).

## Objectif

1. Régénérer OpenAPI / `packages/api-client` pour ressources accounting / syscohada
2. README court : routes Admin, permissions `accounting.*`, flux comptabilisation, livres
3. Pointer vers `admin-syscohada-github-tasks.md` + handoff + domaine

## Fichiers clés

- `packages/api-client`
- scripts OpenAPI monorepo
- `docs/admin-syscohada-readme.md` (ou section dans readme trésorerie)

## Critères d'acceptation

- [ ] Client régénéré consommé par Admin
- [ ] README à jour
- [ ] Liens docs croisés (tasks, domain, handoff, TRESO)

## Plan de test

```bash
pnpm --filter @africatourismgate/api openapi:export
pnpm codegen:api
pnpm --filter @africatourismgate/api-client build
pnpm --filter @africatourismgate/admin exec tsc --noEmit
```

## Références

- TRESO-045
- ensemble SYSCO-003…010
```

---

## Décisions à trancher avant / pendant l’épic

Recommandations figées dans [syscohada-domain-model.md](./syscohada-domain-model.md) §3 — confirmation revue finance / tech lead encore ouverte.

| Sujet | Question | Impact tâches |
| ----- | -------- | ------------- |
| Moment de comptabilisation | `recorded` + action manuelle MVP (reco) | SYSCO-001 ✅, SYSCO-004 |
| Multi-devise | Une devise de tenue / exercice (reco) | SYSCO-001 ✅, SYSCO-002, SYSCO-008 |
| Soft-delete + unique | Unique parmi non soft-deleted (reco) | SYSCO-005 |
| Contrepassation | Nouvelle écriture + historique (reco) | SYSCO-005, SYSCO-008 |
| Périmètre tiers / immos | Épic satellite (reco) | SYSCO-001 ✅ |
| Coexistence `payments` | Écriture via `fund_*` uniquement (reco) | SYSCO-004 |

---

## Critères de prêt épic (suivi)

- [x] Périmètre reporté listé (handoff §2)
- [x] Dépendances lot TRESO listées (handoff §3)
- [x] Consommation `accounting_link` décrite (handoff §4)
- [x] Doc tâches `admin-syscohada-github-tasks.md` (SYSCO-001…012)
- [ ] Revue finance / tech lead (comptes, moments de comptabilisation)
- [ ] Labels GitHub `syscohada` / `comptabilite` créés sur le dépôt
- [ ] Issues GitHub créées depuis les modèles ci-dessus

---

*Document pour onboarding contributeur comptabilité et création d’issues GitHub. Mettre à jour ce fichier quand une tâche est terminée (marquer ✅) ou lorsque de nouvelles dettes sont identifiées.*
