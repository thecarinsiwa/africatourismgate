export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export {
  ensureHttpsAssetUrl,
  getAdminAppUrl,
  getAdminLoginUrl,
  getApiPublicOrigin,
  getPublicWebUrl,
  normalizeBrandingAssetUrl,
} from './urls';

export {
  getOrCreateClientInstanceId,
  withClientInstanceId,
} from './client-instance';
