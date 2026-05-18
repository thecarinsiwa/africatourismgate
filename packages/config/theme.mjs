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
  },
};

export const brandingJson = {
  displayName: 'Africa Tourism Gate',
  primaryColor: brand.primary,
  secondaryColor: brand.secondary,
};
