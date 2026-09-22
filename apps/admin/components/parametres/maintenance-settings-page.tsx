'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import type { OrganizationListItem } from '@africatourismgate/types';
import { AlertDialog, Spinner } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { routePathToTranslationNamespace } from '../../lib/i18n/admin-page-i18n';
import { getApiClient } from '../../lib/auth/api';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { resolveInitialOrganizationId } from './organization-settings-form';
import { MaintenanceSettingsForm } from './maintenance-settings-form';
import { ParametresPageLayout } from './parametres-subnav';

export function MaintenanceSettingsPage() {
  const { organizationSettings: getOrganizationSettingsErrorMessage } =
    useAdminErrorMessages();
  const t = useTranslations('modules.settings');
  const tCommon = useTranslations('modules.common');
  const tPage = useTranslations(
    routePathToTranslationNamespace('parametres/maintenance'),
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [formDirty, setFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  useSetAdminPageMeta({ title: tPage('title') });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        const canRead =
          me.isSuperAdmin ||
          me.permissions.includes('organization_settings.read');
        if (!canRead) {
          if (!cancelled) {
            setAccessError(t('page.denied'));
          }
          return;
        }

        const orgId = resolveInitialOrganizationId(
          me.isSuperAdmin,
          me.user.organizationId,
          searchParams.get('organizationId'),
        );

        if (!cancelled) {
          setIsSuperAdmin(me.isSuperAdmin);
          setCanWrite(
            me.isSuperAdmin ||
              me.permissions.includes('organization_settings.write'),
          );
          setOrganizationId(orgId);
        }

        if (me.isSuperAdmin) {
          const orgs = await client.listOrganizations({ page: 1, limit: 100 });
          if (!cancelled) {
            setOrganizations(orgs.data);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setAccessError(getOrganizationSettingsErrorMessage(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [getOrganizationSettingsErrorMessage, searchParams, t]);

  const handleOrganizationChange = useCallback(
    (id: string) => {
      setOrganizationId(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set('organizationId', id);
      router.replace(`/parametres/maintenance?${params.toString()}`);
    },
    [router, searchParams],
  );

  if (accessError) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/maintenance" />
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {accessError}
          </p>
        </div>
      </ParametresPageLayout>
    );
  }

  if (loading || !organizationId) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0 space-y-6">
          <AdminListPageHeader routePath="parametres/maintenance" />
          <div className="flex items-center justify-center py-16">
            <Spinner
              size="lg"
              variant="primary"
              label={tCommon('loading')}
              showLabel
            />
          </div>
        </div>
      </ParametresPageLayout>
    );
  }

  return (
    <>
      <ParametresPageLayout
        onSubnavNavigate={
          formDirty ? (_href, proceed) => requestAction(proceed) : undefined
        }
      >
        <div className="min-w-0 space-y-6">
          <AdminListPageHeader routePath="parametres/maintenance" />
          <MaintenanceSettingsForm
            organizationId={organizationId}
            isSuperAdmin={isSuperAdmin}
            canWrite={canWrite}
            organizations={organizations}
            onOrganizationIdChange={
              isSuperAdmin ? handleOrganizationChange : undefined
            }
            onDirtyChange={setFormDirty}
          />
        </div>
      </ParametresPageLayout>
      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t('unsaved.title')}
        description={t('unsaved.description')}
        confirmLabel={t('unsaved.confirm')}
        cancelLabel={t('unsaved.cancel')}
        variant="danger"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
