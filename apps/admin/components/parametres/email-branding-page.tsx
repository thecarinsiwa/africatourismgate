'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { routePathToTranslationNamespace } from '../../lib/i18n/admin-page-i18n';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { AdminListPageHeader } from '../pages/admin-list-page-header';
import { getApiClient } from '../../lib/auth/api';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { EmailBrandingForm } from './email-branding-form';
import { ParametresPageLayout } from './parametres-subnav';

export function EmailBrandingPage() {
  const { organizationSettings: getOrganizationSettingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings');
  const tEmails = useTranslations('modules.settings.emails');
  const tCommon = useTranslations('modules.common');
  const tPage = useTranslations(routePathToTranslationNamespace('parametres/emails'));
  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formDirty, setFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  useSetAdminPageMeta({ title: tPage('title') });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const me = await getApiClient().getAuthMe();
        const canRead =
          me.isSuperAdmin ||
          me.permissions.includes('organization_settings.read');
        if (!canRead) {
          if (!cancelled) {
            setAccessError(tEmails('page.denied'));
          }
          return;
        }

        if (!cancelled) {
          setCanWrite(
            me.isSuperAdmin ||
              me.permissions.includes('organization_settings.write'),
          );
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
  }, [tEmails, getOrganizationSettingsErrorMessage]);

  if (accessError) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/emails" />
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {accessError}
          </p>
        </div>
      </ParametresPageLayout>
    );
  }

  if (loading) {
    return (
      <ParametresPageLayout>
        <div className="min-w-0">
          <AdminListPageHeader routePath="parametres/emails" />
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
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
          <AdminListPageHeader routePath="parametres/emails" />
          <EmailBrandingForm canWrite={canWrite} onDirtyChange={setFormDirty} />
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
