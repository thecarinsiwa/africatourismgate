import type { EmailBrandingValue } from '@africatourismgate/types';
import { DEFAULT_EMAIL_BRANDING } from './email-branding.constants';

export const DEFAULT_EMAIL_FOOTER_TEMPLATE =
  '© {year} {displayName} · Tous droits réservés';

const LEGACY_FOOTER_TEXTS = new Set(['© Africa Tourism Gate']);

export function formatEmailFooter(
  branding: EmailBrandingValue,
  date: Date = new Date(),
): string {
  const displayName =
    branding.displayName?.trim() ||
    DEFAULT_EMAIL_BRANDING.displayName ||
    'Africa Tourism Gate';
  const year = String(date.getFullYear());
  const custom = branding.footerText?.trim();

  let template = DEFAULT_EMAIL_FOOTER_TEMPLATE;
  if (custom && !LEGACY_FOOTER_TEXTS.has(custom)) {
    template = custom;
  }

  return template
    .replace(/\{year\}/g, year)
    .replace(/\{displayName\}/g, displayName);
}
