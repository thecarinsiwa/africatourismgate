'use client';

import { ComingSoonShell } from './coming-soon/coming-soon-shell';
import { useTranslations } from '../lib/i18n/locale-provider';

export function ComingSoonPage() {
  const t = useTranslations();

  return (
    <ComingSoonShell
      badge={t.comingSoon.badge}
      title={t.comingSoon.title}
      description={t.comingSoon.siteBody}
      primaryAction={{ label: t.comingSoon.backHome, href: '/' }}
      secondaryAction={{ label: t.comingSoon.backToSearch, href: '/#search' }}
    />
  );
}
