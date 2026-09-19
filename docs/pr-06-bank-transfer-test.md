# PR-06 — Scénario de test (paiement par virement bancaire)

Branche : `feature/pr-06-bank-transfer`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-06)

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| `preferredPaymentMethod` | `'stripe' \| 'cash' \| 'bank_transfer'` |
| Setting org `booking` / `payment_methods` | Admin active/désactive chaque moyen (site public) |
| Défaut | `stripe: true`, `cash: true`, `bank_transfer: false` |
| Checkout web | Radios filtrées selon le setting ; API refuse une méthode désactivée |
| POS | Non soumis au setting web |
| Statut après checkout virement | `pending_payment` jusqu’à marquage staff |
| Admin | Action **Marquer virement reçu** → paiement `provider: bank_transfer` + booking `confirmed` |
| Assisté | Pas d’invite Stripe si `bank_transfer` ; hint + action barre |
| Email | Instructions de virement + référence booking (approve / activate / POS pending) |
| Compte client | Panneau comptes + message pending tant que non confirmé |

Migration : `database/migrations/extend_preferred_payment_method_bank_transfer.sql`

Prérequis :
1. Admin → Paramètres → cocher **Virement bancaire**.
2. Au moins un compte bancaire org **actif** (Paramètres → Comptes bancaires).

---

## Tests manuels

### A. Activation admin

1. Admin → Paramètres → section **Moyens de paiement (site public)**.
2. Cocher **Virement bancaire** → Enregistrer.
3. Sans cette case : le checkout web ne propose pas le virement (API 400 si forcé).

### B. Checkout web

1. Produit → récap → section **Méthode de paiement**.
2. Choisir **Virement bancaire** → panneau coordonnées visible (ou message vide si aucun compte publié).
3. Confirmer → redirection `/booking/success?…&payment=bank_transfer`.
4. Page succès : statut pending virement + comptes + étape « effectuer le virement ».
5. Vérifier booking `preferredPaymentMethod = bank_transfer`, `status = pending_payment`.

### C. Compte client

1. Compte → détail réservation pending virement.
2. Message pending + panneau comptes + référence à indiquer.
3. Après marquage admin : statut confirmé ; panneau pending disparu.

### D. Admin

1. Réservation `pending_payment` + `bank_transfer`.
2. Barre d’actions : **Marquer virement reçu** (pas le bouton cash).
3. Dialog note optionnelle → confirmer → statut `confirmed`, paiement `succeeded` / `bank_transfer`.
4. Assisté `pending_payment` + virement : hint (pas le bouton Inviter au paiement).

### E. API

```bash
# Moyens activés (sans auth)
curl -s "$API/organization-settings/public/payment-methods"

# Comptes publics (sans auth)
curl -s "$API/public/payment-bank-accounts"

# Enregistrer virement (staff, bookings.write)
curl -s -X POST "$API/bookings/$BOOKING_ID/bank-transfer-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Reçu 2026-09-19"}'
```

Assert : 2e appel → 400 (paiement déjà enregistré) ; Stripe checkout / invite-payment refusés si `bank_transfer`.

### F. Email

1. Checkout ou approbation assistée en `bank_transfer`.
2. Client reçoit email d’instructions (comptes + ref. booking).

### G. i18n

1. Basculer FR / EN / ES (checkout, succès, compte, admin).
2. Labels virement / dialogs / hints / provider « Virement » — pas de clés brutes.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/extend_preferred_payment_method_bank_transfer.sql` |
| Types / client | `packages/types/src/organization-settings.ts`, `packages/api-client/src/index.ts` |
| Setting + API public | `validate-setting-value.ts`, `GET …/public/payment-methods`, `booking-engine` assert |
| Admin Paramètres | `organization-settings-form.tsx`, `messages/*/modules/settings.json` |
| Web checkout | `payment-methods-provider.tsx`, `reservation-recap-page-content.tsx` |
| Migration enum | `database/migrations/extend_preferred_payment_method_bank_transfer.sql` |
| API public + record | `public-payment-bank-accounts.controller.ts`, `booking-engine.service.ts` (`recordBankTransferPayment`) |
| Emails | `assisted-booking.email.templates.ts`, `booking-assisted-email.service.ts` |
| Web UI | `bank-transfer-accounts-panel.tsx`, récap / success / verify / `account-booking-detail.tsx` |
| Admin booking | `booking-detail-page.tsx`, `booking-assisted-approval-panel.tsx` |
| i18n | `translations.ts`, `translations-es.ts`, `apps/admin/messages/*/modules/bookings.json`, `payments.json` |

---

## Checklist d’acceptation PR-06

- [ ] Enum `bank_transfer` (migration + types + Swagger / api-client)
- [ ] Admin peut activer/désactiver stripe / cash / virement (Paramètres)
- [ ] Checkout : choix virement seulement si activé + affichage comptes org
- [ ] Booking reste `pending_payment` jusqu’à marquage staff
- [ ] Admin « Marquer virement reçu » confirme la réservation
- [ ] Hint assisté (pas d’invite Stripe pour virement)
- [ ] Email instructions de virement
- [ ] i18n FR / EN / ES (web + admin)
- [ ] POS non bloqué par le setting web
