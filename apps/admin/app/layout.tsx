import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@africatourismgate/ui';
import './globals.css';
import { getAdminAppUrl } from '@africatourismgate/utils';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const adminUrl = getAdminAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(adminUrl),
  title: {
    default: 'Africa Tourism Gate — Admin',
    template: '%s | Africa Tourism Gate Admin',
  },
  description: 'Back office Africa Tourism Gate',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
