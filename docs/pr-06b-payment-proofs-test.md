# PR-06b — Scénario de test (preuves de paiement — virement)

Branche : `feature/pr-06b-payment-proofs` (ou suite de `feature/pr-06-bank-transfer`)  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-06)  
Dépend de : [pr-06-bank-transfer-test.md](./pr-06-bank-transfer-test.md)

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| Table `booking_payment_proofs` | Fichier + statut review lié à `booking_id` / `payment_id` |
| Upload client | JPEG / PNG / WebP / PDF, max 10 Mo ; fichier ou photo caméra |
| Après upload | `payments` en `pending` (`provider: bank_transfer`) + preuve `pending_review` |
| Booking | Reste `pending_payment` jusqu’à validation staff |
| Admin **Valider** | Preuve `approved` → payment `succeeded` → booking `confirmed` |
| Admin **Redemander** / **Rejeter** | `resubmit_requested` / `rejected` ; client peut re-uploader |
| Fallback staff | **Marquer virement reçu** si aucune preuve `pending_review` |

Migrations :
- `database/migrations/add_booking_payment_proofs.sql`
- (PR-06) `extend_preferred_payment_method_bank_transfer.sql`

Prérequis : virement activé + compte bancaire publié (voir PR-06).

---

## Tests manuels

### A. Upload page succès

1. Checkout web → **Virement** → success.
2. Section **Preuve de paiement** visible sous les coords bancaires.
3. Envoyer un PDF ou une photo → statut « En attente de vérification ».
4. Vérifier en DB : `booking_payment_proofs.status = pending_review`, `payments.status = pending`, `provider = bank_transfer`.
5. Second upload alors que `pending_review` → **erreur** (déjà en cours).

### B. Compte client

1. Compte → détail réservation pending virement.
2. Même panneau upload / statut / note staff si redemande.
3. Après rejet ou « nouvelle preuve demandée » : upload à nouveau possible (version +1).

### C. Admin — validation

1. Réservation → onglet Documents → **Preuves de paiement**.
2. Voir le fichier (inline).
3. **Valider le paiement** → booking `confirmed`, payment `succeeded`, preuve `approved`.
4. Barre d’actions : pas de bouton « Marquer virement reçu » tant qu’une preuve est `pending_review`.

### D. Admin — redemande / rejet

1. Preuve `pending_review` → **Demander une nouvelle preuve** (note obligatoire) → client voit la note.
2. Ou **Rejeter** (note optionnelle) → client peut re-uploader.
3. Booking reste `pending_payment`.

### E. Fallback sans preuve

1. Réservation virement **sans** preuve pending.
2. Barre : **Marquer virement reçu** → confirme (réutilise un payment pending s’il existe).

### F. API

```bash
# Liste
curl -s "$API/bookings/$BOOKING_ID/payment-proofs" \
  -H "Authorization: Bearer $TOKEN"

# Upload (client propriétaire)
curl -s -X POST "$API/bookings/$BOOKING_ID/payment-proofs" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/slip.pdf" \
  -F "paymentMethod=bank_transfer"

# Approuver (staff)
curl -s -X POST "$API/bookings/$BOOKING_ID/payment-proofs/$PROOF_ID/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Redemander / rejeter
curl -s -X POST "$API/bookings/$BOOKING_ID/payment-proofs/$PROOF_ID/request-resubmit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"staffNote":"Montant illisible"}'
```

### G. i18n

1. Basculer FR / EN / ES (success, compte, admin Documents).
2. Titres / statuts / dialogs — pas de clés brutes.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/add_booking_payment_proofs.sql` |
| Entity / service | `booking-payment-proof.entity.ts`, `booking-payment-proofs.service.ts` |
| API | `bookings.controller.ts` (`…/payment-proofs`) |
| Types / client | `packages/types/src/booking.ts`, `packages/api-client` |
| Web | `payment-proof-panel.tsx`, `camera-capture.tsx`, success + `account-booking-detail.tsx` |
| Admin | `booking-payment-proofs-panel.tsx`, onglet Documents |
| i18n | `translations.ts`, `translations-es.ts`, `apps/admin/messages/*/modules/bookings.json` |

---

## Checklist d’acceptation PR-06b

- [ ] Client peut uploader fichier ou photo (success + compte)
- [ ] Payment `pending` créé/lié à la preuve
- [ ] Admin valide → booking `confirmed`
- [ ] Redemande / rejet + re-upload client
- [ ] Fallback « Marquer virement reçu » sans preuve pending
- [ ] i18n FR / EN / ES
- [ ] Migration SQL appliquée
