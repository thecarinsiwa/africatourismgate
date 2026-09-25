import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from '@africatourismgate/ui';
import { PosConnectionLockProvider } from '../components/connection-lock/pos-connection-lock-provider';
import { SessionSync } from '../components/session-sync';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: {
    default: 'Africa Tourism Gate — Caisse',
    template: '%s | Africa Tourism Gate Caisse',
  },
  description: 'Point de vente Africa Tourism Gate',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider defaultTheme="system">
          <PosConnectionLockProvider>
            <SessionSync />
            {children}
          </PosConnectionLockProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
