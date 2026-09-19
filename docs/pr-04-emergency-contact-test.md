# PR-04 — Scénario de test (contact d’urgence)

Branche : `feature/pr-04-emergency-contact`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-04)

## Règle sous test

| Champ | Checkout / create API | DB / list / PDF legacy |
| ----- | --------------------- | ---------------------- |
| `emergencyContactName` | **requis** | nullable |
| `emergencyContactPhone` | **requis** | nullable |
| `emergencyContactEmail` | optionnel | nullable |
| `emergencyContactCountry` | optionnel (code ISO ou libellé) | nullable |
| `emergencyContactAddress` | optionnel | nullable |

Surfaces : checkout web, compte client, admin, POS, PDF confirmation.

Migration : `database/migrations/add_manifest_emergency_contact.sql`

---

## Tests manuels

### A. Checkout web

1. Ouvrir un forfait / activité → récap.
2. Vérifier la section **Contact d’urgence** (nom + téléphone avec `*`).
3. Remplir nom / nationalité / n° pièce, laisser le téléphone d’urgence vide → Demander une réservation → **erreur**, pas de redirection.
4. Remplir nom + téléphone d’urgence (email / pays / adresse optionnels) → **succès**.

### B. Compte client

1. Compte → détail réservation → Ajouter / Modifier un voyageur.
2. Sans nom ou téléphone d’urgence → **erreur** locale.
3. Avec les 2 champs → enregistrement OK ; résumé contact visible sur la fiche.

### C. Admin

1. Réservation → Manifeste → Ajouter / éditer un voyageur.
2. Même validation + champs visibles.
3. `POST` / `PATCH` API sans `emergencyContactName` ou `emergencyContactPhone` → **400**.

### D. POS

1. Vente → Manifeste → enregistrer sans téléphone d’urgence → **erreur**.
2. Nom + téléphone d’urgence → OK.

### E. PDF confirmation

1. Confirmer une réservation avec contact d’urgence renseigné.
2. Ouvrir la PJ email ou télécharger via le compte (`confirmation-pdf`).
3. Colonne Notes voyageur : ligne `Urgence` / `Emergency` / `Emergencia` avec nom + téléphone (et optionnels s’ils sont renseignés).

### F. i18n

1. Basculer FR / EN / ES sur le récap et le compte.
2. Libellés section + messages d’erreur traduits (pas de clés brutes).

---

## Tests automatisés

### Unit (API — PDF)

```bash
cd apps/api
pnpm exec jest --config ./test/jest-unit.json --runInBand booking-detail-pdf.spec.ts
```

Assert : nom + téléphone d’urgence présents dans les notes voyageur (`Urgence: …`).

### Playwright

```bash
cd apps/web
pnpm exec playwright test tests/e2e/manifest-checkout-validation.spec.ts
```

| Fichier | Rôle |
| ------- | ---- |
| `tests/e2e/manifest-checkout-validation.spec.ts` | Bloqué sans n° pièce ; bloqué sans téléphone urgence ; OK avec urgence |
| `tests/e2e/helpers/fill-manifest.ts` | Remplit aussi nom + téléphone d’urgence (+ mock API) |
| Specs checkout existantes | Utilisent `fillCheckoutManifest` |

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/add_manifest_emergency_contact.sql` |
| Entity / DTO / service | `booking-manifest-entry.entity.ts`, `booking-manifest-entry.dto.ts`, `booking-manifest.service.ts` |
| Types | `packages/types/src/booking.ts` |
| Checkout / compte / admin / POS | `checkout-manifest-form.tsx`, `account-booking-manifest-section.tsx`, `booking-manifest-section.tsx` (admin), POS sale-manifest |
| PDF | `booking-detail-pdf.types.ts`, `.labels.ts`, `.renderer.ts`, `.service.ts` |
| i18n | `apps/web/lib/i18n/translations.ts`, `translations-es.ts` (+ admin / POS si présents) |

---

## Checklist d’acceptation PR-04

- [ ] Checkout refuse une entrée sans nom + téléphone d’urgence
- [ ] Admin / compte / POS alignés
- [ ] Contact visible dans le PDF (Notes)
- [ ] i18n FR / EN / ES
- [ ] Migration SQL appliquée
- [ ] Jest `booking-detail-pdf` + Playwright `manifest-checkout-validation` verts
