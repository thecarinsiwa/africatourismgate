'use client';

import { Card } from '@africatourismgate/ui';
import type { Donation } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { DonationForm } from './donation-form';
import { ParametresPageLayout } from './parametres-subnav';

type DonationEditPageProps = {
  donationId?: string;
  mode: 'create' | 'edit';
};

export function DonationEditPage({ donationId, mode }: DonationEditPageProps) {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.donations.form');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<string | null>(null);

  useSetAdminPageMeta({
    title: mode === 'create' ? t('createTitle') : t('editTitle'),
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
        if (!canRead) setAccessError(t('denied'));
      })
      .catch(() => {
        if (!cancelled) setAccessError(t('denied'));
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

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
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </ParametresPageLayout>
    );
  }

  if (mode === 'edit' && (loadError || !donation)) {
    return (
      <ParametresPageLayout>
        <Card className="p-6">
          <p className="text-sm text-destructive">{loadError ?? t('notFound')}</p>
        </Card>
      </ParametresPageLayout>
    );
  }

  return (
    <ParametresPageLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === 'create' ? t('createTitle') : t('editTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('intro')}</p>
        </div>
        <DonationForm
          mode={mode}
          donationId={donationId}
          initialDonation={donation ?? undefined}
          canWrite={canWrite}
        />
      </div>
    </ParametresPageLayout>
  );
}
