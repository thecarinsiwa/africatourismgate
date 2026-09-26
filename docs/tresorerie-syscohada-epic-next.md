# Handoff — Épic SYSCOHADA (suite Trésorerie)

> **Document de bascule** pour un futur lot de tâches GitHub (comptabilité réglementaire).  
> **Lot actuel (Admin + API trésorerie opérationnelle) :** hors scope volontaire — voir [admin-tresorerie-readme.md](./admin-tresorerie-readme.md), [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md) (TRESO-001 → TRESO-045) et [tresorerie-domain-model.md](./tresorerie-domain-model.md) §10.  
> **Stub livré :** TRESO-039 (`accounting_links`) · TRESO-040 (UI `/tresorerie/comptabilite`).

**Statut :** prêt à dériver un doc tâches du type `docs/admin-syscohada-github-tasks.md`.  
**Références métier :** cahier des charges module Trésorerie §2 (comptabilité / états réglementaires) · domaine §4.7 / §10.

---

## 1. Pourquoi ce handoff

Le lot Trésorerie Admin livre :

- Flux opérationnels : entrées, états de besoin, sorties, budgets, externes, audit, rapports légers, void.
- Un **pont stub** `accounting_links` + skeleton de mapping — **sans** génération d’écritures.

L’épic suivant doit brancher la **comptabilité SYSCOHADA** (OHADA) sur ces opérations, sans refondre le module `payments` commerce ni casser le void / l’audit déjà en place.

---

## 2. Périmètre reporté (exhaustif)

Tout ce qui suit est **exclu** du lot TRESO actuel et **cible** de l’épic SYSCOHADA.

### 2.1. Référentiels & paramétrage

| Livrable | Notes |
| -------- | ----- |
| Plan comptable SYSCOHADA | Classes 1–8, comptes, sous-comptes ; multi-org |
| Journaux paramétrables | Achats, ventes, banque, caisse, OD, etc. |
| Exercices / périodes comptables | Ouverture, clôture, verrouillage |
| Devises & taux | Conversion pour états ; cohérence avec `currency` trésorerie (cents + ISO) |
| Établissements / axes analytiques | Optionnel ; croisement budgets TRESO |
| Numérotation légale | Pièces, journaux, pièces justificatives |

### 2.2. Écritures & livres

| Livrable | Notes |
| -------- | ----- |
| Génération d’écritures | À partir de `fund_entries` / `fund_exits` (+ règles mapping) |
| Journal (livre-journal) | Saisie / consultation / export |
| Grand livre | Par compte, période |
| Balance | Générale / auxiliaire |
| Lettrage | Clients / fournisseurs (si ouvertures auxiliaires) |
| Contrepassation / OD | Corrections, od de clôture |

### 2.3. Trésorerie réglementaire (caisse / banque)

| Livrable | Notes |
| -------- | ----- |
| Livre de caisse | Alignement espèces (`payment_method = cash`) |
| Livre de banque | Virements / chèques / relevés |
| Comptes de trésorerie SYSCOHADA | Classe 5 (caisse, banques, moyens de paiement) |
| Rapprochements bancaires | Relevés ↔ écritures / opérations trésorerie |
| Mobile money réglementaire | Mapping distinct ou sous-compte (hors stub actuel) |

### 2.4. Tiers & stocks (si exigés par le cahier §2)

| Livrable | Notes |
| -------- | ----- |
| Comptes clients / fournisseurs complets | Auxiliaires ; lien éventuel organisations / bookings |
| Immobilisations | Amortissements — hors trésorerie opérationnelle |
| Stocks / inventaires | Si le cahier les rattache à la compta (sinon épic séparé) |

### 2.5. Clôtures & états financiers

| Livrable | Notes |
| -------- | ----- |
| Clôtures périodiques / annuelles | Verrou écritures, report à nouveau |
| Bilan | Actif / passif SYSCOHADA |
| Compte de résultat (CR) | Charges / produits |
| Annexes & états réglementaires | Selon format OHADA retenu |
| Exports fiscal / liasse | Hors MVP sauf exigence explicite |

### 2.6. Contrôle, sécurité, Admin

| Livrable | Notes |
| -------- | ----- |
| Permissions `accounting.*` (ou équivalent) | Plus fin que le stub `treasury.accounting_link.read` |
| UI réelle Comptabilité | Remplacer le placeholder TRESO-040 (pas de faux écrans avant) |
| Audit des écritures | Extension ou module dédié (corrélation `treasury_audit_logs`) |
| Verrouillage void | Déjà amorcé : void interdit si `accounting_links.status = linked` |

