'use client';

import { Card } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';

/** Doc handoff TRESO-041 — créé dans l’épic suivant. */
const SYSCOHADA_EPIC_DOC_HREF =
  'https://github.com/thecarinsiwa/africatourismgate/blob/main/docs/tresorerie-syscohada-epic-next.md';

/**
 * Bannière stub : pas de journal / bilan / plan comptable dans ce lot.
 */
export function AccountingBridgeNotice({ className }: { className?: string }) {
  const t = useTranslations('modules.treasury.accounting.notice');

  return (
    <Card variant="dashboard" padding="sm" className={className} role="status">
      <h2 className="text-base font-semibold text-atg-fg">{t('title')}</h2>
      <p className="mt-2 text-sm text-atg-muted">{t('body')}</p>
      <p className="mt-3 text-sm text-atg-muted">{t('outOfScope')}</p>
      <p className="mt-4">
        <a
          href={SYSCOHADA_EPIC_DOC_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t('docLink')}
        </a>
      </p>
    </Card>
  );
}
