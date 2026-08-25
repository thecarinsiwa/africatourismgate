import { appendDevOriginToNextPath, isLocalDevOrigin } from './dev-oauth-return';
import { getOAuthApiBaseUrl } from './oauth-api-url';
import { getOrCreateClientInstanceId } from '@africatourismgate/utils';

export function buildAdminGoogleRegisterUrl(
  webOrigin?: string,
  preferredLanguage?: string,
): string {
  const origin = webOrigin?.trim();
  const nextPath = '/register/pending';
  const next =
    origin && isLocalDevOrigin(origin)
      ? appendDevOriginToNextPath(nextPath, origin)
      : nextPath;
  const params = new URLSearchParams({
    next,
    context: 'admin_register',
  });
  if (origin) {
    params.set('web_origin', origin);
  }
  const lang = preferredLanguage?.trim().toLowerCase().slice(0, 2);
  if (lang === 'en' || lang === 'es' || lang === 'fr') {
    params.set('lang', lang);
  }
  const clientInstanceId = getOrCreateClientInstanceId();
  if (clientInstanceId) {
    params.set('client_instance', clientInstanceId);
  }
  return `${getOAuthApiBaseUrl()}/auth/google?${params.toString()}`;
}
