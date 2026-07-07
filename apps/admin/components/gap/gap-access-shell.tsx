'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';

type GapAccessShellProps = {
  children: ReactNode;
  requireWrite?: boolean;
};

export function GapAccessShell({ children, requireWrite = false }: GapAccessShellProps) {
  const { canRead, canWrite, loading } = useGapPermissions();
  const t = useTranslations('modules.gap.access');
  const tCommonForm = useTranslations('modules.common.form');

  if (loading) {
    return <p className="text-sm text-atg-muted">{tCommonForm('loading')}</p>;
  }

  if (!canRead) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {t('deniedRead')}
      </p>
    );
  }

  if (requireWrite && !canWrite) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {t('deniedWrite')}
      </p>
    );
  }

  return <>{children}</>;
}
