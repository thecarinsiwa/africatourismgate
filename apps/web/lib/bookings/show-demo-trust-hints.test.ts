import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowDemoTrustHints } from './show-demo-trust-hints';

test('shouldShowDemoTrustHints is true in development', () => {
  assert.equal(
    shouldShowDemoTrustHints({ NODE_ENV: 'development' }),
    true,
  );
});

test('shouldShowDemoTrustHints is false in production without flag', () => {
  assert.equal(
    shouldShowDemoTrustHints({ NODE_ENV: 'production' }),
    false,
  );
  assert.equal(
    shouldShowDemoTrustHints({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS: 'false',
    }),
    false,
  );
});

test('shouldShowDemoTrustHints is true when flag is explicitly true', () => {
  assert.equal(
    shouldShowDemoTrustHints({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS: 'true',
    }),
    true,
  );
  assert.equal(
    shouldShowDemoTrustHints({
      NODE_ENV: 'test',
      NEXT_PUBLIC_SHOW_DEMO_TRUST_HINTS: 'true',
    }),
    true,
  );
});
