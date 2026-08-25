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
  const tailKey =
    breadcrumbTail?.map((item) => `${item.href ?? ''}:${item.label}`).join('|') ??
    (entityLabel ? `:${entityLabel}` : '');

  const pageMeta = useMemo(() => {
    if (!ready) return {};
    const tail =
      breadcrumbTail ?? (entityLabel ? [{ label: entityLabel }] : undefined);
    return { title, breadcrumbTail: tail };
  }, [ready, title, entityLabel, breadcrumbTail, tailKey]);

  useSetAdminPageMeta(pageMeta);
}
