import type { BrandingPlatformValue } from '@africatourismgate/types';
import { PLATFORM_ORG_ID } from './org-settings-constants';

export type OrganizationBranding = {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

const DEFAULT_BRANDING: OrganizationBranding = {
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
  logoUrl: null,
  faviconUrl: null,
};

const CSS_VARS = {
  primary: '--atg-primary',
  primaryHover: '--atg-primary-hover',
  primaryLight: '--atg-primary-light',
  secondary: '--atg-secondary',
  secondaryHover: '--atg-secondary-hover',
} as const;

function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  if (!match) return null;
  return `#${match[1].toUpperCase()}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

/** Assombrit (factor 0–1) ou éclaircit (factor > 1) une couleur hex. */
export function adjustHexColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

export function brandingFromPlatformSetting(
  value: Record<string, unknown> | BrandingPlatformValue | undefined,
): OrganizationBranding {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_BRANDING };
  }
  const platform = value as BrandingPlatformValue;
  const displayName =
    typeof platform.displayName === 'string' && platform.displayName.trim()
      ? platform.displayName.trim()
      : DEFAULT_BRANDING.displayName;
  const primary =
    normalizeHex(String(platform.primaryColor ?? '')) ?? DEFAULT_BRANDING.primaryColor;
  const secondary =
    normalizeHex(String(platform.secondaryColor ?? '')) ?? DEFAULT_BRANDING.secondaryColor;
  const logoUrl =
    typeof platform.logoUrl === 'string' && platform.logoUrl.trim()
      ? platform.logoUrl.trim()
      : null;
  const faviconUrl =
    typeof platform.faviconUrl === 'string' && platform.faviconUrl.trim()
      ? platform.faviconUrl.trim()
      : null;
  return { displayName, primaryColor: primary, secondaryColor: secondary, logoUrl, faviconUrl };
}

export function applyFaviconToDocument(faviconUrl: string | null): void {
  if (typeof document === 'undefined') return;

  const selector = 'link[data-atg-dynamic-favicon="1"]';
  const existing = document.querySelector<HTMLLinkElement>(selector);

  if (!faviconUrl) {
    existing?.remove();
    return;
  }

  const link = existing ?? document.createElement('link');
  link.rel = 'icon';
  link.href = faviconUrl;
  link.setAttribute('data-atg-dynamic-favicon', '1');
  if (!existing) {
    document.head.appendChild(link);
  }
}

export function brandingFromSettingsForm(values: {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
}): OrganizationBranding {
  return brandingFromPlatformSetting({
    displayName: values.displayName,
    primaryColor: values.primaryColor,
    secondaryColor: values.secondaryColor,
    logoUrl: values.logoUrl,
    faviconUrl: values.faviconUrl,
  });
}

export function applyOrganizationBrandingToDocument(
  branding: OrganizationBranding,
): void {
  if (typeof document === 'undefined') return;

  const primary = normalizeHex(branding.primaryColor) ?? DEFAULT_BRANDING.primaryColor;
  const secondary =
    normalizeHex(branding.secondaryColor) ?? DEFAULT_BRANDING.secondaryColor;

  const root = document.documentElement;
  root.style.setProperty(CSS_VARS.primary, primary);
  root.style.setProperty(CSS_VARS.primaryHover, adjustHexColor(primary, 0.82));
  root.style.setProperty(CSS_VARS.primaryLight, adjustHexColor(primary, 1.12));
  root.style.setProperty(CSS_VARS.secondary, secondary);
  root.style.setProperty(CSS_VARS.secondaryHover, adjustHexColor(secondary, 0.82));
}

export function clearOrganizationBrandingFromDocument(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const varName of Object.values(CSS_VARS)) {
    root.style.removeProperty(varName);
  }
}

export function resolveThemeOrganizationId(
  isSuperAdmin: boolean,
  userOrganizationId: string | null | undefined,
  queryOrganizationId: string | null,
  pathname: string,
): string {
  if (pathname.startsWith('/parametres') && queryOrganizationId) {
    return queryOrganizationId;
  }
  if (isSuperAdmin) {
    return queryOrganizationId || PLATFORM_ORG_ID;
  }
  return userOrganizationId ?? PLATFORM_ORG_ID;
}
