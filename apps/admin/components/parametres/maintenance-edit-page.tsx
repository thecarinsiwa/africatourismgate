'use client';

import { Card } from '@africatourismgate/ui';
import type { OrganizationMaintenance } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { routePathToTranslationNamespace } from '../../lib/i18n/admin-page-i18n';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { MaintenanceForm } from './maintenance-form';
import { ParametresPageLayout } from './parametres-subnav';
import { resolveInitialOrganizationId } from './organization-settings-form';

type MaintenanceEditPageProps = {
  maintenanceId?: string;
  mode: 'create' | 'edit';
};

export function MaintenanceEditPage({
  maintenanceId,
  mode,
}: MaintenanceEditPageProps) {
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.settings.maintenances.form');
  const tCommon = useTranslations('modules.common');
  const searchParams = useSearchParams();
  const pageRoutePath =
    mode === 'create' ? 'parametres/maintenance/nouveau' : 'parametres/maintenance/edit';
  const tPage = useTranslations(routePathToTranslationNamespace(pageRoutePath));

  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState<OrganizationMaintenance | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<string | null>(null);

  useSetAdminPageMeta({
    title: mode === 'create' ? tPage('title') : undefined,
  });

  useAdminEditPageMeta({
    ready: mode === 'edit' && !loading && !!maintenance && !loadError,
    title: tPage('title'),
    entityLabel: maintenance?.title ?? undefined,
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
        setIsSuperAdmin(me.isSuperAdmin);
        setOrganizationId(
          resolveInitialOrganizationId(
            me.isSuperAdmin,
            me.user.organizationId,
            searchParams.get('organizationId'),
          ),
        );
        if (!canRead) setAccessError(tForm('denied'));
      })
      .catch(() => {
        if (!cancelled) setAccessError(tForm('denied'));
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, tForm]);

  useEffect(() => {
    if (mode !== 'edit' || !maintenanceId || accessError || !organizationId) return;
    let cancelled = false;
    setLoading(true);
    void getApiClient()
      .getOrganizationMaintenance(
        maintenanceId,
        isSuperAdmin ? organizationId : undefined,
      )
      .then((row) => {
        if (!cancelled) setMaintenance(row);
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
  }, [
    accessError,
    getErrorMessage,
    isSuperAdmin,
    maintenanceId,
    mode,
    organizationId,
  ]);

  const backHref = organizationId
    ? `/parametres/maintenance?organizationId=${organizationId}`
    : '/parametres/maintenance';

  if (accessError) {
    return (
      <ParametresPageLayout>
        <Card className="p-6">
          <p className="text-sm text-destructive">{accessError}</p>
        </Card>
      </ParametresPageLayout>
    );
  }

  if (!organizationId || (mode === 'edit' && loading)) {
    return (
      <ParametresPageLayout>
        <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
      </ParametresPageLayout>
    );
  }

  if (mode === 'edit' && (loadError || !maintenance)) {
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
        backHref={backHref}
        backLabelKey="backLabel"
      >
        <MaintenanceForm
          mode={mode}
          maintenanceId={maintenanceId}
          initialMaintenance={maintenance ?? undefined}
          organizationId={organizationId}
          isSuperAdmin={isSuperAdmin}
          canWrite={canWrite}
        />
      </AdminIntroPage>
    </ParametresPageLayout>
  );
}
