'use client';

import { useTranslations } from 'next-intl';
import { ComingSoonShell } from './coming-soon/coming-soon-shell';

export function ComingSoonPage() {
  const t = useTranslations('comingSoon');

  return (
    <ComingSoonShell
      badge={t('badge')}
      title={t('title')}
      description={t('siteBody')}
      primaryAction={{ label: t('backHome'), href: '/' }}
      secondaryAction={{ label: t('backToSearch'), href: '/#search' }}
    />
  );
}