### 2.7. Hors cible même pour l’épic suivant (sauf décision produit)

- Remplacer le module `payments` (encaissements commerce) par la compta.
- Fusionner `fund_entries` et `payments` en une seule table.
- Refonte globale du RBAC hors périmètre comptable.

---

## 3. Dépendances au lot Trésorerie actuel

### 3.1. Artefacts à consommer tels quels

| Artefact | Rôle pour SYSCOHADA |
| -------- | ------------------- |
| `fund_entries` / `fund_exits` | Source d’opérations à comptabiliser (montants cents, devise, date, mode, org) |
| Pivots ↔ `bookings` | Traçabilité analytique / clients |
| Attachments | Justificatifs pièces |
| `expense_requests` + historique | Circuit avant décaissement ; écriture typiquement au `disbursed`/`recorded` |
| `budgets` + vs-actual | Pas d’écritures ; peut alimenter contrôle budgétaire post-compta |
| `treasury_audit_logs` | Corrélation métier ; ne remplace pas l’audit comptable |
| `treasury-reports` | Agrégats opérationnels — **pas** un substitut journal/balance |
| RBAC `treasury.*` | Continuer à protéger les flux ; ajouter permissions compta |
| UI `/tresorerie/*` | Hub, listes, void, placeholder compta |

### 3.2. Stub pont — TRESO-039 / TRESO-040

| Élément | Emplacement / contrat |
| ------- | --------------------- |
| Table `accounting_links` | Migration `database/migrations/add_treasury_accounting_links.sql` |
| API | `GET/POST /accounting-links`, `GET/PATCH /accounting-links/:id` |
| Mapping skeleton | `GET /accounting-links/mapping-config` · `TREASURY_ACCOUNTING_MAPPING_CONFIG` |
| Types | `AccountingLink`, `CreateAccountingLinkRequest`, `AccountingMappingConfig` (`packages/types`) |
| Client Admin | `listAccountingLinks`, `createAccountingLink`, `getAccountingMappingConfig` |
| UI | `/tresorerie/comptabilite` — liste stub + notice handoff |
| Gate void | `assertFundOpNotAccountingLinked` si `status = linked` |

Champs clés du lien :

| Champ | Usage futur |
| ----- | ----------- |
| `fund_op_type` + `fund_op_id` | Opération trésorerie source |
| `journal_entry_id` | **Nullable aujourd’hui** → UUID de l’écriture SYSCOHADA une fois générée |
| `mapping_rule_key` | Clé dans le référentiel de mapping (évoluera hors stub) |
| `status` | `pending` → génération ; `linked` → écriture posée ; `skipped` → exclu volontairement |

### 3.3. Prérequis techniques avant démarrage épic

1. Lot TRESO opérationnel stabilisé (CRUD + void + audit + rapports).
2. Décision produit : multi-exercices, multi-org, devise de tenue.
3. Validation finance des hints de comptes du skeleton (classes 5 / 6 / 7…).
4. Ne pas casser le placeholder Admin tant que les écrans journal/bilan ne sont pas réels (TRESO-040).

---

## 4. Consommation du stub `accounting_link`

### 4.1. Flux cible (happy path)

```mermaid
sequenceDiagram
  participant Op as Fund entry/exit
  participant Map as Mapping engine
  participant Link as accounting_links
  participant JE as journal_entries (futur)

  Op->>Map: opération recorded/disbursed
  Map->>Map: résoudre mapping_rule_key
  Map->>Link: upsert status=pending
  Map->>JE: créer écriture(s) SYSCOHADA
  JE-->>Link: journal_entry_id
  Link->>Link: status=linked
```

1. **Déclencheur** (à figer en tâches) : création / passage à `recorded` (entrée) ou `disbursed`/`recorded` (sortie) ; ou batch nocturne ; ou action manuelle « Comptabiliser ».
2. **Résolution mapping** : à partir de `source` / `payment_method` / type d’op → `mapping_rule_key` (remplacer les placeholders `debitAccountHint` / `creditAccountHint` par de vrais comptes du plan).
3. **Création ou mise à jour** de `accounting_links` (`pending`).
4. **Persistance** des lignes d’écriture (`journal_entries` + `journal_lines` — noms indicatifs).
5. **Rattachement** : `journal_entry_id` renseigné, `status = linked`.
6. **Effets de bord** : void fond interdit (gate existante) ; éventuelle contrepassation via nouvelle écriture + lien ou statut dédié.

