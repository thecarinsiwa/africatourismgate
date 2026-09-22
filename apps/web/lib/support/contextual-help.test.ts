import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getWebContextualHelpHref,
  getWebContextualHelpRules,
  resolveWebContextualHelp,
} from './contextual-help';
import { SUPPORT_BASE_PATH } from './routes';

test('resolveWebContextualHelp maps account reservations to find-booking', () => {
  const target = resolveWebContextualHelp('/account/reservations');
  assert.deepEqual(target, {
    categorySlug: 'booking',
    articleSlug: 'find-booking',
  });
  assert.equal(
    resolveWebContextualHelp('/account/reservations/abc-123')?.articleSlug,
    'find-booking',
  );
});

test('resolveWebContextualHelp maps booking cart and profile', () => {
  assert.equal(
    resolveWebContextualHelp('/booking/cart')?.articleSlug,
    'cart-and-checkout',
  );
  assert.equal(
    resolveWebContextualHelp('/account/profile')?.articleSlug,
    'update-profile',
  );
});

test('resolveWebContextualHelp prefers longest prefix', () => {
  assert.equal(
    resolveWebContextualHelp('/account/payment-methods')?.articleSlug,
    'saved-cards',
  );
  assert.equal(
    resolveWebContextualHelp('/account')?.articleSlug,
    'update-profile',
  );
});

test('resolveWebContextualHelp returns null on support hub', () => {
  assert.equal(resolveWebContextualHelp('/support'), null);
  assert.equal(resolveWebContextualHelp('/support/booking'), null);
  assert.equal(resolveWebContextualHelp('/hotels'), null);
});

test('getWebContextualHelpHref falls back to hub', () => {
  assert.equal(getWebContextualHelpHref('/support'), SUPPORT_BASE_PATH);
  assert.equal(getWebContextualHelpHref('/unknown-page'), SUPPORT_BASE_PATH);
  assert.equal(
    getWebContextualHelpHref('/booking/cart'),
    '/support/booking/cart-and-checkout',
  );
});

test('getWebContextualHelpRules expose non-empty prefixes', () => {
  const rules = getWebContextualHelpRules();
  assert.ok(rules.length >= 6);
  assert.ok(rules.every((rule) => rule.prefix.startsWith('/')));
});
