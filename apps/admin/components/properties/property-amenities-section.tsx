'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, useToast } from '@africatourismgate/ui';
import type { Amenity } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAmenityIcon } from '../../lib/amenity-icon-map';
import { getApiClient } from '../../lib/auth/api';

type PropertyAmenitiesSectionProps = {
  propertyId: string;
  embedded?: boolean;
};

export function PropertyAmenitiesSection({
  propertyId,
  embedded,
}: PropertyAmenitiesSectionProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.properties.sections.amenities');
  const tCommon = useTranslations('modules.common');
  const tToast = useTranslations('modules.common.toast');
  const { toast } = useToast();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [allAmenities, links] = await Promise.all([
        client.listAmenities({ page: 1, limit: 100 }),
        client.listPropertyAmenities({ propertyId, page: 1, limit: 100 }),
      ]);
      setAmenities(allAmenities.data);
      setSelected(new Set(links.data.map((l) => l.amenityId)));
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [propertyId, getHebergementsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () => [...amenities].sort((a, b) => a.name.localeCompare(b.name)),
    [amenities],
  );

  function toggle(amenityId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(amenityId)) next.delete(amenityId);
      else next.add(amenityId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await getApiClient().replacePropertyAmenities({
        propertyId,
        amenityIds: Array.from(selected),
      });
      toast({
        title: tToast('amenitiesSavedTitle'),
        message: tToast('amenitiesSavedMessage'),
        variant: 'success',
      });
      await load();
    } catch (err) {
      const message = getHebergementsErrorMessage(err);
      setError(message);
      toast({
        title: tToast('saveError'),
        message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={
        embedded ? 'space-y-6' : 'mt-12 space-y-6 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
          <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
        </div>
        <Button type="button" onClick={() => void handleSave()} loading={saving}>
          {t('saveSelection')}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <Card variant="dashboard">
        {loading ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-atg-muted">
            {t('emptyGlobal')}{' '}
            <a href="/hebergements/equipements" className="text-primary hover:underline">
              {t('createLink')}
            </a>
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-atg-border px-3 py-2 hover:bg-atg-surface/50">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                    className="h-4 w-4 rounded border-atg-border text-primary"
                  />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-atg-surface text-primary">
                    {getAmenityIcon(a.code, 'h-4 w-4')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-atg-fg">{a.name}</span>
                    <span className="font-mono text-xs text-atg-muted">{a.code}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
