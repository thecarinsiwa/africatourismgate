import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateSiteSearchResults,
  flattenSiteSearchGroups,
  runSiteSearchFanOut,
  selectRunnableSiteSearchSources,
  type SiteSearchSourceRun,
} from './aggregate';
import type { SiteSearchSource } from './types';

function makeSource(
  overrides: Partial<SiteSearchSource> &
    Pick<SiteSearchSource, 'id' | 'group'>,
): SiteSearchSource {
  return {
    labelKey: overrides.id,
    kind: 'api',
    minQueryLength: 2,
    resultLimit: 5,
    enabled: true,
    search: async () => [],
    ...overrides,
  };
}

test('selectRunnableSiteSearchSources filters by minQueryLength', () => {
  const sources = [
    makeSource({
      id: 'pages',
      group: 'pages',
      kind: 'local',
      minQueryLength: 0,
    }),
    makeSource({
      id: 'hotels',
      group: 'hotels',
      minQueryLength: 2,
    }),
    makeSource({
      id: 'blog',
      group: 'blog',
      minQueryLength: 2,
    }),
  ];

  const runnable = selectRunnableSiteSearchSources(sources, 'ab');
  assert.deepEqual(
    runnable.map((s) => s.id),
    ['pages', 'hotels', 'blog'],
  );

  const tooShort = selectRunnableSiteSearchSources(sources, 'a');
  assert.deepEqual(
    tooShort.map((s) => s.id),
    ['pages'],
  );
});

test('selectRunnableSiteSearchSources skips disabled sources', () => {
  const sources = [
    makeSource({
      id: 'help',
      group: 'help',
      kind: 'local',
      minQueryLength: 0,
      enabled: false,
    }),
  ];
  const runnable = selectRunnableSiteSearchSources(sources, '');
  assert.equal(runnable.length, 0);
});

test('aggregateSiteSearchResults groups items and keeps partial errors', () => {
  const pages = makeSource({
    id: 'pages',
    group: 'pages',
    kind: 'local',
    minQueryLength: 0,
  });
  const hotels = makeSource({
    id: 'hotels',
    group: 'hotels',
  });
  const blog = makeSource({
    id: 'blog',
    group: 'blog',
  });

  const runs: SiteSearchSourceRun[] = [
    {
      source: pages,
      result: {
        status: 'fulfilled',
        value: [
          {
            id: 'pages:/',
            sourceId: 'pages',
            group: 'pages',
            title: 'Accueil',
            href: '/',
            kind: 'entity',
          },
        ],
      },
    },
    {
      source: hotels,
      result: {
        status: 'fulfilled',
        value: [
          {
            id: 'hotels:1',
            sourceId: 'hotels',
            group: 'hotels',
            title: 'Savanna Lodge',
            href: '/hotels/1',
            kind: 'entity',
          },
        ],
      },
    },
    {
      source: blog,
      result: {
        status: 'rejected',
        reason: new Error('boom'),
      },
    },
  ];

  const groups = aggregateSiteSearchResults(runs);
  assert.deepEqual(
    groups.map((g) => g.group),
    ['pages', 'hotels', 'blog'],
  );
  assert.equal(groups[0]?.items.length, 1);
  assert.equal(groups[1]?.items[0]?.title, 'Savanna Lodge');
  assert.equal(groups[2]?.items.length, 0);
  assert.equal(groups[2]?.error, 'boom');

  const flat = flattenSiteSearchGroups(groups);
  assert.equal(flat.length, 2);
  assert.equal(flat[0]?.href, '/');
});

test('aggregateSiteSearchResults omits empty groups without errors', () => {
  const groups = aggregateSiteSearchResults([]);
  assert.equal(groups.length, 0);
});

test('aggregateSiteSearchResults keeps first error only', () => {
  const cruises = makeSource({ id: 'cruises', group: 'cruises', kind: 'reference' });
  const runs: SiteSearchSourceRun[] = [
    {
      source: cruises,
      result: { status: 'rejected', reason: new Error('first') },
    },
    {
      source: cruises,
      result: { status: 'rejected', reason: new Error('second') },
    },
  ];
  const groups = aggregateSiteSearchResults(runs);
  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.error, 'first');
});

test('runSiteSearchFanOut settles all runnable sources', async () => {
  const sources = [
    makeSource({
      id: 'pages',
      group: 'pages',
      kind: 'local',
      minQueryLength: 0,
      search: async () => [
        {
          id: 'pages:/blog',
          sourceId: 'pages',
          group: 'pages',
          title: 'Blog',
          href: '/blog',
          kind: 'entity',
        },
      ],
    }),
    makeSource({
      id: 'hotels',
      group: 'hotels',
      search: async () => {
        throw new Error('api down');
      },
    }),
  ];

  const runs = await runSiteSearchFanOut(sources, 'ho');
  assert.equal(runs.length, 2);
  assert.equal(runs[0]?.result.status, 'fulfilled');
  assert.equal(runs[1]?.result.status, 'rejected');

  const groups = aggregateSiteSearchResults(runs);
  assert.equal(groups[0]?.items[0]?.title, 'Blog');
  assert.equal(groups[1]?.error, 'api down');
});
