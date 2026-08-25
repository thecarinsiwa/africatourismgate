'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { OrganizationListItem } from '@africatourismgate/types';
import { AlertDialog } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { getApiClient } from '../../lib/auth/api';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { ParametresPageLayout } from './parametres-subnav';
import {
  OrganizationSettingsForm,
  resolveInitialOrganizationId,
} from './organization-settings-form';

export function OrganizationSettingsPage() {
  const { organizationSettings: getOrganizationSettingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [formDirty, setFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  useSetAdminPageMeta({ title: t('page.title') });

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
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [searchParams, t, getOrganizationSettingsErrorMessage]);

  const handleOrganizationChange = useCallback(
    (id: string) => {
      setOrganizationId(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set('organizationId', id);
      router.replace(`/parametres?${params.toString()}`);
    },
    [router, searchParams],
  );

  if (accessError) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres" />
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {accessError}
          </p>
        </div>
      </ParametresPageLayout>
    );
  }

  if (!organizationId) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres" />
          <p className="text-sm text-atg-muted">{t('form.loading')}</p>
        </div>
      </ParametresPageLayout>
    );
  }

  return (
    <>
      <ParametresPageLayout
        onSubnavNavigate={formDirty ? (_href, proceed) => requestAction(proceed) : undefined}
      >
        <div className="min-w-0 space-y-6">
          <AdminListPageHeader routePath="parametres" />
          <OrganizationSettingsForm
            organizationId={organizationId}
            isSuperAdmin={isSuperAdmin}
            organizations={organizations}
            onOrganizationIdChange={isSuperAdmin ? handleOrganizationChange : undefined}
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
