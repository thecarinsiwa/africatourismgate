'use client';

import { Button, EmptyState } from '@africatourismgate/ui';
import { AdminPageIntro } from './admin-page-intro';
import { getSectionPlaceholderConfig } from './admin-section-placeholder';
import { SetAdminPageMeta } from './set-admin-page-meta';

type DashboardSectionPageProps = {
  title: string;
  description?: string;
  /** Chemin section (ex. `['contenu', 'messages']`) pour illustration et CTA. */
  segments?: string[];
};

export function DashboardSectionPage({
  title,
  description = 'Module en cours de déploiement.',
  segments = [],
}: DashboardSectionPageProps) {
  const sectionKey = segments.join('/');
  const placeholder = getSectionPlaceholderConfig(sectionKey);

  return (
    <>
      <SetAdminPageMeta title={title} />
      <AdminPageIntro description={description} />
      <EmptyState
        className="mt-6"
        title={placeholder.emptyTitle ?? title}
        description={placeholder.emptyDescription ?? description}
        icon={placeholder.icon}
        action={
          placeholder.cta ? (
            <Button href={placeholder.cta.href}>{placeholder.cta.label}</Button>
          ) : undefined
        }
      />
    </>
  );
}
