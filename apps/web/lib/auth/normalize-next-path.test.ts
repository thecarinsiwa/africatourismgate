import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  DEFAULT_NEXT_PATH,
  normalizeNextPath,
} from './normalize-next-path';

describe('normalizeNextPath', () => {
  test('falls back for empty values', () => {
    assert.equal(normalizeNextPath(undefined), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath(null), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath(''), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('   '), DEFAULT_NEXT_PATH);
  });

  test('accepts allowlisted paths with query and hash', () => {
    assert.equal(normalizeNextPath('/booking/cart'), '/booking/cart');
    assert.equal(
      normalizeNextPath('/booking/cart?kind=cabin&sailingId=abc'),
      '/booking/cart?kind=cabin&sailingId=abc',
    );
    assert.equal(
      normalizeNextPath('/packages/00000000-0000-4000-8000-000000005001#configure'),
      '/packages/00000000-0000-4000-8000-000000005001#configure',
    );
    assert.equal(normalizeNextPath('/account'), '/account');
    assert.equal(normalizeNextPath('/'), '/');
    assert.equal(normalizeNextPath('/hotels/'), '/hotels');
  });

  test('rejects open redirects and absolute URLs', () => {
    assert.equal(normalizeNextPath('//evil.com'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('https://evil.com'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('http://evil.com/path'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('/\\evil.com'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('/booking/../account'), DEFAULT_NEXT_PATH);
  });

  test('rejects paths outside the allowlist', () => {
    assert.equal(normalizeNextPath('/admin'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('/api/secret'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('/unknown/page'), DEFAULT_NEXT_PATH);
  });

  test('rejects javascript hash and odd path characters', () => {
    assert.equal(
      normalizeNextPath('/booking/cart#javascript:alert(1)'),
      DEFAULT_NEXT_PATH,
    );
    assert.equal(normalizeNextPath('/booking/<script>'), DEFAULT_NEXT_PATH);
    assert.equal(normalizeNextPath('/booking/cart%00'), DEFAULT_NEXT_PATH);
  });
});
