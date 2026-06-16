import {
  adminBreadcrumbExtraRoutes,
  adminDashboardNavConfig,
} from '../config/dashboard-nav.config';

export type PlaceholderSectionMessages = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  ctaLabel?: string;
};

type IntlTranslator = {
  (key: string): string;
  has?: (key: string) => boolean;
};

type NavLinksTranslator = {
  (key: `links.${string}`): string;
};

const HREF_TO_NAV_LABEL_KEY = buildHrefToNavLabelKeyMap();

function buildHrefToNavLabelKeyMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const entry of adminDashboardNavConfig) {
    if (entry.type === 'link') {
      map.set(entry.href, entry.labelKey);
    } else {
      for (const child of entry.children) {
        map.set(child.href, child.labelKey);
      }
    }
  }

  for (const route of adminBreadcrumbExtraRoutes) {
    map.set(route.href, route.labelKey);
  }

  return map;
}

/** `contenu/messages` → `contenu.messages` (clé relative à `placeholderSections`). */
export function sectionPathToI18nKey(sectionPath: string): string {
  return sectionPath
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('.');
}

/** Clé `nav.links.*` associée au chemin section (ex. `supportMessages` pour `contenu/messages`). */
export function getNavLabelKeyForSectionPath(sectionPath: string): string | undefined {
  const normalized = sectionPath.replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return undefined;
  }
  return HREF_TO_NAV_LABEL_KEY.get(`/${normalized}`);
}

function hasTranslation(t: IntlTranslator, key: string): boolean {
  return typeof t.has === 'function' ? t.has(key) : false;
}

function pickField(
  t: IntlTranslator,
  sectionI18nKey: string,
  field: keyof PlaceholderSectionMessages,
): string | undefined {
  if (sectionI18nKey === 'default') {
    return undefined;
  }
  const key = `${sectionI18nKey}.${field}`;
  return hasTranslation(t, key) ? t(key) : undefined;
}

/**
 * Résout les textes d'une page placeholder :
 * 1. clés `placeholderSections.{sectionPath}` si présentes
 * 2. titre : `nav.links.*` selon la nav
 * 3. fallback `placeholderSections.default.*`
 */
export function getPlaceholderSectionMessages({
  sectionPath,
  tPlaceholder,
  tNav,
}: {
  sectionPath: string;
  tPlaceholder: IntlTranslator;
  tNav?: NavLinksTranslator;
}): PlaceholderSectionMessages {
  const sectionI18nKey = sectionPathToI18nKey(sectionPath) || 'default';

  const title =
    pickField(tPlaceholder, sectionI18nKey, 'title') ??
    resolveNavTitle(sectionPath, tNav) ??
    tPlaceholder('default.title');

  const description =
    pickField(tPlaceholder, sectionI18nKey, 'description') ?? tPlaceholder('default.description');

  const emptyTitle =
    pickField(tPlaceholder, sectionI18nKey, 'emptyTitle') ?? tPlaceholder('default.emptyTitle');

  const emptyDescription =
    pickField(tPlaceholder, sectionI18nKey, 'emptyDescription') ??
    tPlaceholder('default.emptyDescription');

  const ctaLabel = pickField(tPlaceholder, sectionI18nKey, 'ctaLabel');

  return {
    title,
    description,
    emptyTitle,
    emptyDescription,
    ...(ctaLabel ? { ctaLabel } : {}),
  };
}

function resolveNavTitle(sectionPath: string, tNav?: NavLinksTranslator): string | undefined {
  if (!tNav) {
    return undefined;
  }
  const labelKey = getNavLabelKeyForSectionPath(sectionPath);
  if (!labelKey) {
    return undefined;
  }
  return tNav(`links.${labelKey}`);
}
