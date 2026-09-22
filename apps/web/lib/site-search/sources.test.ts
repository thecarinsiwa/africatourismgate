import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SITE_SEARCH_GROUP_ORDER,
  SITE_SEARCH_SOURCE_DEFINITIONS,
  buildSiteSearchResultId,
  getSiteSearchSourceDefinition,
  listSiteSearchSourceDefinitions,
  shouldRunSiteSearchSource,
} from './sources';
import {
  SITE_SEARCH_API_MIN_QUERY_LENGTH,
  SITE_SEARCH_DEFAULT_RESULT_LIMIT,
} from './types';

test('shouldRunSiteSearchSource respects minQueryLength', () => {
  assert.equal(shouldRunSiteSearchSource({ minQueryLength: 0 }, ''), true);
  assert.equal(shouldRunSiteSearchSource({ minQueryLength: 0 }, '  x  '), true);
  assert.equal(shouldRunSiteSearchSource({ minQueryLength: 2 }, 'a'), false);
  assert.equal(shouldRunSiteSearchSource({ minQueryLength: 2 }, 'ab'), true);
  assert.equal(shouldRunSiteSearchSource({ minQueryLength: 2 }, '  ab '), true);
});

test('buildSiteSearchResultId prefixes source id', () => {
  assert.equal(buildSiteSearchResultId('hotels', 'abc'), 'hotels:abc');
  assert.equal(buildSiteSearchResultId('pages', '/'), 'pages:/');
});

test('getSiteSearchSourceDefinition returns known sources', () => {
  const hotels = getSiteSearchSourceDefinition('hotels');
  assert.ok(hotels);
  assert.equal(hotels?.kind, 'api');
  assert.equal(hotels?.group, 'hotels');
  assert.equal(hotels?.minQueryLength, SITE_SEARCH_API_MIN_QUERY_LENGTH);
  assert.equal(hotels?.resultLimit, SITE_SEARCH_DEFAULT_RESULT_LIMIT);

  assert.equal(getSiteSearchSourceDefinition('pages')?.kind, 'local');
  assert.equal(getSiteSearchSourceDefinition('destinations')?.kind, 'reference');
  assert.equal(getSiteSearchSourceDefinition('flights')?.kind, 'api');
  assert.equal(getSiteSearchSourceDefinition('cars')?.kind, 'api');
  assert.equal(getSiteSearchSourceDefinition('cruises')?.kind, 'api');
});

test('listSiteSearchSourceDefinitions returns enabled sources by default', () => {
  const enabled = listSiteSearchSourceDefinitions();
  assert.equal(enabled.length, SITE_SEARCH_SOURCE_DEFINITIONS.length);
  assert.ok(enabled.every((source) => source.enabled));

  const ids = enabled.map((s) => s.id);
  assert.ok(ids.includes('pages'));
  assert.ok(ids.includes('help'));
  assert.ok(ids.includes('destinations'));
  assert.ok(ids.includes('hotels'));
  assert.ok(ids.includes('activities'));
  assert.ok(ids.includes('packages'));
  assert.ok(ids.includes('cruises'));
  assert.ok(ids.includes('flights'));
  assert.ok(ids.includes('cars'));
  assert.ok(ids.includes('blog'));
});

test('SITE_SEARCH_GROUP_ORDER covers every source group', () => {
  const groups = new Set(
    SITE_SEARCH_SOURCE_DEFINITIONS.map((source) => source.group),
  );
  for (const group of groups) {
    assert.ok(
      SITE_SEARCH_GROUP_ORDER.includes(group),
      `missing group in order: ${group}`,
    );
  }
  assert.equal(SITE_SEARCH_GROUP_ORDER[0], 'pages');
  assert.equal(SITE_SEARCH_GROUP_ORDER.at(-1), 'help');
});

test('local sources run with empty query; api/reference need threshold', () => {
  const pages = getSiteSearchSourceDefinition('pages')!;
  const help = getSiteSearchSourceDefinition('help')!;
  const destinations = getSiteSearchSourceDefinition('destinations')!;
  const hotels = getSiteSearchSourceDefinition('hotels')!;
  const flights = getSiteSearchSourceDefinition('flights')!;

  assert.equal(shouldRunSiteSearchSource(pages, ''), true);
  assert.equal(shouldRunSiteSearchSource(help, ''), true);
  assert.equal(shouldRunSiteSearchSource(destinations, ''), true);
  assert.equal(shouldRunSiteSearchSource(hotels, ''), false);
  assert.equal(shouldRunSiteSearchSource(flights, 'a'), false);
  assert.equal(shouldRunSiteSearchSource(flights, 'ab'), true);
});
