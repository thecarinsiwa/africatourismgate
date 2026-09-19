# PR-08 — Scénario de test (politique cash web)

Branche : `feature/pr-08-cash-policy`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-08)

Dépend de : [pr-06-bank-transfer-test.md](./pr-06-bank-transfer-test.md) (setting `payment_methods`)

## Décision (cadrage)

| Élément | Décision |
| ------- | -------- |
| Setting | **Pas de nouveau `allow_web_cash`** — le booléen `payment_methods.cash` **est** l’autorisation cash web |
| Défaut | `cash: false` (Stripe on ; cash / virement / MM off jusqu’à activation admin) |
| POS | Cash **toujours** autorisé (`skipWebPaymentGate`) |
| Admin caisse | `POST …/cash-payment` **inchangé** (hors gate web) |
| Legacy | Anciens bookings `preferredPaymentMethod = cash` restent `pending_payment` jusqu’à encaissement ; messages i18n clarifiés |

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| Setting org `booking` / `payment_methods` | Admin active/désactive chaque moyen (site public uniquement) |
| Défaut | `stripe: true`, `cash: false`, `bank_transfer: false`, `mobile_money: false` |
| Checkout web | Radio cash **absent** tant que `cash !== true` |
| API web | `preferredPaymentMethod: 'cash'` → **400** si désactivé |
| POS / staff | Non soumis à `payment_methods` |
| Legacy UI | Compte + `/booking/success` : règlement espèces toujours dû même si cash n’est plus au checkout |

Migration : `database/migrations/set_web_payment_methods_cash_default_false.sql`  
Seed : `database/seeds/install.seed.sql` (`"cash":false`)  
Types : `DEFAULT_WEB_PAYMENT_METHODS.cash === false`

Prérequis (scénario cash **on**) :
1. Admin → Paramètres → cocher **Espèces sur place (site public)** → Enregistrer.
2. Ou E2E : `mockWebPaymentMethods(page, { cash: true })`.

---

## Tests manuels

### A. Setting admin

1. Admin → Paramètres → section moyens de paiement.
2. Vérifier libellé cash type « Espèces sur place (site public) » + description risque (cash off par défaut ; POS / staff non concernés).
3. Cash décoché (défaut) → Enregistrer.
4. Cocher cash → Enregistrer → `GET /organization-settings/public/payment-methods` → `"cash": true`.
5. Décoche → `"cash": false`.

### B. Checkout web — cash off (défaut)

1. Ne pas activer cash (ou après migration / seed).
2. Parcours immédiat (hôtel / vol / etc.) → récap.
3. Assert : **pas** de radio `preferredPaymentMethod=cash`.
4. Stripe (et autres moyens activés) disponibles.

### C. Checkout web — cash on

1. Activer `payment_methods.cash` (Paramètres).
2. Récap → radio cash visible → confirmer paiement sur place.
3. Redirect `/booking/success?…&payment=cash`.
4. Booking `preferredPaymentMethod = cash`, `status = pending_payment`.
5. Pas d’appel `checkout-session` Stripe.

### D. API refuse cash web désactivé

```bash
curl -s -X POST "$API/bookings" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferredPaymentMethod":"cash", ...}'
# Assert: 400 tant que payment_methods.cash === false
```

### E. POS — cash inchangé

1. POS → vente / checkout avec paiement cash.
2. Assert : succès sans dépendre du setting web.
3. (Régression) Setting `cash: false` sur l’org → POS cash toujours OK.

### F. Admin — encaissement cash

1. Booking `pending_payment` (cash legacy ou web avec cash on).
2. Barre d’actions → **Enregistrer paiement cash** → `succeeded` (+ acompte/solde si PR-07).
3. Hint assisté / détail : message legacy clair (FR/EN/ES).

### G. Legacy messages (i18n)

1. Booking cash existant, cash web désormais off.
2. Compte client + page succès : texte indiquant que le règlement espèces reste dû / à honorer en agence.
3. FR / EN / ES : pas de clés brutes.

### H. E2E

```bash
pnpm --filter web exec playwright test tests/e2e/reservation-checkout.spec.ts
```

- Scénario Stripe : pas d’hypothèse cash visible.
- Scénario cash : `mockWebPaymentMethods({ cash: true })` avant le parcours.

### I. Régression migration

1. Org avec ancienne row `payment_methods` (`cash: true`).
2. Appliquer `set_web_payment_methods_cash_default_false.sql`.
3. Assert : `JSON` → `cash: false` ; checkout web sans radio cash.
4. Réactivation manuelle via Paramètres toujours possible.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Types / défaut | `packages/types/src/organization-settings.ts` (`DEFAULT_WEB_PAYMENT_METHODS`) |
| Seed / migration | `install.seed.sql`, `set_web_payment_methods_cash_default_false.sql` |
| Gate API | `booking-engine.service.ts` (`assertPreferredPaymentMethod`, `skipWebPaymentGate`) |
| API public | `GET …/organization-settings/public/payment-methods` |
| Admin Paramètres | `organization-settings-form.tsx`, `messages/*/modules/settings.json` |
| Web checkout | `payment-methods-provider.tsx`, `reservation-recap-page-content.tsx` |
| Legacy i18n | `translations.ts`, `translations-es.ts`, admin `bookings.json` (`cashPaymentHint`) |
| E2E | `reservation-checkout.spec.ts`, `helpers/mock-web-payment-methods.ts` |

---

## Hors scope

- Retirer cash du POS ou bloquer `recordCashPayment` admin
- Nouveau statut / migration des bookings cash existants
- Forcer un autre moyen si cash off au-delà du gate actuel (≥1 méthode déjà validée)
