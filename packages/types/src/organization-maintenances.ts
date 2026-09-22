import type { AuditFields } from './index.js';

export const SITE_MAINTENANCE_LOCALES = ['fr', 'en', 'es'] as const;
export type SiteMaintenanceLocale = (typeof SITE_MAINTENANCE_LOCALES)[number];
export const DEFAULT_SITE_MAINTENANCE_LOCALE: SiteMaintenanceLocale = 'fr';

export function normalizeSiteMaintenanceLocale(
  value?: string | null,
): SiteMaintenanceLocale {
  const trimmed = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (
    SITE_MAINTENANCE_LOCALES.includes(trimmed as SiteMaintenanceLocale)
  ) {
    return trimmed as SiteMaintenanceLocale;
  }
  return DEFAULT_SITE_MAINTENANCE_LOCALE;
}

export interface OrganizationMaintenance extends AuditFields {
  id: string;
  organizationId: string;
  locale: SiteMaintenanceLocale;
  title: string | null;
  message: string | null;
  enabled: boolean;
  /** ISO 8601 datetime — fenêtre active à partir de cette date. */
  startsAt: string;
  /** ISO 8601 datetime, or null when no planned end. */
  endsAt: string | null;
}

export interface CreateOrganizationMaintenanceRequest {
  organizationId?: string;
  locale?: SiteMaintenanceLocale;
  title?: string | null;
  message?: string | null;
  enabled?: boolean;
  startsAt: string;
  endsAt?: string | null;
}

export type UpdateOrganizationMaintenanceRequest =
  Partial<CreateOrganizationMaintenanceRequest>;

export interface OrganizationMaintenancesListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
  locale?: SiteMaintenanceLocale;
}

/**
 * Payload public pour le middleware / page maintenance.
 * Compatible avec l’ancien setting EAV `site` / `maintenance`.
 */
export interface PublicSiteMaintenance {
  enabled: boolean;
  locale: SiteMaintenanceLocale | null;
  title: string | null;
  message: string | null;
  /** ISO 8601 — début de fenêtre (optionnel pour compat legacy). */
  startsAt: string | null;
  endsAt: string | null;
}

export const DEFAULT_SITE_MAINTENANCE: PublicSiteMaintenance = {
  enabled: false,
  locale: null,
  title: null,
  message: null,
  startsAt: null,
  endsAt: null,
};

/** Ancien shape EAV (sans startsAt). */
export interface SiteMaintenanceSettingValue {
  enabled: boolean;
  locale?: string | null;
  title?: string;
  message?: string;
  endsAt?: string | null;
  startsAt?: string | null;
}

function parseIsoOrNull(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  const parsed = Date.parse(value.trim());
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString();
}

export function normalizeSiteMaintenance(
  value?: Partial<SiteMaintenanceSettingValue> | null,
): PublicSiteMaintenance {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_SITE_MAINTENANCE };
  }

  const enabled = value.enabled === true;
  const title =
    typeof value.title === 'string' && value.title.trim()
      ? value.title.trim()
      : null;
  const message =
    typeof value.message === 'string' && value.message.trim()
      ? value.message.trim()
      : null;

  return {
    enabled,
    locale: value.locale
      ? normalizeSiteMaintenanceLocale(value.locale)
      : null,
    title,
    message,
    startsAt: parseIsoOrNull(value.startsAt),
    endsAt: parseIsoOrNull(value.endsAt),
  };
}

/**
 * True when maintenance is enabled, `startsAt` has been reached (or unset),
 * and optional `endsAt` is still in the future (or unset).
 */
export function isSiteMaintenanceActive(
  maintenance: PublicSiteMaintenance = DEFAULT_SITE_MAINTENANCE,
  now: Date = new Date(),
): boolean {
  if (!maintenance.enabled) {
    return false;
  }

  const nowMs = now.getTime();

  if (maintenance.startsAt != null) {
    const startMs = Date.parse(maintenance.startsAt);
    if (!Number.isNaN(startMs) && startMs > nowMs) {
      return false;
    }
  }

  if (maintenance.endsAt == null) {
    return true;
  }
  const endMs = Date.parse(maintenance.endsAt);
  if (Number.isNaN(endMs)) {
    return true;
  }
  return endMs > nowMs;
}

export function toPublicSiteMaintenanceFromRow(row: {
  enabled: boolean;
  locale?: string | null;
  title: string | null;
  message: string | null;
  startsAt: Date | string;
  endsAt: Date | string | null;
}): PublicSiteMaintenance {
  const startsAt =
    row.startsAt instanceof Date
      ? row.startsAt.toISOString()
      : parseIsoOrNull(row.startsAt);
  const endsAt =
    row.endsAt == null
      ? null
      : row.endsAt instanceof Date
        ? row.endsAt.toISOString()
        : parseIsoOrNull(row.endsAt);

  return {
    enabled: Boolean(row.enabled),
    locale: row.locale
      ? normalizeSiteMaintenanceLocale(row.locale)
      : null,
    title: row.title?.trim() ? row.title.trim() : null,
    message: row.message?.trim() ? row.message.trim() : null,
    startsAt,
    endsAt,
  };
}
