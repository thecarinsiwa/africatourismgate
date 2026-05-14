import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@africatourismgate/ui';

export const metadata: Metadata = {
  title: 'Africa Tourism Gate — Admin',
  description: 'Back office',
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
