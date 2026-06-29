'use client';

import { useEffect, useState } from 'react';
import { listPublicAirports } from '../api/public';
import { setAirportsCatalog } from './listings';
import type { PublicAirport } from './types';

export function usePublicAirports() {
  const [airports, setAirports] = useState<PublicAirport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listPublicAirports()
      .then((rows) => {
        if (!cancelled) {
          setAirports(rows);
          setAirportsCatalog(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAirports([]);
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

  return { airports, loading, error };
}
