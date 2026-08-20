# Phase 5 — Checklist livrable

Date : 2026-08-20  
Branche : `feature/admin-ui-phase-5-polish-mobile`

## IDs

| ID | Statut | Notes |
|----|--------|-------|
| **P5-1** / **M1** | Fait | `meta.hideOnMobile` + expand ; `table-fixed` mobile ; bookings, properties, users |
| **P5-2** / **M2** | Fait | Dates bookings via `useLocale` ; FR leftovers EN/ES bookings+users nettoyés ; dashboard/properties OK |
| **P5-3** / **PL1-PL2** | Fait | `/contenu/messages` EmptyState + PageHeader + CTA tickets ; descriptions enrichies |
| **P5-4** / **M3** | Fait | `?` → aide raccourcis ; documente Ctrl/⌘+K, Esc, ? ; i18n fr/en/es |
| **P5-5** / **M4** | Fait | `exportCsv` sur bookings (existant) + **users-list** |
| **P5-6** | Fait | Spot-check 5 pages ; correctifs Input `useId`, AppHeader sans h1 dupliqué, names dateFrom/dateTo |

## Captures

| Fichier | Contenu |
|---------|---------|
| `apps/test-results/p5-1-reservations-375.png` | Table mobile réservations |
| `apps/test-results/p5-1-hebergements-375.png` | Table mobile hébergements |
| `apps/test-results/p5-1-utilisateurs-375.png` | Table mobile utilisateurs |
| `apps/test-results/p5-3-contenu-messages.png` | Empty state (+ dark) |
| `apps/test-results/p5-6-reservations-375.png` | Acceptation 375px réservations |
| `apps/test-results/p5-6-hebergements-375.png` | Acceptation 375px hébergements |
| `apps/test-results/p5-6-{login,dashboard,reservations,hebergements,parametres}.png` | Spot-check desktop |
| `apps/test-results/p5-6-a11y-report.json` | Rapport a11y |

## Fichiers principaux touchés

- `packages/ui/src/components/data-table.tsx`
- `packages/ui/src/components/empty-state.tsx`
- `packages/ui/src/components/app-header.tsx`
- `packages/ui/src/components/input.tsx`
- `apps/admin/components/users/users-list.tsx`
- `apps/admin/components/bookings/bookings-list.tsx`
- `apps/admin/components/properties/properties-list.tsx`
- `apps/admin/components/keyboard-shortcuts-help.tsx`
- `apps/admin/components/dashboard-shell-layout.tsx`
- `apps/admin/components/dashboard-section-page.tsx`
- `apps/admin/components/admin-section-placeholder.tsx`
- `apps/admin/messages/{fr,en,es}/common.json`
- `apps/admin/messages/{fr,en,es}/placeholderSections.json`
- `apps/admin/messages/{en,es}/modules/bookings.json`
- `apps/admin/messages/{en,es}/modules/users.json`
