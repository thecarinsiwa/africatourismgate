# PR-03 — Download PDF confirmation (compte client)

Branche : `feature/pr-03-pdf-client-download`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-03)  
Dépend de : [PR-02](./pr-02-pdf-confirmation-fix.md)

## Livrable

Endpoint authentifié + bouton compte client pour retélécharger le **même PDF** que la pièce jointe de l’email de confirmation (`BookingDetailPdfService` / `generateConfirmationPdf`).

## Fichiers touchés

| Zone | Fichier |
| ---- | ------- |
| API | `apps/api/src/modules/resources/bookings/bookings.controller.ts` — `GET :id/confirmation-pdf` |
| API | `apps/api/src/modules/resources/bookings/booking-engine.service.ts` — `generateConfirmationPdf` |
| Client | `packages/api-client/src/index.ts` — `downloadBookingConfirmationPdf` |
| UI | `apps/web/components/account/account-booking-detail.tsx` |
| i18n | `apps/web/lib/i18n/translations.ts`, `translations-es.ts` |

## Endpoint

```
GET /api/bookings/:id/confirmation-pdf
Authorization: Bearer <access_token>
Permission: bookings.read
```

| Cas | Résultat |
| --- | -------- |
| Owner ou staff (`users.read`), statut `confirmed` | `200` + `application/pdf` (attachment `reservation-XXXXXXXX.pdf`) |
| Autre utilisateur (pas owner, pas staff) | `403` |
| Statut ≠ `confirmed` | `400` |
| Réservation inexistante | `404` |

### curl

```bash
# Owner — OK (statut confirmed)
curl -sS -o reservation.pdf -w "%{http_code}\n" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  "http://localhost:3000/api/bookings/$BOOKING_ID/confirmation-pdf"
# → 200 ; file reservation.pdf

# Autre client — 403
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $OTHER_TOKEN" \
  "http://localhost:3000/api/bookings/$BOOKING_ID/confirmation-pdf"
# → 403

# Staff — OK
curl -sS -o reservation-staff.pdf -w "%{http_code}\n" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  "http://localhost:3000/api/bookings/$BOOKING_ID/confirmation-pdf"
# → 200
```

Obtenir un token : login web/admin → DevTools → session / `Authorization`, ou flux auth API local.

## Chemin UI

`/account/reservations/:id`  
Composant : `AccountBookingDetail`  
Bouton « Télécharger la confirmation » visible si `status === 'confirmed'`.

## Test manuel

1. Confirmer une réservation (Stripe / cash / post-approbation) — statut `confirmed`.
2. Compte client → **Mes réservations** → ouvrir la réservation.
3. Cliquer **Télécharger la confirmation** → fichier `reservation-XXXXXXXX.pdf` ouvrable (manifeste + total, comme l’email).
4. Se connecter avec un **autre** compte → curl ou tentative d’accès API → **403**.
5. Basculer FR / EN / ES : libellé du bouton traduit.

## Checklist d’acceptation

- [ ] Client télécharge le PDF de **sa** réservation `confirmed` uniquement
- [ ] Autre user → **403**
- [ ] Contenu = même service que la PJ email
- [ ] i18n FR / EN / ES du bouton
