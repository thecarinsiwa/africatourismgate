'use client';

import { Card } from '@africatourismgate/ui';
import type { Donation } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { routePathToTranslationNamespace } from '../../lib/i18n/admin-page-i18n';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { DonationForm } from './donation-form';
import { ParametresPageLayout } from './parametres-subnav';

type DonationEditPageProps = {
  donationId?: string;
  mode: 'create' | 'edit';
};

export function DonationEditPage({ donationId, mode }: DonationEditPageProps) {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.settings.donations.form');
  const tCommon = useTranslations('modules.common');
  const pageRoutePath = mode === 'create' ? 'parametres/dons/nouveau' : 'parametres/dons/edit';
  const tPage = useTranslations(routePathToTranslationNamespace(pageRoutePath));
  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<string | null>(null);

  useSetAdminPageMeta({
    title: mode === 'create' ? tPage('title') : undefined,
  });

  useAdminEditPageMeta({
    ready: mode === 'edit' && !loading && !!donation && !loadError,
    title: tPage('title'),
    entityLabel: donation?.title,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        const canRead =
          me.isSuperAdmin || me.permissions.includes('organization_settings.read');
        setCanWrite(
          me.isSuperAdmin || me.permissions.includes('organization_settings.write'),
        );
        if (!canRead) setAccessError(tForm('denied'));
      })
      .catch(() => {
        if (!cancelled) setAccessError(tForm('denied'));
      });
    return () => {
      cancelled = true;
    };
  }, [tForm]);

  useEffect(() => {
    if (mode !== 'edit' || !donationId || accessError) return;
    let cancelled = false;
    setLoading(true);
    void getApiClient()
      .getDonation(donationId)
      .then((row) => {
        if (!cancelled) setDonation(row);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessError, donationId, getErrorMessage, mode]);

  if (accessError) {
    return (
      <ParametresPageLayout>
        <Card className="p-6">
          <p className="text-sm text-destructive">{accessError}</p>
        </Card>
      </ParametresPageLayout>
    );
  }

  if (mode === 'edit' && loading) {
    return (
      <ParametresPageLayout>
        <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
      </ParametresPageLayout>
    );
  }

  if (mode === 'edit' && (loadError || !donation)) {
    return (
      <ParametresPageLayout>
        <Card className="p-6">
          <p className="text-sm text-destructive">{loadError ?? tForm('notFound')}</p>
        </Card>
      </ParametresPageLayout>
    );
  }

  return (
    <ParametresPageLayout>
      <AdminIntroPage
        routePath={pageRoutePath}
        backHref="/parametres/dons"
        backLabelKey="backLabel"
      >
        <DonationForm
          mode={mode}
          donationId={donationId}
          initialDonation={donation ?? undefined}
          canWrite={canWrite}
        />
      </AdminIntroPage>
    </ParametresPageLayout>
  );
}
