'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '../auth/api';

export function useGapPermissions() {
  const [canRead, setCanRead] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanRead(me.isSuperAdmin || me.permissions.includes('gap.read'));
          setCanWrite(me.isSuperAdmin || me.permissions.includes('gap.write'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanRead(false);
          setCanWrite(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { canRead, canWrite, loading };
}
