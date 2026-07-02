export type OAuthState = {
  next: string;
  webOrigin?: string;
};

export function encodeOAuthState(next: string, webOrigin?: string): string {
  const safeNext = normalizeOAuthNext(next);
  if (!webOrigin?.trim()) {
    return safeNext;
  }
  const payload: OAuthState = { next: safeNext, webOrigin: webOrigin.trim() };
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
        next: normalizeOAuthNext(parsed.next),
        webOrigin:
          typeof parsed.webOrigin === 'string' ? parsed.webOrigin.trim() : undefined,
      };
    }
  } catch {
    // Plain path state (legacy).
  }

  return { next: normalizeOAuthNext(state) };
}

function normalizeOAuthNext(next: string | undefined): string {
  if (!next?.trim()) return '/booking/cart';
  if (!next.startsWith('/')) return '/booking/cart';
  if (next.startsWith('//')) return '/booking/cart';
  return next;
}
