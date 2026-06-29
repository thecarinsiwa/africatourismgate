'use client';

import { ComingSoonShell } from './coming-soon/coming-soon-shell';
import { useTranslations } from '../lib/i18n/locale-provider';
import type { SearchVertical } from '../lib/search/route';

export function VerticalComingSoonPage({ vertical }: { vertical: SearchVertical }) {
  const t = useTranslations();
  const verticalLabel = t.search.tabs[vertical];

  return (
    <ComingSoonShell
      badge={t.comingSoon.badge}
      title={verticalLabel}
      description={t.comingSoon.body}
      primaryAction={{ label: t.comingSoon.backToSearch, href: '/#search' }}
      secondaryAction={{ label: t.comingSoon.backHome, href: '/' }}
    />
  );
}
