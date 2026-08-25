import test from 'node:test';
import assert from 'node:assert/strict';
import { isProxiedDevApiUrl, getOAuthApiBaseUrl } from './oauth-api-url';

test('isProxiedDevApiUrl detects proxied dev API URL', () => {
  assert.equal(isProxiedDevApiUrl('http://localhost:3002/api'), true);
  assert.equal(isProxiedDevApiUrl('http://localhost:3010/api'), false);
  assert.equal(
    isProxiedDevApiUrl('https://app-africatourismgate.org/api'),
    false,
  );
});

test('getOAuthApiBaseUrl uses remote API host for OAuth when proxied', () => {
  const prev = process.env.NEXT_PUBLIC_API_URL;
  const prevRemote = process.env.ATG_REMOTE_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3002/api';
  process.env.ATG_REMOTE_API_URL = 'https://app-africatourismgate.org/api';
  assert.equal(
    getOAuthApiBaseUrl(),
    'https://app-africatourismgate.org/api',
  );
  process.env.NEXT_PUBLIC_API_URL = prev;
  process.env.ATG_REMOTE_API_URL = prevRemote;
});
