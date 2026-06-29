'use client';

import { Button, EmptyState, PageHeader } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { getSectionPlaceholderConfig } from './admin-section-placeholder';
import { getPlaceholderSectionMessages } from '../lib/placeholder-section-i18n';

type DashboardSectionPageProps = {
  /** Chemin section (ex. `['contenu', 'messages']`) pour illustration, textes i18n et CTA. */
  segments: string[];
};

export function DashboardSectionPage({ segments }: DashboardSectionPageProps) {
  const sectionKey = segments.join('/');
  const placeholder = getSectionPlaceholderConfig(sectionKey);
  const tPlaceholder = useTranslations('placeholderSections');
  const tNav = useTranslations('nav');
  const messages = getPlaceholderSectionMessages({
    sectionPath: sectionKey,
    tPlaceholder,
    tNav,
  });

  return (
    <div>
      <PageHeader title={messages.title} description={messages.description} />
      <EmptyState
        className="mt-6"
        title={messages.emptyTitle}
        description={messages.emptyDescription}
        icon={placeholder.icon}
        action={
          placeholder.ctaHref && messages.ctaLabel ? (
            <Button href={placeholder.ctaHref}>{messages.ctaLabel}</Button>
          ) : undefined
        }
      />
    </div>
  );
}
