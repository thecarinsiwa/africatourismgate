import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@africatourismgate/ui';
import { getAdminAppUrl } from '@africatourismgate/utils';

const adminUrl = getAdminAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(adminUrl),
  title: 'Africa Tourism Gate — Admin',
  description: 'Back office',
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
