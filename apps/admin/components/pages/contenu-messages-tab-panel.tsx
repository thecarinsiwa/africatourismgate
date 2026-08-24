'use client';

import { Button, EmptyState } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { getSectionPlaceholderConfig } from '../admin-section-placeholder';
import { getPlaceholderSectionMessages } from '../../lib/placeholder-section-i18n';

const MESSAGES_SECTION_PATH = 'contenu/messages';

export function ContenuMessagesTabPanel() {
  const placeholder = getSectionPlaceholderConfig(MESSAGES_SECTION_PATH);
  const tPlaceholder = useTranslations('placeholderSections');
  const tNav = useTranslations('nav');
  const messages = getPlaceholderSectionMessages({
    sectionPath: MESSAGES_SECTION_PATH,
    tPlaceholder,
    tNav,
  });

  return (
    <EmptyState
      title={messages.emptyTitle}
      description={messages.emptyDescription}
      icon={placeholder.icon}
      action={
        placeholder.ctaHref && messages.ctaLabel ? (
          <Button href={placeholder.ctaHref} size="md">
            {messages.ctaLabel}
          </Button>
        ) : undefined
      }
    />
  );
}
