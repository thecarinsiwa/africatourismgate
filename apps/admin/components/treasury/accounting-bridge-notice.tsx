'use client';

import { Card } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';

/**
 * Bannière livres SYSCOHADA — données API réelles uniquement (SYSCO-006).
 */
export function AccountingBridgeNotice({ className }: { className?: string }) {
  const t = useTranslations('modules.treasury.accounting.notice');

  return (
    <Card variant="dashboard" padding="sm" className={className} role="status">
      <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
      <p className="mt-2 text-sm text-atg-muted">{t('body')}</p>
      <p className="mt-3 text-sm text-atg-muted">{t('outOfScope')}</p>
    </Card>
  );
}
