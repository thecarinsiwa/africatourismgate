import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendDevOriginToNextPath,
  buildDevOAuthReturnUrl,
  readDevOriginFromOAuthNext,
  stripDevOriginFromNextPath,
} from './dev-oauth-return';

test('appendDevOriginToNextPath embeds localhost hint in next', () => {
  const next = appendDevOriginToNextPath(
    '/booking/cart?kind=package&travelers=1',
    'http://localhost:3002',
  );
  assert.equal(
    readDevOriginFromOAuthNext(next),
    'http://localhost:3002',
  );
  assert.equal(stripDevOriginFromNextPath(next).next, '/booking/cart?kind=package&travelers=1');
});

test('buildDevOAuthReturnUrl moves verify flow to localhost', () => {
  const next = appendDevOriginToNextPath('/booking/cart', 'http://localhost:3002');
  const params = new URLSearchParams({
    verificationId: 'abc-123',
    next,
  });
  const url = buildDevOAuthReturnUrl(
    'http://localhost:3002',
    '/booking/verify',
    params,
  );
  assert.equal(
    url,
    'http://localhost:3002/booking/verify?verificationId=abc-123&next=%2Fbooking%2Fcart',
  );
});
