import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AppShell } from '@africatourismgate/ui';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3002';

const themeInitScript = `
  try {
    const storedTheme = localStorage.getItem('atg-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Africa Tourism Gate — Réservez votre voyage en Afrique',
    template: '%s | Africa Tourism Gate',
  },
  description:
    'Hôtels, vols, activités et forfaits en Afrique. Comparez et réservez avec Africa Tourism Gate.',
  keywords: [
    'Afrique',
    'tourisme',
    'hôtels',
    'voyage',
    'réservation',
    'safari',
    'hébergement',
  ],
  authors: [{ name: 'Africa Tourism Gate' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Africa Tourism Gate',
    title: 'Africa Tourism Gate — Réservez votre voyage en Afrique',
    description:
      'Hôtels, vols, activités et forfaits en Afrique. Comparez et réservez avec Africa Tourism Gate.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Africa Tourism Gate',
    description:
      'Hôtels, vols, activités et forfaits en Afrique. Comparez et réservez avec Africa Tourism Gate.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable} suppressHydrationWarning>
      <body className="bg-atg-surface font-sans text-atg-fg antialiased transition-colors duration-300">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
