import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  getNavLabelKeyForSectionPath,
  sectionPathToI18nKey,
} from '../placeholder-section-i18n';

export type AdminPageMessages = {
  title: string;
  description?: string;
  metaTitle?: string;
};

type IntlTranslator = {
  (key: string): string;
  has?: (key: string) => boolean;
};

type NavLinksTranslator = {
  (key: `links.${string}`): string;
};

function hasTranslation(t: IntlTranslator, key: string): boolean {
  return typeof t.has === 'function' ? t.has(key) : false;
}

/** `utilisateurs/employes/nouveau` → `utilisateurs.employes.nouveau` */
export function routePathToPageKey(routePath: string): string {
  return sectionPathToI18nKey(routePath.replace(/^\//, ''));
}

/** `utilisateurs/[id]` → `pages.utilisateurs.id` */
export function routePathToTranslationNamespace(routePath: string): string {
  const key = routePath
    .replace(/^\//, '')
    .split('/')
    .map((segment) => segment.replace(/^\[|\]$/g, ''))
    .filter(Boolean)
    .join('.');

  return key ? `pages.${key}` : 'pages';
}

function resolveNavTitle(routePath: string, tNav?: NavLinksTranslator): string | undefined {
  if (!tNav) {
    return undefined;
  }

  const normalized = routePath.replace(/^\//, '').replace(/\/$/, '');
  const labelKey = getNavLabelKeyForSectionPath(normalized);
  if (!labelKey) {
    return undefined;
  }

  return tNav(`links.${labelKey}`);
}

export function getAdminPageMessages({
  routePath,
  tPage,
  tNav,
}: {
  routePath: string;
  tPage: IntlTranslator;
  tNav?: NavLinksTranslator;
}): AdminPageMessages {
  const metaTitle = hasTranslation(tPage, 'metaTitle') ? tPage('metaTitle') : undefined;
  const title =
    (hasTranslation(tPage, 'title') ? tPage('title') : undefined) ??
    resolveNavTitle(routePath, tNav) ??
    metaTitle ??
    '';

  const description = hasTranslation(tPage, 'description') ? tPage('description') : undefined;

  return {
    title,
    ...(description ? { description } : {}),
    ...(metaTitle ? { metaTitle } : {}),
  };
}

export async function getAdminPageMetadata(routePath: string): Promise<Metadata> {
  const namespace = routePathToTranslationNamespace(routePath);
  const tPage = await getTranslations(namespace);
  const tNav = await getTranslations('nav');
  const messages = getAdminPageMessages({ routePath, tPage, tNav });

  const title = messages.metaTitle ?? messages.title;

  return {
    title,
    ...(messages.description ? { description: messages.description } : {}),
  };
}
