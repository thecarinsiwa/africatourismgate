import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AppShell } from '@africatourismgate/ui';
import type { CSSProperties } from 'react';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3002';
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const themeInitScript = `
  try {
    const storedTheme = localStorage.getItem('atg-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
`;

type PublicBranding = {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
};

const defaultBranding: PublicBranding = {
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0B6E4F',
  secondaryColor: '#199a45',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function shiftHexColor(hex: string, amount: number) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

async function getPublicBranding(): Promise<PublicBranding> {
  try {
    const response = await fetch(`${apiUrl}/organization-settings/public/branding`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultBranding;
    const branding = (await response.json()) as Partial<PublicBranding>;
    return {
      displayName: branding.displayName ?? defaultBranding.displayName,
      primaryColor: branding.primaryColor ?? defaultBranding.primaryColor,
      secondaryColor: branding.secondaryColor ?? defaultBranding.secondaryColor,
    };
  } catch {
    return defaultBranding;
  }
}

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getPublicBranding();
  const themeStyle = {
    '--atg-primary': branding.primaryColor,
    '--atg-primary-hover': shiftHexColor(branding.primaryColor, -28),
    '--atg-primary-light': shiftHexColor(branding.primaryColor, 24),
    '--atg-secondary': branding.secondaryColor,
    '--atg-secondary-hover': shiftHexColor(branding.secondaryColor, -28),
  } as CSSProperties;

  return (
    <html lang="fr" className={montserrat.variable} suppressHydrationWarning>
      <body
        className="bg-atg-surface font-sans text-atg-fg antialiased transition-colors duration-300"
        style={themeStyle}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
