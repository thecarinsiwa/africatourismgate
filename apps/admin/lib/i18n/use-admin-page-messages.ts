'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { getAdminPageMessages, routePathToTranslationNamespace } from './admin-page-i18n';

export function useAdminPageMessages(routePath: string) {
  const namespace = routePathToTranslationNamespace(routePath);
  const tPage = useTranslations(namespace);
  const tNav = useTranslations('nav');

  return useMemo(
    () =>
      getAdminPageMessages({
        routePath,
        tPage: (key) => tPage(key),
        tNav: (key) => tNav(key),
      }),
    [routePath, tPage, tNav],
  );
}
