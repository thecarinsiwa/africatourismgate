'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';
import { EmailBrandingForm } from './email-branding-form';
import { ParametresSubnav } from './parametres-subnav';

export function EmailBrandingPage() {
  const [accessError, setAccessError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <div>
        <ParametresSubnav />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {accessError}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <ParametresSubnav />
        <p className="text-sm text-atg-muted">Chargement…</p>
      </div>
    );
  }

  return (
    <div>
      <ParametresSubnav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">E-mails</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Personnalisez l’apparence des e-mails transactionnels (bienvenue, confirmation de
          réservation).
        </p>
      </div>
      <EmailBrandingForm canWrite={canWrite} />
    </div>
  );
}