### 4.2. Cas `skipped`

- Opération hors périmètre comptable (ex. test, doublon métier).
- Mapping volontairement non appliqué — **ne pas** générer d’écriture ; garder la traçabilité.

### 4.3. Idempotence

- Contrainte unique `(fund_op_type, fund_op_id)` : une opération = un pont.
- Rejeu : si `linked`, no-op ou erreur métier ; si `pending`, reprendre la génération.

### 4.4. Évolution du mapping

| Aujourd’hui (stub) | Épic SYSCOHADA |
| ------------------ | -------------- |
| JSON in-process `TREASURY_ACCOUNTING_MAPPING_CONFIG` | Table / settings org + versioning |
| Hints texte (`57`, `70`…) | Comptes validés du plan |
| `stub: true` dans la réponse API | Flag retiré ou `stub: false` + schema version |

### 4.5. UI

- Remplacer la notice TRESO-040 par : détail du lien, écriture associée, actions « Comptabiliser / Ignorer / Voir au journal ».
- Conserver le lien doc handoff jusqu’à MVP états financiers.

---

## 5. Esquisse de découpage tâches (futur doc)

Préfixe suggéré : **`SYSCO-xxx`**. Document dérivé cible : `docs/admin-syscohada-github-tasks.md` (même convention que TRESO).

| ID indicatif | Titre court | Dépendances lot actuel |
| ------------ | ----------- | ---------------------- |
| SYSCO-001 | Spec domaine comptable OHADA + schéma `chart_of_accounts` / `journal_*` | Domaine TRESO §10 |
| SYSCO-002 | Migration plan comptable + exercices | — |
| SYSCO-003 | Migration journaux / écritures / lignes | SYSCO-002 |
| SYSCO-004 | Moteur mapping (remplace skeleton) + job/API « comptabiliser » | TRESO-039 |
| SYSCO-005 | Remplir `accounting_links.journal_entry_id` + statuts | TRESO-039, SYSCO-003–004 |
| SYSCO-006 | UI journal + grand livre + balance | SYSCO-003 |
| SYSCO-007 | Livres caisse / banque + rapprochements | SYSCO-003, comptes classe 5 |
| SYSCO-008 | Clôtures + bilan + compte de résultat | SYSCO-006 |
| SYSCO-009 | RBAC `accounting.*` + audit écritures | TRESO-008 pattern |
| SYSCO-010 | Remplacer placeholder `/tresorerie/comptabilite` | TRESO-040 |
| SYSCO-011 | E2E : opération → linked → visible au journal | TRESO-042/043 patterns |
| SYSCO-012 | Sync OpenAPI + doc module compta | TRESO-045 pattern |

Effort et priorités à caler avec finance / tech lead lors de l’ouverture de l’épic.

---

## 6. Risques & décisions ouvertes

| Sujet | Question |
| ----- | -------- |
| Moment de comptabilisation | À `recorded` uniquement ? Aussi `disbursed` ? Batch ? |
| Multi-devise | Tenue en XOF/XAF + reports ; ou une devise d’exercice |
| Soft-delete + unique | Lien soft-deleted vs unique `(fund_op_type, fund_op_id)` — politique de recreate |
| Contrepassation | Nouveau `journal_entry` + lien historique vs update in-place |
| Périmètre tiers / immos | Inclus §2 cahier ou épic satellite |
| Coexistence `payments` | Mapping paiement commerce → entrée déjà métier ; écriture SYSCO séparée |

---

## 7. Critères de prêt pour ouvrir l’épic

- [x] Périmètre reporté listé (§2)
- [x] Dépendances lot TRESO listées (§3)
- [x] Consommation `accounting_link` décrite (§4)
- [x] Esquisse IDs tâches pour dériver un doc issues (§5)
- [ ] Revue finance / tech lead (comptes, moments de comptabilisation)
- [ ] Création du doc tâches `admin-syscohada-github-tasks.md` + labels GitHub

---

## 8. Liens

| Doc | Rôle |
| --- | ---- |
| [tresorerie-domain-model.md](./tresorerie-domain-model.md) | Modèle + hors scope §10 |
| [admin-tresorerie-github-tasks.md](./admin-tresorerie-github-tasks.md) | Lot TRESO-001…045 · TRESO-039/040/041 |
| `apps/api/.../treasury-accounting-mapping.config.ts` | Skeleton mapping |
| `apps/admin/.../tresorerie/comptabilite` | Placeholder UI |
