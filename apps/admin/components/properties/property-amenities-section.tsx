'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, DataTableBadge, Input, useToast } from '@africatourismgate/ui';
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
  const [search, setSearch] = useState('');
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...amenities].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    if (!query) return sorted;
    return sorted.filter((amenity) => {
      const haystack = `${amenity.name} ${amenity.code}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [amenities, search]);

  const hasSearch = search.trim().length > 0;
  const selectedCount = selected.size;

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
        embedded ? 'space-y-4' : 'mt-12 space-y-4 border-t border-atg-border pt-10'
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
            {!loading ? (
              <>
                <DataTableBadge variant="success">
                  {t('selectedCount', { count: selectedCount })}
                </DataTableBadge>
                <DataTableBadge variant="muted">
                  {hasSearch
                    ? `${filtered.length}/${amenities.length}`
                    : amenities.length}
                </DataTableBadge>
              </>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-atg-muted">{t('intro')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/hebergements/equipements" variant="outline" size="sm">
            {t('createLink')}
          </Button>
          <Button type="button" size="sm" onClick={() => void handleSave()} loading={saving}>
            {t('saveSelection')}
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!loading && amenities.length > 0 ? (
        <div className="max-w-md">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('searchPlaceholder')}
          />
        </div>
      ) : null}

      <Card variant="dashboard" padding="sm">
        {loading ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : amenities.length === 0 ? (
          <p className="text-sm text-atg-muted">
            {t('emptyGlobal')}{' '}
            <a href="/hebergements/equipements" className="text-primary hover:underline">
              {t('createLink')}
            </a>
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('searchEmpty')}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((amenity) => {
              const isSelected = selected.has(amenity.id);
              return (
                <li key={amenity.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                      isSelected
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-atg-border hover:bg-atg-surface/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(amenity.id)}
                      className="h-4 w-4 shrink-0 rounded border-atg-border text-primary"
                    />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-atg-surface text-primary">
                      {getAmenityIcon(amenity.code, 'h-4 w-4')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-atg-fg">
                        {amenity.name}
                      </span>
                      <code className="mt-0.5 inline-block max-w-full truncate rounded-md bg-atg-surface px-1.5 py-0.5 font-mono text-[11px] text-atg-muted">
                        {amenity.code}
                      </code>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
