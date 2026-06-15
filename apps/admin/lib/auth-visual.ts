import type {
  AuthVisualDecorIcon,
  AuthVisualIconPosition,
  AuthVisualIconPreset,
  AuthVisualIconSize,
  AuthVisualSettingValue,
  PublicAuthVisual,
  PublicAuthVisualIcon,
} from '@africatourismgate/types';
import {
  AUTH_VISUAL_ICON_POSITIONS,
  AUTH_VISUAL_ICON_PRESETS,
  AUTH_VISUAL_ICON_SIZES,
  DEFAULT_AUTH_VISUAL_ICONS,
} from '@africatourismgate/types/organization-settings';
import { cn } from '@africatourismgate/ui';

export {
  AUTH_VISUAL_ICON_POSITIONS,
  AUTH_VISUAL_ICON_PRESETS,
  AUTH_VISUAL_ICON_SIZES,
  DEFAULT_AUTH_VISUAL_ICONS,
};

export const AUTH_VISUAL_PRESET_LABELS: Record<AuthVisualIconPreset, string> = {
  pin: 'Épingle (localisation)',
  compass: 'Boussole',
  globe: 'Globe',
  star: 'Étoile',
  custom: 'Image personnalisée',
};

export const AUTH_VISUAL_POSITION_LABELS: Record<AuthVisualIconPosition, string> = {
  'bottom-right': 'Bas droite',
  'top-right': 'Haut droite',
  'bottom-left': 'Bas gauche',
  'top-left': 'Haut gauche',
};

export const AUTH_VISUAL_SIZE_LABELS: Record<AuthVisualIconSize, string> = {
  sm: 'Petite',
  md: 'Moyenne',
  lg: 'Grande',
};

export const AUTH_VISUAL_PRESET_PATHS: Record<
  Exclude<AuthVisualIconPreset, 'custom'>,
  string
> = {
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
  compass:
    'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2zm0 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z',
  globe:
    'M12 2a10 10 0 100 20 10 10 0 000-20zm7.9 9H17a12.4 12.4 0 00-1.2-5.1A8 8 0 0119.9 11zM12 4c.9 1.6 1.6 3.4 2 5.4H10c.4-2 1.1-3.8 2-5.4zM8.3 5.9A12.4 12.4 0 007 11H4.1a8 8 0 014.2-5.1zM4.1 13H7c.3 1.9 1 3.7 2 5.1A8 8 0 014.1 13zm7.9 7c-.9-1.6-1.6-3.4-2-5.4h4c-.4 2-1.1 3.8-2 5.4zm3.8-5.1c.3-1.9 1-3.7 2-5.1a8 8 0 012 5.1h-4zm2-2h2.8a8 8 0 00-4.2-5.1c.7 1.4 1.2 3 1.4 5.1z',
  star: 'M12 2l2.8 6.8L22 9.2l-5.2 4.4 1.6 6.8L12 17.8 5.6 20.4 7.2 13.6 2 9.2l7.2-.4L12 2z',
};

export function authVisualFromSetting(
  value: AuthVisualSettingValue | undefined,
): AuthVisualDecorIcon[] {
  if (!value?.icons?.length) return DEFAULT_AUTH_VISUAL_ICONS;
  return value.icons;
}

export function authVisualIconsFromPublic(
  authVisual: PublicAuthVisual | undefined,
): PublicAuthVisualIcon[] {
  if (!authVisual?.icons?.length) {
    return DEFAULT_AUTH_VISUAL_ICONS.map((icon) => ({
      ...icon,
      imageUrl: icon.imageUrl ?? null,
    }));
  }
  return authVisual.icons.filter((icon) => icon.enabled);
}

export function authVisualPositionClass(
  position: AuthVisualIconPosition,
  variant: 'compact' | 'full',
): string {
  if (variant === 'compact') {
    return 'right-6 top-1/2 -translate-y-1/2';
  }

  switch (position) {
    case 'bottom-right':
      return 'bottom-10 right-10';
    case 'top-right':
      return 'right-32 top-16 hidden lg:block';
    case 'bottom-left':
      return 'bottom-10 left-10';
    case 'top-left':
      return 'left-10 top-16 hidden lg:block';
    default:
      return 'bottom-10 right-10';
  }
}

export function authVisualSizeClass(
  size: AuthVisualIconSize,
  variant: 'compact' | 'full',
): string {
  if (variant === 'compact') {
    return 'h-24 w-24';
  }

  switch (size) {
    case 'sm':
      return 'h-16 w-16';
    case 'md':
      return 'h-24 w-24 lg:h-32 lg:w-32';
    case 'lg':
      return 'h-40 w-40 lg:h-52 lg:w-52';
    default:
      return 'h-40 w-40 lg:h-52 lg:w-52';
  }
}

export function authVisualIconClassName(
  icon: Pick<PublicAuthVisualIcon, 'size' | 'position' | 'opacity'>,
  variant: 'compact' | 'full',
  className?: string,
): string {
  return cn(
    'pointer-events-none absolute text-white',
    authVisualPositionClass(icon.position, variant),
    authVisualSizeClass(icon.size, variant),
    className,
  );
}
