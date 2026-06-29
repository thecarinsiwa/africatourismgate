'use client';

import { useEffect, useState } from 'react';
import type { PublicDestination } from '@africatourismgate/types';
import { listActivityDestinations } from '../api/public';

export function useActivityDestinations() {
  const [destinations, setDestinations] = useState<PublicDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listActivityDestinations()
      .then((rows) => {
        if (!cancelled) {
          setDestinations(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDestinations([]);
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

  return { destinations, loading, error };
}
