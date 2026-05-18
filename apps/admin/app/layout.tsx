import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
