'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

function isAllowedTab<T extends string>(
  value: string | null,
  allowedTabs: readonly T[],
): value is T {
  return value !== null && (allowedTabs as readonly string[]).includes(value);
}

/**
 * Synchronise l’onglet actif avec le paramètre d’URL `?tab=`.
 * L’onglet par défaut n’ajoute pas `tab` à l’URL (URL canonique plus courte).
 */
export function useAdminTabFromUrl<T extends string>(
  allowedTabs: readonly T[],
  defaultTab: T,
): {
  activeTab: T;
  setActiveTab: (tab: T) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const activeTab = useMemo(
    () => (isAllowedTab(tabParam, allowedTabs) ? tabParam : defaultTab),
    [allowedTabs, defaultTab, tabParam],
  );

  const setActiveTab = useCallback(
    (tab: T) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === defaultTab) {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [defaultTab, pathname, router, searchParams],
  );

  return { activeTab, setActiveTab };
}
