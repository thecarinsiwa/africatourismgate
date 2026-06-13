/**
 * Charte graphique Africa Tourism Gate
 * @see database/seeds/install.seed.sql (organization_settings.branding)
 */

export const brand = {
  primary: '#0B6E4F',
  primaryHover: '#095a40',
  primaryLight: '#0d8a63',
  secondary: '#199a45',
  secondaryHover: '#137a36',
};

/** Mode clair — surfaces admin / auth */
export const lightSurfaces = {
  surface: '#f4f8f6',
  elevated: '#ffffff',
  border: '#d4e5de',
  muted: '#5c6d66',
  fg: '#0f1a16',
};

/** Mode sombre — surfaces admin / auth */
export const darkSurfaces = {
  surface: '#0b1210',
  elevated: '#121f1a',
  border: '#1e3329',
  muted: '#8b9a94',
  fg: '#ffffff',
};

/** Couleurs sémantiques (badges, alertes, KPI) — paires light/fg pour contraste WCAG AA */
const semanticColors = {
  success: {
    DEFAULT: 'var(--atg-success)',
    hover: 'var(--atg-success-hover)',
    light: 'var(--atg-success-light)',
    fg: 'var(--atg-success-fg)',
  },
  warning: {
    DEFAULT: 'var(--atg-warning)',
    hover: 'var(--atg-warning-hover)',
    light: 'var(--atg-warning-light)',
    fg: 'var(--atg-warning-fg)',
  },
  danger: {
    DEFAULT: 'var(--atg-danger)',
    hover: 'var(--atg-danger-hover)',
    light: 'var(--atg-danger-light)',
    fg: 'var(--atg-danger-fg)',
  },
  info: {
    DEFAULT: 'var(--atg-info)',
    hover: 'var(--atg-info-hover)',
    light: 'var(--atg-info-light)',
    fg: 'var(--atg-info-fg)',
  },
};

/** Couleurs Tailwind (référencent les variables CSS --atg-* définies dans theme.css) */
export const tailwindColors = {
  primary: {
    DEFAULT: 'var(--atg-primary)',
    hover: 'var(--atg-primary-hover)',
    light: 'var(--atg-primary-light)',
  },
  secondary: {
    DEFAULT: 'var(--atg-secondary)',
    hover: 'var(--atg-secondary-hover)',
  },
  atg: {
    surface: 'var(--atg-surface)',
    elevated: 'var(--atg-elevated)',
    border: 'var(--atg-border)',
    muted: 'var(--atg-muted)',
    fg: 'var(--atg-fg)',
    ...semanticColors,
  },
};

export const brandingJson = {
  displayName: 'Africa Tourism Gate',
  primaryColor: brand.primary,
  secondaryColor: brand.secondary,
};

/** Palette proposée sur l’admin Paramètres → Branding */
export const brandColorPalette = [
  { id: 'atg-primary', label: 'Vert ATG', hex: brand.primary },
  { id: 'atg-primary-hover', label: 'Vert foncé', hex: brand.primaryHover },
  { id: 'atg-primary-light', label: 'Vert clair', hex: brand.primaryLight },
  { id: 'forest', label: 'Forêt', hex: '#1B5E20' },
  { id: 'emerald', label: 'Émeraude', hex: '#059669' },
  { id: 'teal', label: 'Sarcelle', hex: '#0D9488' },
  { id: 'atg-secondary', label: 'Secondaire ATG', hex: brand.secondary },
  { id: 'lime', label: 'Lime', hex: '#65A30D' },
  { id: 'gold', label: 'Or', hex: '#D97706' },
  { id: 'amber', label: 'Ambre', hex: '#F59E0B' },
  { id: 'sunset', label: 'Coucher de soleil', hex: '#EA580C' },
  { id: 'ocean', label: 'Océan', hex: '#0284C7' },
  { id: 'indigo', label: 'Indigo', hex: '#4F46E5' },
  { id: 'slate', label: 'Ardoise', hex: '#475569' },
  { id: 'earth', label: 'Terre', hex: '#78716C' },
  { id: 'burgundy', label: 'Bordeaux', hex: '#9F1239' },
];
