import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_SEARCH_SOURCE_DEFINITIONS } from './sources';
import { listWiredSiteSearchSources } from './wired-sources';

test('listWiredSiteSearchSources attaches a searcher for every enabled source', () => {
  const wired = listWiredSiteSearchSources();
  assert.equal(wired.length, SITE_SEARCH_SOURCE_DEFINITIONS.length);
  for (const source of wired) {
    assert.equal(typeof source.search, 'function');
    assert.equal(source.enabled, true);
  }
  const ids = wired.map((source) => source.id);
  assert.ok(ids.includes('pages'));
  assert.ok(ids.includes('hotels'));
  assert.ok(ids.includes('blog'));
  assert.ok(ids.includes('flights'));
});
