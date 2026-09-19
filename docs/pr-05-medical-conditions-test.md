# PR-05 — Scénario de test (conditions médicales structurées)

Branche : `feature/pr-05-medical-conditions`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-05)  
Dépend de : [PR-04](./pr-04-emergency-contact-test.md) (recommandé, même zone manifeste)

## Règle sous test

| Champ | Checkout / create / update | DB / list / PDF |
| ----- | -------------------------- | --------------- |
| `allergies` | optionnel | nullable |
| `seriousMedicalConditions` | optionnel | nullable |
| `currentMedications` | optionnel | nullable |
| `dietaryNotes` | optionnel | nullable |
| `conditions` (legacy) | **lecture seule** — non écrit par les nouveaux formulaires | nullable ; migré vers `other` si `other` vide |

Surfaces : checkout web, compte client, admin, POS, PDF confirmation.

Migration : `database/migrations/add_manifest_medical_conditions.sql`

---

## Tests manuels

### A. Checkout web

1. Ouvrir un forfait / activité → récap.
2. Vérifier la section **Informations médicales** (4 textareas sans `*`).
3. Soumettre avec nom / nationalité / n° pièce / urgence **sans** champs médicaux → **succès**.
4. Remplir allergies / traitements (ou autres) → succès ; données persistées.

### B. Compte client

1. Compte → détail réservation → Ajouter / Modifier un voyageur.
2. Renseigner un ou plusieurs champs médicaux → enregistrement OK ; résumé visible sur la fiche.
3. Ancienne entrée avec seulement `conditions` : affichage sous **Anciennes notes** / Legacy notes.

### C. Admin

1. Réservation → Manifeste → Ajouter / éditer un voyageur.
2. Section médicale + colonne résumé (structured ou legacy).
3. `POST` / `PATCH` avec les 4 champs optionnels → **200** ; body `conditions` n’écrase pas la colonne legacy (fold vers `other` si applicable).

### D. POS

1. Vente → Manifeste → enregistrer sans champs médicaux → OK (si nom / nationalité / pièce / urgence OK).
2. Remplir allergies + notes alimentaires → OK.

### E. PDF confirmation

1. Confirmer une réservation avec champs médicaux structurés.
2. Ouvrir la PJ ou `confirmation-pdf` : Notes = préfixes `Allergies` / `Conditions graves` / `Traitements` / `Alimentation` (FR) ou équivalents EN/ES.
3. Ancienne résa avec seulement `conditions` : préfixe `Anciennes notes` / `Legacy notes` / `Notas antiguas`.

### F. Rétrocompat migration

1. Appliquer la migration sur une base contenant des lignes `conditions` non vides et `other` vide.
2. Vérifier `other = conditions` pour ces lignes ; colonnes `allergies`, `serious_medical_conditions`, `current_medications`, `dietary_notes` présentes.

### G. i18n

1. Basculer FR / EN / ES (checkout, compte, admin).
2. Titre de section + labels + placeholders traduits (pas de clés brutes).

---

## Tests automatisés

### Unit (API — PDF)

```bash
cd apps/api
pnpm exec jest --config ./test/jest-unit.json --runInBand booking-detail-pdf.spec.ts
```

Assert : champs structurés + legacy `conditions` dans les notes voyageur.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/add_manifest_medical_conditions.sql` |
| Entity / DTO / service | `booking-manifest-entry.entity.ts`, `booking-manifest-entry.dto.ts`, `booking-manifest.service.ts` |
| Types | `packages/types/src/booking.ts` |
| Checkout / compte / admin / POS | `checkout-manifest-form.tsx`, `account-booking-manifest-section.tsx`, `booking-manifest-section.tsx` (admin), POS sale-manifest |
| PDF | `booking-detail-pdf.types.ts`, `.labels.ts`, `.renderer.ts`, `.service.ts` |
| i18n | `translations.ts`, `translations-es.ts`, `apps/admin/messages/*/modules/bookings.json`, `apps/pos/config/sale.ts` |

---

## Checklist d’acceptation PR-05

- [ ] Quatre champs médicaux optionnels sur checkout / compte / admin / POS
- [ ] Anciennes résas avec `conditions` encore lisibles (admin + PDF)
- [ ] Migration SQL + copie `conditions` → `other` si `other` vide
- [ ] PDF Notes avec préfixes structurés (+ legacy)
- [ ] i18n FR / EN / ES
- [ ] Jest `booking-detail-pdf` vert
