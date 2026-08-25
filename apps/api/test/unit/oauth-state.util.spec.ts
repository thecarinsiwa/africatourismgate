import {
  decodeOAuthState,
  encodeOAuthState,
} from '../../src/modules/auth/oauth-state.util';

describe('oauth-state.util', () => {
  it('encodeOAuthState includes clientInstanceId in payload', () => {
    const state = encodeOAuthState(
      '/dashboard',
      undefined,
      'admin_register',
      'fr',
      'client-instance-abc',
    );

    expect(decodeOAuthState(state)).toEqual({
      next: '/dashboard',
      context: 'admin_register',
      preferredLanguage: 'fr',
      clientInstanceId: 'client-instance-abc',
    });
  });

  it('encodeOAuthState omits empty clientInstanceId', () => {
    const state = encodeOAuthState('/booking/cart', undefined, 'web', 'en', '  ');
    const decoded = decodeOAuthState(state);

    expect(decoded.clientInstanceId).toBeUndefined();
    expect(decoded.next).toBe('/booking/cart');
    expect(decoded.context).toBe('web');
  });

  it('decodeOAuthState returns clientInstanceId from legacy plain path', () => {
    expect(decodeOAuthState('/account')).toEqual({ next: '/account' });
  });

  it('round-trips web OAuth state with clientInstanceId', () => {
    const instanceId = '550e8400-e29b-41d4-a716-446655440000';
    const encoded = encodeOAuthState(
      '/account',
      'http://localhost:3002',
      'web',
      'es',
      instanceId,
    );

    expect(decodeOAuthState(encoded)).toEqual({
      next: '/account',
      webOrigin: 'http://localhost:3002',
      context: 'web',
      preferredLanguage: 'es',
      clientInstanceId: instanceId,
    });
  });
});
