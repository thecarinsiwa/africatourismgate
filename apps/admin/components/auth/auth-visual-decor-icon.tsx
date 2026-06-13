'use client';

import { cn } from '@africatourismgate/ui';
import type { PublicAuthVisualIcon } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import {
  AUTH_VISUAL_PRESET_PATHS,
  authVisualIconClassName,
} from '../../lib/auth-visual';

type Props = {
  icon: PublicAuthVisualIcon;
  variant?: 'compact' | 'full';
  className?: string;
};

export function AuthVisualDecorIcon({ icon, variant = 'full', className }: Props) {
  const style = { opacity: icon.opacity / 100 };

  if (icon.preset === 'custom' && icon.imageUrl) {
    const imageUrl = normalizeBrandingAssetUrl(icon.imageUrl);
    if (!imageUrl) return null;

    return (
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        className={cn(authVisualIconClassName(icon, variant, className), 'object-contain')}
        style={style}
      />
    );
  }

  const path = AUTH_VISUAL_PRESET_PATHS[icon.preset as keyof typeof AUTH_VISUAL_PRESET_PATHS];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      className={authVisualIconClassName(icon, variant, className)}
      style={style}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d={path} />
    </svg>
  );
}
