import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { CSSProperties } from 'react';
import './globals.css';
import { GapShell } from '@/components/gap-shell';
import { Providers } from '@/components/providers';
import { gapThemeCssVars } from '@/lib/gap-theme';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: {
      default: t('siteName'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('defaultDescription'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={montserrat.variable} suppressHydrationWarning>
      <body
        className="min-h-screen bg-atg-surface font-sans text-atg-fg antialiased transition-colors"
        style={gapThemeCssVars as CSSProperties}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <GapShell>{children}</GapShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
