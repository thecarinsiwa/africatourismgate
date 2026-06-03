import { LOCALE_COOKIE, type AppLocale } from '../../i18n/routing';

const MAX_AGE = 60 * 60 * 24 * 365;

export function setLocaleCookie(locale: AppLocale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${MAX_AGE};SameSite=Lax`;
}
