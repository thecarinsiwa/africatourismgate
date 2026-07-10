import { appendDevOriginToNextPath, isLocalDevOrigin } from './dev-oauth-return';
import { getOAuthApiBaseUrl } from './oauth-api-url';

export function buildAdminGoogleRegisterUrl(webOrigin?: string): string {
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
  return `${getOAuthApiBaseUrl()}/auth/google?${params.toString()}`;
}
