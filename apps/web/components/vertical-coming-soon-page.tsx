'use client';

import { useTranslations } from 'next-intl';
import { ComingSoonShell } from './coming-soon/coming-soon-shell';
import type { SearchVertical } from '../lib/search/route';

export function VerticalComingSoonPage({ vertical }: { vertical: SearchVertical }) {
  const tComingSoon = useTranslations('comingSoon');
  const tSearch = useTranslations('search');
  const verticalLabel = tSearch(`tabs.${vertical}`);

  return (
    <ComingSoonShell
      badge={tComingSoon('badge')}
      title={verticalLabel}
      description={tComingSoon('body')}
      primaryAction={{ label: tComingSoon('backToSearch'), href: '/#search' }}
      secondaryAction={{ label: tComingSoon('backHome'), href: '/' }}
    />
  );
}
