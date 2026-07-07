import type { ReactNode } from 'react';
import { AppShell } from '@africatourismgate/ui';
import { GapFooter } from './gap-footer';
import { GapHeader } from './gap-header';

export function GapShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="flex min-h-screen flex-col bg-atg-surface text-atg-fg">
        <GapHeader />
        <main className="flex-1">{children}</main>
        <GapFooter />
      </div>
    </AppShell>
  );
}
