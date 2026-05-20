export const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidContactEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidCurrency(currency: string): boolean {
  return /^[A-Za-z]{3}$/.test(currency.trim());
}
