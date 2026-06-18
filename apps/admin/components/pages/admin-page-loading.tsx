'use client';

import { useTranslations } from 'next-intl';

export function AdminPageLoading() {
  const t = useTranslations('common.loading');
  return <p className="text-sm text-atg-muted">{t('page')}</p>;
}
