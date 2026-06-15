'use client';

import type { AdminPageMeta } from './admin-page-meta-context';
import { useSetAdminPageMeta } from './admin-page-meta-context';

/** Déclare titre / breadcrumb depuis une page serveur (sans rendu). */
export function SetAdminPageMeta(props: AdminPageMeta) {
  useSetAdminPageMeta(props);
  return null;
}
