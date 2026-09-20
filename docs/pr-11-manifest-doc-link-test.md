# PR-11 — Scénario de test (liaison document identité ↔ manifeste)

Branche : `feature/pr-11-manifest-doc-link`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-11)

## Décision (cadrage)

| Élément | Décision |
| ------- | -------- |
| Colonne | `manifest_entry_id` CHAR(36) **NULL** (historique) ; FK → `booking_manifest_entries` `ON DELETE SET NULL` |
| Nouveaux uploads | **`manifestEntryId` obligatoire** (FormData) |
| Versionnement | Portée `(bookingId, manifestEntryId, documentType)` |
| Backfill | Best-effort : docs ordonnés par `created_at` ↔ entrées par `sort_order` ; sinon `NULL` |
| Review | Approve / resubmit / reject **inchangés** (par `documentId`) |
| POS | Pas d’upload identité fichier (hors scope) |

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| `POST /bookings/:id/identity-documents` | Refuse sans `manifestEntryId` (400) |
| Entrée | Doit exister, même `booking_id`, non soft-deleted |
| Garde `pending_review` | Un seul pending par `(booking, entrée, type)` — **pas** global par type |
| Checkout | Create manifeste **séquentiel** → upload avec `entry.id` ; échecs upload remontés |
| Compte | Docs groupés par voyageur ; upload avec sélection voyageur |
| Admin Documents | Docs groupés sous le nom voyageur ; section « non rattachés » |
| Assisté | Doc lié via `traveler.id` (= entry id), **sans** heuristique d’index |

Migration : `database/migrations/add_identity_document_manifest_entry_id.sql`

Prérequis :
1. Migration PR-11 appliquée.
2. Compte client + au moins un produit réservable multi-voyageurs (ex. 2+ passagers).
3. Staff admin avec `bookings.write` / `bookings.approve`.

---

## Tests manuels

### A. Migration + backfill

1. Appliquer `add_identity_document_manifest_entry_id.sql`.
2. Assert : colonne `manifest_entry_id` nullable + index + FK.
3. Booking historique avec N docs et N entrées : backfill best-effort (ordre `created_at` ↔ `sort_order`).
4. Docs orphelins (pas d’entrée) restent `NULL` et listables.

### B. API — `manifestEntryId` requis

```bash
# Sans manifestEntryId → 400
curl -s -X POST "$API/bookings/$BOOKING_ID/identity-documents" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -F "file=@passport.jpg" \
  -F "documentType=passport"
# Assert: 400 (manifestEntryId requis)

# Avec entrée d’un autre booking → 400
# Avec entrée valide → 201 + body.manifestEntryId === entryId
```

### C. Checkout multi-passagers (2+ fichiers)

1. Web → produit multi-voyageurs → récap manifeste : 2 voyageurs, chacun un fichier identité.
2. Confirmer la réservation.
3. Assert DB / API `GET …/identity-documents` :
   - 2 docs `passport` (ou type choisi) ;
   - `manifestEntryId` distincts, chacun = id de l’entrée créée ;
   - pas d’échec silencieux sur le 2e upload.
4. Rejouer : 2e voyageur ne doit **pas** recevoir « déjà en cours de vérification » à cause du 1er.

### D. Compte client

1. Compte → détail réservation.
2. Section pièce d’identité : docs listés **sous** chaque voyageur.
3. Upload : sélectionner voyageur B → envoyer → doc rattaché à B uniquement.
4. Documents historiques `manifestEntryId = null` : section « Documents non rattachés ».

### E. Admin — onglet Documents

1. Admin → booking → Documents.
2. Assert : docs groupés sous le nom du voyageur (pas une liste plate sans contexte).
3. Valider / demander une version claire / refuser : inchangé (par document).
4. Section « non rattachés » si docs `NULL`.

### F. Assisté — sans heuristique d’index

1. Booking assisté multi-voyageurs avec docs liés.
2. Panneau validation assistée → « Voir document » sur voyageur 2.
3. Assert : modal montre le doc de **voyageur 2** (`manifestEntryId === entry.id`), pas le doc d’index 1.
4. Réordonner / supprimer une entrée : plus de décalage index ↔ fichier.

### G. Versionnement par entrée

1. Voyageur A : passport `pending_review` → second upload passport A → **400**.
2. Voyageur B : upload passport → **201** (indépendant de A).
3. Après resubmit demandé sur A → nouvelle version A (`version` incrémentée) OK.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/add_identity_document_manifest_entry_id.sql` |
| Entity / DTO / types | `booking-identity-document.entity.ts`, DTO, `packages/types/src/booking.ts` |
| API upload | `booking-identity-documents.service.ts`, `bookings.controller.ts` |
| Clients upload | `apps/web/lib/api/booking-identity-documents.ts`, `apps/admin/lib/booking-identity-documents.ts` |
| Checkout | `reservation-recap-page-content.tsx` (`persistManifestEntries`) |
| Compte | `booking-identity-documents-section.tsx`, `account-booking-detail.tsx`, `account-booking-manifest-section.tsx` |
| Admin | `booking-identity-documents-panel.tsx`, `booking-assisted-approval-panel.tsx` |
| Helper | `apps/admin/lib/booking-traveler-documents.ts` (`latestDocumentForManifestEntry`) |

---

## Hors scope

- Rôle auth partenaire (PR-10)
- Upload identité fichier POS
- Migration forcée des anciens docs (backfill best-effort seulement)
- Changement des handlers review (approve / resubmit / reject)
