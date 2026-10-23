import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasNonEmptySearchParams, NOINDEX_FOLLOW_ROBOTS } from './metadata';

describe('hasNonEmptySearchParams', () => {
  it('returns false for empty search params', () => {
    assert.equal(hasNonEmptySearchParams({}), false);
  });

  it('returns false for blank string values', () => {
    assert.equal(hasNonEmptySearchParams({ destination: '  ', date: '' }), false);
  });

  it('returns true when destination is present', () => {
    assert.equal(hasNonEmptySearchParams({ destination: 'Rwanda' }), true);
  });

  it('returns true for array values with content', () => {
    assert.equal(hasNonEmptySearchParams({ tag: ['', 'safari'] }), true);
  });
});

describe('NOINDEX_FOLLOW_ROBOTS', () => {
  it('sets noindex while still following links', () => {
    assert.equal(NOINDEX_FOLLOW_ROBOTS.index, false);
    assert.equal(NOINDEX_FOLLOW_ROBOTS.follow, true);
  });
});
