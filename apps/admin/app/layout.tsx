import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider, ToastProvider } from '@africatourismgate/ui';
import { getAdminAppUrl, normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import './globals.css';
import { AdminConnectionLockProvider } from '../components/connection-lock/admin-connection-lock-provider';
import { resolveApiBaseUrl } from '../lib/auth/api-url';
import { DEFAULT_ADMIN_FAVICON_HREF } from '../lib/organization-theme';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const adminUrl = getAdminAppUrl();

async function resolveAdminFaviconHref(): Promise<string> {
  try {
    const response = await fetch(
      `${resolveApiBaseUrl()}/organization-settings/public/branding`,
      { cache: 'no-store', headers: { Accept: 'application/json' } },
    );
    if (!response.ok) return DEFAULT_ADMIN_FAVICON_HREF;
    const payload = (await response.json()) as { faviconUrl?: string | null };
    return (
      normalizeBrandingAssetUrl(payload.faviconUrl?.trim() || null) ||
      DEFAULT_ADMIN_FAVICON_HREF
    );
  } catch {
    return DEFAULT_ADMIN_FAVICON_HREF;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, faviconHref] = await Promise.all([
    getTranslations('common.meta'),
    resolveAdminFaviconHref(),
  ]);
  const isSvg = /\.svg(\?|#|$)/i.test(faviconHref);

  return {
    metadataBase: new URL(adminUrl),
    title: {
      default: t('defaultTitle'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    icons: {
      icon: [{ url: faviconHref, ...(isSvg ? { type: 'image/svg+xml' } : {}) }],
      shortcut: [{ url: faviconHref, ...(isSvg ? { type: 'image/svg+xml' } : {}) }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans">
        <NextTopLoader
          color="#0B6E4F"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0B6E4F,0 0 5px #0B6E4F"
          zIndex={99999}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider defaultTheme="system">
            <ToastProvider>
              <AdminConnectionLockProvider>{children}</AdminConnectionLockProvider>
            </ToastProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
