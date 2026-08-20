# feat(admin): loyalty accounts — AdminIntroPage UX, KPIs, and adjust Modal

**Branch:** `feature/admin-ui-loyalty-accounts`

## Summary
- Align `/fidelite/comptes` with the recent admin list pattern (sessions, security logs).
- Fix duplicated KPI rendering and move points adjustment into a Modal (super-admin).
- Gate StatCards via `useModuleStatCards('users.read')`.
- Add debounced search (email, name, program) with API support.

## Scope
### Page `/fidelite/comptes`
- `AdminIntroPage` instead of `AdminListPageHeader`
- `LoyaltySummaryCards` only at page-content level
- Accounts list without duplicated KPIs

### List & actions
- Points adjust Modal (delta + reason) for super-admin
- DataTable polish: user Avatar, program badge, icon actions (history / adjust), `getRowId`, loading message, pagination inside the Card
- Server-side search (email, name, program code) with debounced toolbar
- History drawer unchanged (transactions API not wired)

### KPIs
- Permission gate `users.read`
- Data behavior unchanged (`meta.total` for account count; points/top from first 100 accounts)

### i18n
- Reuse / extend fr-en-es keys if Modal labels are missing

## Out of scope
- Loyalty transaction history endpoint
- User filter on the API
- Table/grid/compact view modes

## Test plan
- [ ] Open `http://localhost:3001/fidelite/comptes`: single KPI block, consistent intro page
- [ ] Paginated list, empty/error states OK
- [ ] Search by email / name / program filters the list and resets to page 1
- [ ] Super-admin: open adjust Modal, apply, toast + list refresh
- [ ] Non super-admin: no adjust button
- [ ] History drawer opens/closes (placeholder unchanged)
- [ ] Account without `users.read`: KPIs hidden / not loaded per `useModuleStatCards`
