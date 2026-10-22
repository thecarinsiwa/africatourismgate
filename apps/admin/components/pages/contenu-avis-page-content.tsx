'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePermissions } from '../../lib/auth/use-permissions';
import { ReviewsList } from '../reviews/reviews-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AvisPageContent() {
  const t = useTranslations('pages.contenu.avis');
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('reviews.write');

  return (
    <div className="relative min-w-0 pb-20 sm:pb-0">
      <AdminListPageHeader
        routePath="contenu/avis"
        actions={
          canWrite ? (
            <Button href="/contenu/avis/tripadvisor/nouveau" className="hidden sm:inline-flex">
              {t('actions.newTripadvisor')}
            </Button>
          ) : null
        }
      />
      <ReviewsList />

      {canWrite ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 sm:hidden">
          <div className="pointer-events-auto mx-auto max-w-lg">
            <Button href="/contenu/avis/tripadvisor/nouveau" fullWidth size="lg">
              {t('actions.newTripadvisor')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
