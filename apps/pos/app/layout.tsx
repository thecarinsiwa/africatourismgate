import type { Metadata } from 'next';
import { SessionSync } from '../components/session-sync';
import './globals.css';

export const metadata: Metadata = {
  title: 'Africa Tourism Gate — POS',
  description: 'Point de vente',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionSync />
        {children}
      </body>
    </html>
  );
}
