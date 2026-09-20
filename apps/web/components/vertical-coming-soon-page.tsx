'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { ComingSoonShell } from './coming-soon/coming-soon-shell';
import { useTranslations } from '../lib/i18n/locale-provider';
import type { SearchVertical } from '../lib/search/route';

export function VerticalComingSoonPage({ vertical }: { vertical: SearchVertical }) {
  const t = useTranslations();
  const tComingSoon = useNextIntlTranslations('comingSoon');
  const verticalLabel = t.search.tabs[vertical];

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
