'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePermissions } from '../../lib/auth/use-permissions';
import { ReviewsList } from '../reviews/reviews-list';
import { TripadvisorSyncPanel } from '../reviews/tripadvisor-sync-panel';
import { AdminListPageHeader } from './admin-list-page-header';

export function AvisPageContent() {
  const t = useTranslations('pages.contenu.avis');
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('reviews.write');
  const [listReloadToken, setListReloadToken] = useState(0);

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
      <TripadvisorSyncPanel
        onSynced={() => setListReloadToken((token) => token + 1)}
      />
      <ReviewsList reloadToken={listReloadToken} />

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
