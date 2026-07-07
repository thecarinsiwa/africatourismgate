/**
 * GAP — Gorilla Ambassadors Program brand palette.
 * Conservation forest greens, distinct from the main ATG commerce site.
 */
export const gapBrand = {
  primary: '#1B4332',
  primaryHover: '#143326',
  primaryLight: '#2D6A4F',
  secondary: '#40916C',
  secondaryHover: '#348563',
  accent: '#D4A574',
  forest: '#081C15',
  heroOverlay: 'rgba(8, 28, 21, 0.62)',
} as const;

export const gapThemeCssVars: Record<string, string> = {
  '--atg-primary': gapBrand.primary,
  '--atg-primary-hover': gapBrand.primaryHover,
  '--atg-primary-light': gapBrand.primaryLight,
  '--atg-secondary': gapBrand.secondary,
  '--atg-secondary-hover': gapBrand.secondaryHover,
  '--gap-accent': gapBrand.accent,
  '--gap-forest': gapBrand.forest,
  '--gap-hero-overlay': gapBrand.heroOverlay,
};
