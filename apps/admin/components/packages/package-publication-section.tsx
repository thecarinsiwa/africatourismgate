'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card } from '@africatourismgate/ui';
import type { Package } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

type PackagePublicationSectionProps = {
  packageId: string;
  initialPackage: Package;
  onSaved?: (nextPackage: Package) => void;
};

export function PackagePublicationSection({
  packageId,
  initialPackage,
  onSaved,
}: PackagePublicationSectionProps) {
  const { packages: getPackagesErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.packages.form');
  const tActions = useTranslations('common.actions');

  const [active, setActive] = useState(initialPackage.active === 1);
  const [isFeatured, setIsFeatured] = useState(initialPackage.isFeatured === 1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const updated = await getApiClient().updatePackage(packageId, {
        active,
        isFeatured,
      });
      onSaved?.(updated);
    } catch (err) {
      setError(getPackagesErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="dashboard" className="max-w-2xl space-y-4">
      <h3 className="text-sm font-semibold text-atg-fg">{tForm('sections.publication')}</h3>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-atg-fg">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-atg-border"
        />
        {tForm('activeLabel')}
      </label>
      <label className="flex items-center gap-2 text-sm text-atg-fg">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="rounded border-atg-border"
        />
        {tForm('featuredLabel')}
      </label>
      <p className="text-xs text-atg-muted">{tForm('featuredHint')}</p>

      <div className="flex gap-2">
        <Button type="button" onClick={() => void handleSave()} loading={saving}>
          {tActions('save')}
        </Button>
      </div>
    </Card>
  );
}
