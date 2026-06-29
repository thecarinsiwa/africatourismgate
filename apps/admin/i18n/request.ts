import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { loadAdminMessages } from '../lib/i18n/load-messages';
import { defaultLocale, LOCALE_COOKIE, locales, type AppLocale } from './routing';

function resolveLocale(value: string | undefined): AppLocale {
  if (value && locales.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: await loadAdminMessages(locale),
  };
});
