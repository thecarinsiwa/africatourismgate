'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ComingSoonShell } from './coming-soon/coming-soon-shell';

export type MaintenancePageProps = {
  title: string | null;
  message: string | null;
  endsAt: string | null;
};

function formatEndsAt(iso: string, locale: string): string | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(ms));
  } catch {
    return iso;
  }
}

export function MaintenancePage({ title, message, endsAt }: MaintenancePageProps) {
  const t = useTranslations('maintenance');
  const locale = useLocale();
  const endsAtFormatted = endsAt ? formatEndsAt(endsAt, locale) : null;

  return (
    <ComingSoonShell
      badge={t('badge')}
      title={title?.trim() || t('title')}
      description={message?.trim() || t('message')}
    >
      {endsAtFormatted ? (
        <p className="mt-3 text-sm font-medium text-atg-fg/80">
          {t('endsAtLabel', { date: endsAtFormatted })}
        </p>
      ) : null}
    </ComingSoonShell>
  );
}
