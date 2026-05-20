'use client';

import { Button, Card } from '@africatourismgate/ui';
import type { Amenity } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';

type PropertyAmenitiesSectionProps = {
  propertyId: string;
};

export function PropertyAmenitiesSection({ propertyId }: PropertyAmenitiesSectionProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [allAmenities, links] = await Promise.all([
        client.listAmenities({ page: 1, limit: 200 }),
        client.listPropertyAmenities({ propertyId, page: 1, limit: 200 }),
      ]);
      setAmenities(allAmenities.data);
      setSelected(new Set(links.data.map((l) => l.amenityId)));
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

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
    setSuccess(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await getApiClient().replacePropertyAmenities({
        propertyId,
        amenityIds: Array.from(selected),
      });
      setSuccess('Équipements enregistrés.');
      await load();
    } catch (err) {
      setError(getHebergementsErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-12 space-y-6 border-t border-atg-border pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-atg-fg">Équipements</h2>
          <p className="mt-1 text-sm text-atg-muted">
            Sélectionnez les équipements disponibles pour cet hébergement.
          </p>
        </div>
        <Button type="button" onClick={() => void handleSave()} loading={saving}>
          Enregistrer la sélection
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-primary">{success}</p>
      ) : null}

      <Card variant="dashboard">
        {loading ? (
          <p className="text-sm text-atg-muted">Chargement…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-atg-muted">
            Aucun équipement global.{' '}
            <a href="/hebergements/equipements" className="text-primary hover:underline">
              Créer des équipements
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
