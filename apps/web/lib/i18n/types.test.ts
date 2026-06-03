import test from 'node:test';
import assert from 'node:assert/strict';
import { isLocale } from './types';

test('isLocale validates supported locales', () => {
  assert.equal(isLocale('fr'), true);
  assert.equal(isLocale('en'), true);
  assert.equal(isLocale('es'), true);
  assert.equal(isLocale('de'), false);
});
