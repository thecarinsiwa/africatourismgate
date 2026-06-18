'use client';

import { useEffect, useState } from 'react';
import type { PublicDestinationHighlight } from '@africatourismgate/types';
import { listFeaturedDestinations } from '../api/public';

export function useFeaturedDestinations(limit = 4) {
  const [destinations, setDestinations] = useState<PublicDestinationHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listFeaturedDestinations(limit)
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
  }, [limit]);

  return { destinations, loading, error };
}
