import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AppShell } from '@africatourismgate/ui';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Africa Tourism Gate',
  description: 'Travel booking — web',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
