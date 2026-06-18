import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LISTING_PAGE_SIZE } from './pagination';

test('LISTING_PAGE_SIZE is 10', () => {
  assert.equal(LISTING_PAGE_SIZE, 10);
});
