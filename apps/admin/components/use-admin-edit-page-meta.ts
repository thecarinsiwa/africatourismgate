'use client';

import type { BreadcrumbItem } from '@africatourismgate/ui';
import { useMemo } from 'react';
import { useSetAdminPageMeta } from './admin-page-meta-context';

type UseAdminEditPageMetaOptions = {
  ready: boolean;
  title: string;
  entityLabel?: string;
  breadcrumbTail?: BreadcrumbItem[];
};

/** Enregistre titre + fil d'Ariane pour une fiche édition / détail. */
export function useAdminEditPageMeta({
  ready,
  title,
  entityLabel,
  breadcrumbTail,
}: UseAdminEditPageMetaOptions): void {
  const pageMeta = useMemo(() => {
    if (!ready) return {};
    const tail =
      breadcrumbTail ?? (entityLabel ? [{ label: entityLabel }] : undefined);
    return { title, breadcrumbTail: tail };
  }, [ready, title, entityLabel, breadcrumbTail]);

  useSetAdminPageMeta(pageMeta);
}
