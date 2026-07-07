import type { ReactNode } from 'react';
import { AppShell } from '@africatourismgate/ui';
import { getLocale } from 'next-intl/server';
import { GapFooter } from './gap-footer';
import { GapHeader } from './gap-header';
import { getGapHomeForLocale, resolveGapDonateUrl } from '@/lib/api/public-gap';
import { getPublicDonationsForLocale, resolveNavbarDonation } from '@/lib/api/public-donations';

export async function GapShell({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  let donateUrl: string | null = null;
  let donateLabel: string | null = null;

  try {
    const [donations, home] = await Promise.all([
      getPublicDonationsForLocale(locale, 'gap').catch(() => null),
      getGapHomeForLocale(locale).catch(() => ({ settings: null, impactStats: [] })),
    ]);
    const featured = resolveNavbarDonation(donations);
    donateUrl = featured?.url ?? resolveGapDonateUrl(home.settings);
    donateLabel =
      featured?.buttonLabel?.trim() ||
      home.settings?.donateLabel?.trim() ||
      null;
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
