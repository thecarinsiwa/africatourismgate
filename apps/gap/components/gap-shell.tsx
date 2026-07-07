import type { ReactNode } from 'react';
import { AppShell } from '@africatourismgate/ui';
import { getLocale } from 'next-intl/server';
import { GapFooter } from './gap-footer';
import { GapHeader } from './gap-header';
import { getGapHomeForLocale, resolveGapDonateUrl } from '@/lib/api/public-gap';

export async function GapShell({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  let donateUrl: string | null = null;
  let donateLabel: string | null = null;

  try {
    const home = await getGapHomeForLocale(locale);
    donateUrl = resolveGapDonateUrl(home.settings);
    donateLabel = home.settings?.donateLabel?.trim() || null;
  } catch {
    donateUrl = resolveGapDonateUrl(null);
  }

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col bg-atg-surface text-atg-fg">
        <GapHeader donateUrl={donateUrl} donateLabel={donateLabel} />
        <main className="flex-1">{children}</main>
        <GapFooter />
      </div>
    </AppShell>
  );
}
