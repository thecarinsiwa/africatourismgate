# PR-07 — Scénario de test (acomptes + solde)

Branche : `feature/pr-07-booking-deposits`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-07)

Dépend de :
- [pr-06-bank-transfer-test.md](./pr-06-bank-transfer-test.md)
- [pr-06b-payment-proofs-test.md](./pr-06b-payment-proofs-test.md)
- (optionnel) [pr-13-mobile-money-test.md](./pr-13-mobile-money-test.md) pour MM + acompte

## Modèle de statut (choix documenté)

| Élément | Décision |
| ------- | -------- |
| Statut pendant acompte | **`pending_payment`** tant que `sum(payments.succeeded.amountCents) < totalCents` |
| Statut soldé | **`confirmed`** uniquement quand le solde est couvert |
| Pas de | `confirmed_deposit` (pas de nouvel ENUM) |
| Exposition API / UI | `paidCents`, `balanceCents`, `depositRequiredCents` |
| Solde | Exigible **avant confirmation** (= passage à `confirmed`) ; texte produit : aussi avant la date de service (informatif, pas de moteur de deadline) |
| Annulation | Texte i18n **indicatif** seulement (pas un moteur juridique) |

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| Setting `booking` / `deposits` | `{ enabled, depositPercent? \| depositFixedCents? }` — XOR % / montant fixe |
| Défaut | `enabled: false` → checkout / Stripe / preuves = **montant total** (comportement historique) |
| 1er encaissement (si enabled) | `computeDepositRequiredCents(total)` = % ou fixe plafonné au total |
| Encaissements suivants | Solde restant (`balanceCents`) |
| Multi-paiements | Plusieurs `payments` `succeeded` par booking autorisés |
| Cash / virement / MM staff | `POST …/cash-payment` et `…/bank-transfer-payment` avec `amountCents?` |
| Stripe PI / Checkout | Montant = acompte puis solde ; webhook → `confirmBookingIfFullyPaid` |
| Preuves offline | Pending payment au montant dû ; approve optionnel `amountCents` ; nouvelle preuve après acompte |
| UI | Compte + succès + admin : payé / solde / « à régler maintenant » + politique d’annulation |

Migration : `database/migrations/add_booking_deposits_setting.sql`  
Seed : `database/seeds/install.seed.sql` (`deposits` / `enabled: false`)

Prérequis :
1. Admin → Paramètres → section **Acomptes** → activer + % (ex. 30) **ou** montant fixe.
2. Pour Stripe : `STRIPE_*` configurés + `stripe listen` (ou sync succès).
3. Pour offline : virement / MM activés + comptes / config MM si besoin.

---

## Tests manuels

### A. Setting admin

1. Admin → Paramètres → **Acomptes**.
2. Activer + pourcentage `30` → Enregistrer.
3. Basculer en montant fixe (ex. `50.00`) → Enregistrer (pas les deux à la fois).
4. Désactiver → comportement « paiement intégral » rétabli.
5. API refuse `enabled: true` sans % ni fixe, et refuse % + fixe simultanés.

### B. Cash partiel (admin)

1. Booking `pending_payment` (cash), total ex. 100,00 ; acomptes 30 %.
2. Barre d’actions → **Enregistrer paiement cash** → montant prérempli ≈ 30,00.
3. Confirmer → payment `succeeded` 3000 cts ; booking **reste** `pending_payment` ; `paidCents` / `balanceCents` mis à jour.
4. Second encaissement du solde → booking `confirmed`.

### C. Virement / Mobile Money + preuve

1. Checkout web virement (ou MM) avec acomptes activés.
2. Client upload preuve → payment `pending` au montant **acompte** (pas le total).
3. Admin valide preuve → acompte `succeeded` ; statut encore `pending_payment`.
4. Client peut déposer une **nouvelle** preuve pour le solde ; validation → `confirmed`.
5. Ou barre admin **Marquer virement / MM reçu** avec montant partiel puis solde.

### D. Stripe

1. Booking Stripe `pending_payment`, acomptes 30 %.
2. `POST /bookings/:id/checkout-session` (ou PaymentIntent) → `amountCents` = acompte.
3. Payer l’acompte (Checkout test) → webhook / sync : payment succeeded, booking **pending_payment**.
4. Nouvelle session → montant = solde ; après paiement → `confirmed`.
5. Libellé produit Stripe : « Acompte — … » puis « Solde — … ».

### E. UI client

1. Compte → détail réservation pending avec acompte : total, déjà payé, solde, « à régler maintenant ».
2. Texte **Politique d’annulation (indicative)** visible.
3. Page `/booking/success` : mêmes montants + texte si applicable.
4. FR / EN / ES : pas de clés brutes.

### F. UI admin

1. Détail réservation : total / payé / solde / dépôt dû + note annulation.
2. Historique paiements : plusieurs lignes `succeeded` possibles.
3. Dialogs cash / virement / MM : champ montant (défaut = dû).

### G. API

```bash
# Setting (extrait bulk upsert)
# settingGroup: booking, settingKey: deposits
# { "enabled": true, "depositPercent": 30 }

# Cash partiel
curl -s -X POST "$API/bookings/$BOOKING_ID/cash-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amountCents":3000,"note":"Acompte caisse"}'

# Solde
curl -s -X POST "$API/bookings/$BOOKING_ID/cash-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amountCents":7000,"note":"Solde"}'

# Detail
curl -s "$API/bookings/$BOOKING_ID" -H "Authorization: Bearer $TOKEN"
# Assert: paidCents, balanceCents, depositRequiredCents, status
```

Assert :
- Après 1er paiement partiel : `status === pending_payment`, `paidCents + balanceCents === totalCents`.
- Après solde : `status === confirmed`, `balanceCents === 0`.
- Montant `amountCents` > solde → 400.

### H. Régression (acomptes off)

1. Setting `enabled: false` (ou row absente).
2. Cash / Stripe / preuve sans montant explicite → montant = **total** ; confirm immédiat au 1er succès (comme avant).

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration / seed | `add_booking_deposits_setting.sql`, `install.seed.sql` |
| Types | `packages/types/src/organization-settings.ts` (`normalizeBookingDeposits`, `computeDepositRequiredCents`), `booking.ts` |
| Validation setting | `validate-setting-value.ts` (`deposits`) |
| Engine | `booking-engine.service.ts` (`sumSucceededPaidCents`, `getNextChargeAmountCents`, `confirmBookingIfFullyPaid`, record* partiel) |
| Stripe | `stripe.service.ts` (PI / Checkout montant dû, invalidate stale, webhook conditionnel) |
| Preuves | `booking-payment-proofs.service.ts` |
| Admin settings | `organization-settings-form.tsx` + messages settings |
| UI web | `account-booking-detail.tsx`, `reservation-success-page-content.tsx`, i18n |
| UI admin | `booking-detail-page.tsx` (summary + dialogs montant) |

---

## Hors scope

- Moteur juridique / deadlines automatiques d’annulation
- Statut `confirmed_deposit`
- Relances solde planifiées (scheduler dédié)
- Acomptes différenciés par vertical / produit
