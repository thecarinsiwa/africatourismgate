import type { AuthVisualDecorIcon } from '@africatourismgate/types';

/** Aligné sur `packages/types/src/organization-settings.ts`. */
export const AUTH_VISUAL_ICON_PRESETS = [
  'pin',
  'compass',
  'globe',
  'star',
  'custom',
] as const;

export const AUTH_VISUAL_ICON_POSITIONS = [
  'bottom-right',
  'top-right',
  'bottom-left',
  'top-left',
] as const;

export const AUTH_VISUAL_ICON_SIZES = ['sm', 'md', 'lg'] as const;

export const DEFAULT_AUTH_VISUAL_ICONS: AuthVisualDecorIcon[] = [
  {
    preset: 'pin',
    opacity: 25,
    size: 'lg',
    position: 'bottom-right',
    enabled: true,
  },
  {
    preset: 'pin',
    opacity: 60,
    size: 'sm',
    position: 'top-right',
    enabled: true,
  },
];
