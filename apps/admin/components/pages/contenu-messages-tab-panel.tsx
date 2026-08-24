'use client';

import { EmptyState } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';

export function ContenuMessagesTabPanel() {
  const t = useTranslations('pages.contenu.support.messages');

  return (
    <EmptyState
      title={t('emptyTitle')}
      description={t('emptyDescription')}
    />
  );
}
