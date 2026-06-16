'use client';

import type { OrganizationListItem } from '@africatourismgate/types';
import { AlertDialog } from '@africatourismgate/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';
import { useUnsavedChangesGuard } from '../rbac/use-unsaved-changes-guard';
import { ParametresPageLayout } from './parametres-subnav';
import {
  OrganizationSettingsForm,
  resolveInitialOrganizationId,
} from './organization-settings-form';

export function OrganizationSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [formDirty, setFormDirty] = useState(false);
  const { dialogOpen, setDialogOpen, requestAction, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(formDirty);

  useSetAdminPageMeta({ title: 'Paramètres' });

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
            setAccessError('Vous n’avez pas la permission de consulter les paramètres.');
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
  }, [searchParams]);

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
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {accessError}
        </p>
      </ParametresPageLayout>
    );
  }

  if (!organizationId) {
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
          Configuration de l’organisation : coordonnées, locale, réservation et branding.
        </p>
        <OrganizationSettingsForm
          organizationId={organizationId}
          isSuperAdmin={isSuperAdmin}
          organizations={organizations}
          onOrganizationIdChange={isSuperAdmin ? handleOrganizationChange : undefined}
          onDirtyChange={setFormDirty}
        />
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
