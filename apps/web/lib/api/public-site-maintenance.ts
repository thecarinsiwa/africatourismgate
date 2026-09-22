import {
  DEFAULT_SITE_MAINTENANCE,
  normalizeSiteMaintenance,
  type PublicSiteMaintenance,
  type SiteMaintenanceSettingValue,
} from '@africatourismgate/types/organization-settings';

const defaultApiUrl = 'http://localhost:3000/api';

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

/** Fetch public site maintenance settings (fail-open → defaults). */
export async function getPublicSiteMaintenance(
  init?: RequestInit,
): Promise<PublicSiteMaintenance> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/public/organization-maintenances/current`,
      {
        cache: 'no-store',
        ...init,
      },
    );
    if (!response.ok) {
      return { ...DEFAULT_SITE_MAINTENANCE };
    }
    const raw = (await response.json()) as SiteMaintenanceSettingValue;
    return normalizeSiteMaintenance(raw);
  } catch {
    return { ...DEFAULT_SITE_MAINTENANCE };
  }
}

export { getApiBaseUrl as getPublicApiBaseUrl };
