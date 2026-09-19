# PR-06 — Scénario de test (paiement par virement bancaire)

Branche : `feature/pr-06-bank-transfer`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-06)

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| `preferredPaymentMethod` | `'stripe' \| 'cash' \| 'bank_transfer'` |
| Checkout web | Radio **Virement** + panneau comptes org (IBAN / titulaire / SWIFT) |
| Statut après checkout virement | `pending_payment` jusqu’à marquage staff |
| Admin | Action **Marquer virement reçu** → paiement `provider: bank_transfer` + booking `confirmed` |
| Assisté | Pas d’invite Stripe si `bank_transfer` ; hint + action barre |
| Email | Instructions de virement + référence booking (approve / activate / POS pending) |
| Compte client | Panneau comptes + message pending tant que non confirmé |

Migration : `database/migrations/extend_preferred_payment_method_bank_transfer.sql`

Prérequis : au moins un compte bancaire org **actif** (admin Organisation → comptes bancaires).

---

## Tests manuels

### A. Checkout web

1. Produit → récap → section **Méthode de paiement**.
2. Choisir **Virement bancaire** → panneau coordonnées visible (ou message vide si aucun compte publié).
3. Confirmer → redirection `/booking/success?…&payment=bank_transfer`.
4. Page succès : statut pending virement + comptes + étape « effectuer le virement ».
5. Vérifier booking `preferredPaymentMethod = bank_transfer`, `status = pending_payment`.

### B. Compte client

1. Compte → détail réservation pending virement.
2. Message pending + panneau comptes + référence à indiquer.
3. Après marquage admin : statut confirmé ; panneau pending disparu.

### C. Admin

1. Réservation `pending_payment` + `bank_transfer`.
2. Barre d’actions : **Marquer virement reçu** (pas le bouton cash).
3. Dialog note optionnelle → confirmer → statut `confirmed`, paiement `succeeded` / `bank_transfer`.
4. Assisté `pending_payment` + virement : hint (pas le bouton Inviter au paiement).

### D. API

```bash
# Comptes publics (sans auth)
curl -s "$API/public/payment-bank-accounts"

# Enregistrer virement (staff, bookings.write)
curl -s -X POST "$API/bookings/$BOOKING_ID/bank-transfer-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Reçu 2026-09-19"}'
```

Assert : 2e appel → 400 (paiement déjà enregistré) ; Stripe checkout / invite-payment refusés si `bank_transfer`.

### E. Email

1. Checkout ou approbation assistée en `bank_transfer`.
2. Client reçoit email d’instructions (comptes + ref. booking).

### F. i18n

1. Basculer FR / EN / ES (checkout, succès, compte, admin).
2. Labels virement / dialogs / hints / provider « Virement » — pas de clés brutes.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/extend_preferred_payment_method_bank_transfer.sql` |
| Types / client | `packages/types/src/booking.ts`, `packages/api-client/src/index.ts` |
| API public + record | `public-payment-bank-accounts.controller.ts`, `booking-engine.service.ts` (`recordBankTransferPayment`) |
| Emails | `assisted-booking.email.templates.ts`, `booking-assisted-email.service.ts` |
| Web | `bank-transfer-accounts-panel.tsx`, récap / success / verify / `account-booking-detail.tsx` |
| Admin | `booking-detail-page.tsx`, `booking-assisted-approval-panel.tsx` |
| i18n | `translations.ts`, `translations-es.ts`, `apps/admin/messages/*/modules/bookings.json`, `payments.json` |

---

## Checklist d’acceptation PR-06

- [ ] Enum `bank_transfer` (migration + types + Swagger / api-client)
- [ ] Checkout : choix virement + affichage comptes org
- [ ] Booking reste `pending_payment` jusqu’à marquage staff
- [ ] Admin « Marquer virement reçu » confirme la réservation
- [ ] Hint assisté (pas d’invite Stripe pour virement)
- [ ] Email instructions de virement
- [ ] i18n FR / EN / ES (web + admin)
