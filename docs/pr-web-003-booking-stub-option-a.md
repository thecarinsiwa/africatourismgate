# WEB-003 — PR notes (Option A)

## Summary

- **WEB-003 Option A** : replace the English `/booking` placeholder with a server redirect.
  - Valid reservation draft in the query → `/booking/cart?…`
  - Otherwise → `/hotels`
- Smoke E2E: `apps/web/tests/e2e/booking-index-redirect.spec.ts`
- Tracker updated: `docs/web-github-tasks.md`

## Why not B / C

- **B** (`next.config` always → cart): empty `/booking` would hit auth guard + invalid-draft UX.
- **C** (i18n hub): no product need; checkout already lives under `/booking/cart` → `/recap`.

## Test plan

- [x] Grep: no `being finalized` / `Booking Checkout` under `apps/web`
- [x] `/booking` → `/hotels`
- [x] `/booking?propertyId=…&roomId=…&checkIn=…&checkOut=…&guests=2` → `/booking/cart` (or login) with query preserved
- [ ] Full web e2e still green on CI
