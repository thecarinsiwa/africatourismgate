'use client';

import { useEffect, useState } from 'react';
import type { PublicDestination } from '@africatourismgate/types';
import { listVehiclePickupLocations } from '../api/public';

export function useVehiclePickupLocations() {
  const [locations, setLocations] = useState<PublicDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listVehiclePickupLocations()
      .then((rows) => {
        if (!cancelled) {
          setLocations(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLocations([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { locations, loading, error };
}
