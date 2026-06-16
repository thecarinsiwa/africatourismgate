'use client';

import { AlertDialog } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { EmailBrandingForm } from './email-branding-form';
import { ParametresPageLayout } from './parametres-subnav';

export function EmailBrandingPage() {
  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formDirty, setFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  useSetAdminPageMeta({ title: 'E-mails' });

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
            setAccessError(
              'Vous n’avez pas la permission de consulter les paramètres e-mail.',
            );
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
  }, []);

  if (accessError) {
    return (
      <ParametresPageLayout>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {accessError}
        </p>
      </ParametresPageLayout>
    );
  }

  if (loading) {
    return (
      <ParametresPageLayout>
        <p className="text-sm text-atg-muted">Chargement…</p>
      </ParametresPageLayout>
    );
  }

  return (
    <>
      <ParametresPageLayout
        onSubnavNavigate={formDirty ? (_href, proceed) => requestAction(proceed) : undefined}
      >
        <p className="mb-8 text-sm text-atg-muted">
          Personnalisez l’apparence des e-mails transactionnels (bienvenue, confirmation de
          réservation).
        </p>
        <EmailBrandingForm canWrite={canWrite} onDirtyChange={setFormDirty} />
      </ParametresPageLayout>
      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Modifications non enregistrées"
        description="Des changements n’ont pas été enregistrés. Quitter sans sauvegarder ?"
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer l’édition"
        variant="danger"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
