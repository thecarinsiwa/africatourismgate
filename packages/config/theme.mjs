/**
 * Charte graphique Africa Tourism Gate
 * Source officielle : organization_settings.branding (install.seed.sql)
 *
 * primaryColor  : #0B6E4F — vert tourisme (boutons, liens, accents)
 * secondaryColor: #199a45 — vert complémentaire (web public)
 */

export const brand = {
  primary: '#0B6E4F',
  primaryHover: '#095a40',
  primaryLight: '#0d8a63',
  secondary: '#199a45',
  secondaryHover: '#137a36',
};

/** Surfaces sombres admin / auth — teintées vert pour rester cohérentes avec la marque */
export const adminSurfaces = {
  surface: '#0b1210',
  elevated: '#121f1a',
  border: '#1e3329',
  muted: '#8b9a94',
};

/** Couleurs prêtes pour theme.extend.colors dans Tailwind */
export const tailwindColors = {
  primary: {
    DEFAULT: brand.primary,
    hover: brand.primaryHover,
    light: brand.primaryLight,
  },
  secondary: {
    DEFAULT: brand.secondary,
    hover: brand.secondaryHover,
  },
  atg: {
    surface: adminSurfaces.surface,
    elevated: adminSurfaces.elevated,
    border: adminSurfaces.border,
    muted: adminSurfaces.muted,
  },
};

/** Variables CSS (--atg-*) pour styles hors Tailwind */
export const cssVariables = {
  '--atg-primary': brand.primary,
  '--atg-primary-hover': brand.primaryHover,
  '--atg-primary-light': brand.primaryLight,
  '--atg-secondary': brand.secondary,
  '--atg-secondary-hover': brand.secondaryHover,
  '--atg-surface': adminSurfaces.surface,
  '--atg-elevated': adminSurfaces.elevated,
  '--atg-border': adminSurfaces.border,
  '--atg-muted': adminSurfaces.muted,
};

/** Objet branding JSON (aligné base de données) */
export const brandingJson = {
  displayName: 'Africa Tourism Gate',
  primaryColor: brand.primary,
  secondaryColor: brand.secondary,
};
