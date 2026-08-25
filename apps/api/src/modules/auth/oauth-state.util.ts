export type OAuthContext = 'admin_register' | 'web';

export type OAuthState = {
  next: string;
  webOrigin?: string;
  context?: OAuthContext;
  preferredLanguage?: string;
  clientInstanceId?: string;
};

export function encodeOAuthState(
  next: string,
  webOrigin?: string,
  context?: OAuthContext,
  preferredLanguage?: string,
  clientInstanceId?: string,
): string {
  const safeNext = normalizeOAuthNext(next, context);
  const payload: OAuthState = { next: safeNext };
  if (webOrigin?.trim()) {
    payload.webOrigin = webOrigin.trim();
  }
  if (context) {
    payload.context = context;
  }
  const lang = preferredLanguage?.trim().toLowerCase().slice(0, 2);
  if (lang === 'en' || lang === 'es' || lang === 'fr') {
    payload.preferredLanguage = lang;
  }
  const instanceId = clientInstanceId?.trim();
  if (instanceId) {
    payload.clientInstanceId = instanceId;
  }
  if (
    !payload.webOrigin &&
    !payload.context &&
    !payload.preferredLanguage &&
    !payload.clientInstanceId
  ) {
    return safeNext;
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeOAuthState(state: string | undefined): OAuthState {
  if (!state?.trim()) {
    return { next: '/booking/cart' };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    ) as Partial<OAuthState>;
    if (parsed && typeof parsed.next === 'string') {
      return {
        next: normalizeOAuthNext(parsed.next, parsed.context),
        webOrigin:
          typeof parsed.webOrigin === 'string' ? parsed.webOrigin.trim() : undefined,
        context:
          parsed.context === 'admin_register' || parsed.context === 'web'
            ? parsed.context
            : undefined,
        preferredLanguage:
          parsed.preferredLanguage === 'en' ||
          parsed.preferredLanguage === 'es' ||
          parsed.preferredLanguage === 'fr'
            ? parsed.preferredLanguage
            : undefined,
        clientInstanceId:
          typeof parsed.clientInstanceId === 'string'
            ? parsed.clientInstanceId.trim() || undefined
            : undefined,
      };
    }
  } catch {
    // Plain path state (legacy).
  }

  return { next: normalizeOAuthNext(state) };
}

function normalizeOAuthNext(
  next: string | undefined,
  context?: OAuthContext,
): string {
  const fallback =
    context === 'admin_register' ? '/register/pending' : '/booking/cart';
  if (!next?.trim()) return fallback;
  if (!next.startsWith('/')) return fallback;
  if (next.startsWith('//')) return fallback;
  return next;
}
