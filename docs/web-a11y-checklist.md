# Checklist a11y — Africa Tourism Gate (web)

Checklist courte pour les PR qui touchent l’UI publique (`apps/web`). Objectif : ne pas régresser le passage clavier / lecteurs d’écran déjà couvert (WEB-010).

## Avant de merge

- [ ] **Clavier** — Tab / Shift+Tab atteignent tous les contrôles ; Enter / Space activent boutons et liens ; Escape ferme menus, drawers, dialogs et lightbox.
- [ ] **Focus visible** — Anneau `focus-visible` (ou équivalent design system) sur les contrôles interactifs ajoutés ou modifiés ; pas de `outline: none` sans alternative.
- [ ] **Labels** — Inputs avec `<label>` / `htmlFor` ou `aria-label` ; icônes seules avec `aria-label` ; décoratifs en `aria-hidden`.
- [ ] **État** — `aria-expanded` / `aria-controls` sur disclosures ; `aria-current` sur navigation / stepper courants ; erreurs avec `role="alert"` ou `aria-invalid`.
- [ ] **Dialogs / overlays** — `role="dialog"` + `aria-modal` ; focus trap Tab (`trapFocus` / `getInitialFocusElement` depuis `@africatourismgate/ui`) ; Escape ; restore focus à la fermeture.
- [ ] **Touch** — Cibles interactives ≥ **44×44 px** (`min-h-[44px]` / `min-w-[44px]`) sur CTA, nav mobile, chips.
- [ ] **Contraste** — Texte et focus rings lisibles en mode clair **et** sombre (tokens `atg-*` / `primary`).
- [ ] **Lint** — `pnpm --filter @africatourismgate/web lint` sur les fichiers touchés (jsx-a11y via `next/core-web-vitals`).

## Surfaces déjà durcies (référence)

| Surface | Fichiers clés |
| --- | --- |
| Menu mobile | `components/home/home-header.tsx` |
| Galerie / lightbox | `components/shared/swipeable-image-gallery.tsx` |
| Login booking | `components/reservations/booking-login-page-content.tsx` |
| FAQ | `components/shared/accordion.tsx`, `/support` |
| Checkout stepper | `components/reservations/checkout-stepper.tsx` |
| Dialogs manifeste | `components/reservations/checkout-manifest-form.tsx` |
| Drawer réservation | `components/shared/booking-sidebar-shell.tsx` |

## Hors scope de cette checklist

- Audit axe automatisé en CI
- Snapshots E2E massifs dédiés a11y
- Conformité WCAG complète de toutes les pages marketing
