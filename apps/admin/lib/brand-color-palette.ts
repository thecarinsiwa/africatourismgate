/** Palette branding admin (alignée sur packages/config/theme.mjs). */
export type BrandColorSwatch = {
  id: string;
  label: string;
  hex: string;
};

export const brandColorPalette: BrandColorSwatch[] = [
  { id: 'atg-primary', label: 'Vert ATG', hex: '#0B6E4F' },
  { id: 'atg-primary-hover', label: 'Vert foncé', hex: '#095a40' },
  { id: 'atg-primary-light', label: 'Vert clair', hex: '#0d8a63' },
  { id: 'forest', label: 'Forêt', hex: '#1B5E20' },
  { id: 'emerald', label: 'Émeraude', hex: '#059669' },
  { id: 'teal', label: 'Sarcelle', hex: '#0D9488' },
  { id: 'atg-secondary', label: 'Secondaire ATG', hex: '#199a45' },
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
