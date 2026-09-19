# PR-02 — PDF confirmation (cause racine + retest)

Branche : `feature/pr-02-pdf-confirmation-fix`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-02)

## Cause racine

1. L’email de **confirmation** (`notifyBookingConfirmed`) partait **sans** génération / PJ PDF — le PDF n’était attaché que pour l’approbation assistée et l’assignation guide.
2. Le logo PDF était fragile hors local : chemins `cwd`/`uploads` incomplets, `fetch` distant **sans timeout**, échecs silencieux.
3. Si `doc.image` échouait, le renderer réservait quand même l’espace logo → layout « cassé ». Le SMTP n’était pas en cause.

## Correctifs

| Zone | Changement |
| ---- | ---------- |
| Confirmation email | `BookingEngineService` génère le PDF + `attachments` + `hasPdfAttachment` ; échec PDF = warn, email HTML part quand même |
| Template / EmailService | Note « récapitulatif PDF joint » ; `sendBookingConfirmation` accepte les PJ |
| Logo | `resolveLogoForPdf` : timeout 5 s, multi-chemins, logs warn, fallback `EMAIL_LOGO_URL` |
| Renderer | `logoDrawn` ; nationalité via `formatNationalityDisplay` ; `compress: false` (contenu inspectable) |
| Tests | `booking-detail-pdf.spec.ts` : sans logo, multi-voyageurs, buffer PNG, chemin invalide |

## Fichiers touchés

- `apps/api/src/modules/resources/bookings/booking-engine.service.ts`
- `apps/api/src/modules/email/email.types.ts`
- `apps/api/src/modules/email/email.templates.ts`
- `apps/api/src/modules/email/email.service.ts`
- `apps/api/src/modules/email/email-attachments.ts`
- `apps/api/src/modules/email/booking-detail-pdf.renderer.ts`
- `apps/api/test/unit/booking-detail-pdf.spec.ts`
- `apps/api/package.json` (`@africatourismgate/utils`)

## Retest

Confirmer une réservation (immédiat Stripe/cash ou post-approbation), vérifier la boîte mail → PJ `reservation-XXXXXXXX.pdf` ouvrable, logo si branding configuré, manifeste + total présents. Logs API : pas de warn PDF, ou warn explicite si échec **sans** bloquer l’email.

```bash
cd apps/api
pnpm exec jest --config ./test/jest-unit.json --runInBand booking-detail-pdf.spec.ts
```

## Checklist d’acceptation

- [ ] Email de confirmation contient une PJ PDF ouvrable
- [ ] Logo présent si configuré ; PDF OK sans logo sinon
- [ ] Specs unitaires PDF passent
- [ ] Échec PDF loggé, email HTML/texte envoyé quand même
