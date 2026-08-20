'use client';

import type { BreadcrumbItem } from '@africatourismgate/ui';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AdminPageMeta = {
  /** Titre affiché dans l'en-tête du shell (AppHeader). */
  title?: string;
  /** Segments ajoutés après le fil d'Ariane généré depuis le pathname. */
  breadcrumbTail?: BreadcrumbItem[];
};

type AdminPageMetaContextValue = {
  meta: AdminPageMeta;
  setPageMeta: (meta: AdminPageMeta) => void;
};

const AdminPageMetaContext = createContext<AdminPageMetaContextValue | null>(null);

export function AdminPageMetaProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [meta, setMeta] = useState<AdminPageMeta>({});

  useEffect(() => {
    setMeta({});
  }, [pathname]);

  const setPageMeta = useCallback((next: AdminPageMeta) => {
    setMeta((prev) => {
      const prevTailKey =
        prev.breadcrumbTail?.map((item) => `${item.href ?? ''}:${item.label}`).join('|') ?? '';
      const nextTailKey =
        next.breadcrumbTail?.map((item) => `${item.href ?? ''}:${item.label}`).join('|') ?? '';
      if (prev.title === next.title && prevTailKey === nextTailKey) {
        return prev;
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ meta, setPageMeta }), [meta, setPageMeta]);

  return (
    <AdminPageMetaContext.Provider value={value}>{children}</AdminPageMetaContext.Provider>
  );
}

export function useAdminPageMeta(): AdminPageMetaContextValue {
  const context = useContext(AdminPageMetaContext);
  if (!context) {
    throw new Error('useAdminPageMeta must be used within AdminPageMetaProvider');
  }
  return context;
}

/** Enregistre titre et/ou segments de breadcrumb pour la page courante. */
export function useSetAdminPageMeta(meta: AdminPageMeta): void {
  const { setPageMeta } = useAdminPageMeta();
  const title = meta.title;
  const breadcrumbTail = meta.breadcrumbTail;
  const tailKey =
    breadcrumbTail?.map((item) => `${item.href ?? ''}:${item.label}`).join('|') ?? '';

  useEffect(() => {
    setPageMeta({
      title,
      breadcrumbTail,
    });
    // Use tailKey for content equality — breadcrumbTail is often a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- breadcrumbTail identity intentionally omitted
  }, [title, tailKey, setPageMeta]);
}
