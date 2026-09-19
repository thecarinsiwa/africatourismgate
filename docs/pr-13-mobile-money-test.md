# PR-13 — Scénario de test (Mobile Money — offline + preuves)

Branche : `feature/pr-13-mobile-money`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-13)  
Décision produit : **offline** (numéro + preuve + validation admin), **pas** d’API PSP (Flutterwave / MoMo) en V1. Pays choisi manuellement au checkout.

Dépend de :
- [pr-06-bank-transfer-test.md](./pr-06-bank-transfer-test.md) (pattern offline + setting `payment_methods`)
- [pr-06b-payment-proofs-test.md](./pr-06b-payment-proofs-test.md) (preuves déjà supportent `mobile_money`)

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| `preferredPaymentMethod` | `'stripe' \| 'cash' \| 'bank_transfer' \| 'mobile_money'` |
| Setting `booking` / `payment_methods` | Toggle admin `mobile_money` (défaut **off**) |
| Config org | Pays → opérateurs (logo) → numéros E.164 (Paramètres → Mobile Money) |
| API publique | `GET /public/mobile-money-config` — pays/opérateurs/numéros **actifs** uniquement |
| Checkout web | Radio MM → select pays → opérateur → numéros + logo → confirm → `pending_payment` |
| Preuves | Même flux que virement (`paymentMethod=mobile_money`) |
| Admin | **Marquer Mobile Money reçu** ou valider preuve ; pas d’invite Stripe |
| Email | Instructions MM (opérateurs + numéros + ref. booking) à la création / approve / verify |
| Guards | Stripe checkout + invite-payment + rappel paiement refusés / sans URL |

Migrations :
- `database/migrations/add_mobile_money_config.sql`
- `database/migrations/extend_preferred_payment_method_mobile_money.sql`
- (preuves) `add_booking_payment_proofs.sql`

Prérequis :
1. Admin → Paramètres → cocher **Mobile Money**.
2. Admin → Paramètres → **Mobile Money** : au moins 1 pays actif, 1 opérateur actif avec logo optionnel, 1 numéro actif.
3. Permissions `mobile_money.read` / `mobile_money.write` (super_admin / org_admin).

---

## Tests manuels

### A. Config admin

1. Admin → Paramètres → Mobile Money.
2. Créer un pays (ex. `CD`), un opérateur (ex. M-Pesa) + logo, un numéro E.164 (`+243…`).
3. Désactiver un numéro → ne doit plus apparaître dans `GET /public/mobile-money-config`.

### B. Activation moyen de paiement

1. Paramètres → **Moyens de paiement (site public)** → cocher **Mobile Money** → Enregistrer.
2. Sans cette case : checkout web ne propose pas MM ; API 400 si `preferredPaymentMethod=mobile_money` forcé.

### C. Checkout web

1. Produit → récap → choisir **Mobile Money**.
2. Panneau : pays → opérateur → numéros + logo visibles.
3. Confirmer → `/booking/success?…&payment=mobile_money`.
4. Page succès : pending MM + panneau instructions + **Preuve de paiement**.
5. DB : `preferred_payment_method = mobile_money`, `status = pending_payment`.

### D. Preuve client

1. Upload PDF / photo depuis succès ou compte.
2. DB : `booking_payment_proofs.payment_method = mobile_money`, `status = pending_review`, `payments.provider = mobile_money` / `pending`.
3. Admin → Documents → Valider → booking `confirmed`, payment `succeeded`.
4. Ou barre d’actions : **Marquer Mobile Money reçu** (masqué si preuve `pending_review`).

### E. Assisté

1. Demande assistée avec MM (après activation setting).
2. Approbation → email instructions MM ; pas de bouton Invite Stripe (hint).
3. `POST …/invite-payment` → 400.

### F. Email

1. Checkout immédiat, verify email booking, ou approve assisté en `mobile_money`.
2. Client reçoit email : référence + opérateurs/numéros + lien espace client.

### G. Guards

```bash
# Config publique
curl -s "$API/public/mobile-money-config"

# Setting
curl -s "$API/organization-settings/public/payment-methods"

# Record offline (staff)
curl -s -X POST "$API/bookings/$BOOKING_ID/bank-transfer-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"MoMo reçu"}'
```

Assert : Stripe checkout session / invite-payment refusés ; rappel paiement n’envoie pas de lien Stripe.

### H. i18n

1. FR / EN / ES : checkout, succès, compte, admin (setting, dialogs, providers).
2. Pas de clés brutes `mobile_money`.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migrations | `add_mobile_money_config.sql`, `extend_preferred_payment_method_mobile_money.sql` |
| Types | `packages/types/src/mobile-money.ts`, `booking.ts`, `organization-settings.ts` |
| API CRUD + public | `mobile-money-config/*`, `GET public/mobile-money-config` |
| Checkout / preuves | `reservation-recap-page-content.tsx`, `mobile-money-instructions-panel.tsx`, `payment-proof-panel.tsx` |
| Admin config | `mobile-money-config-page.tsx`, `/parametres/mobile-money` |
| Emails | `assisted-booking.email.templates.ts`, `booking-assisted-email.service.ts` |
| Guards | `stripe.service.ts`, `booking-approval.service.ts`, `booking-payment-reminder.service.ts` |

---

## Hors scope V1 (reporté)

- Intégration PSP (Flutterwave, Africa’s Talking, MoMo API) + webhooks
- Initiation de paiement push-to-phone
- Multi-org slug sur le panneau public au-delà du pattern branding existant
