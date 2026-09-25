import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateAdminSearchResults,
  flattenAdminSearchGroups,
  selectRunnableAdminSearchSources,
  type AdminSearchSourceRun,
} from './aggregate';
import type { AdminSearchSource } from './types';

function makeSource(
  overrides: Partial<AdminSearchSource> &
    Pick<AdminSearchSource, 'id' | 'group' | 'listHref'>,
): AdminSearchSource {
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

test('selectRunnableAdminSearchSources filters by permission and minQueryLength', () => {
  const sources = [
    makeSource({
      id: 'pages',
      group: 'pages',
      listHref: '/dashboard',
      kind: 'local',
      minQueryLength: 0,
    }),
    makeSource({
      id: 'users',
      group: 'users',
      listHref: '/utilisateurs',
      minQueryLength: 2,
    }),
    makeSource({
      id: 'bookings',
      group: 'bookings',
      listHref: '/reservations',
      minQueryLength: 2,
    }),
  ];

  const limited = selectRunnableAdminSearchSources(sources, 'ab', {
    permissions: ['users.read'],
    isSuperAdmin: false,
  });

  assert.deepEqual(
    limited.map((s) => s.id),
    ['pages', 'users'],
  );

  const tooShort = selectRunnableAdminSearchSources(sources, 'a', {
    permissions: ['users.read', 'bookings.read'],
    isSuperAdmin: false,
  });
  assert.deepEqual(
    tooShort.map((s) => s.id),
    ['pages'],
  );
});

test('selectRunnableAdminSearchSources skips disabled sources', () => {
  const sources = [
    makeSource({
      id: 'help',
      group: 'help',
      listHref: '/aide',
      kind: 'local',
      minQueryLength: 0,
      enabled: false,
    }),
  ];
  const runnable = selectRunnableAdminSearchSources(sources, '', {
    permissions: [],
    isSuperAdmin: true,
  });
  assert.equal(runnable.length, 0);
});

test('aggregateAdminSearchResults groups items and keeps partial errors', () => {
  const users = makeSource({
    id: 'users',
    group: 'users',
    listHref: '/utilisateurs',
  });
  const bookings = makeSource({
    id: 'bookings',
    group: 'bookings',
    listHref: '/reservations',
  });
  const pages = makeSource({
    id: 'pages',
    group: 'pages',
    listHref: '/dashboard',
    kind: 'local',
    minQueryLength: 0,
  });

  const runs: AdminSearchSourceRun[] = [
    {
      source: pages,
      result: {
        status: 'fulfilled',
        value: [
          {
            id: 'pages:/dashboard',
            sourceId: 'pages',
            group: 'pages',
            title: 'Dashboard',
            href: '/dashboard',
          },
        ],
      },
    },
    {
      source: users,
      result: {
        status: 'fulfilled',
        value: [
          {
            id: 'users:1',
            sourceId: 'users',
            group: 'users',
            title: 'Ada',
            href: '/utilisateurs/1/voir',
          },
        ],
      },
    },
    {
      source: bookings,
      result: {
        status: 'rejected',
        reason: new Error('boom'),
      },
    },
  ];

  const groups = aggregateAdminSearchResults(runs);
  assert.deepEqual(
    groups.map((g) => g.group),
    ['pages', 'users', 'bookings'],
  );
  assert.equal(groups[0]?.items.length, 1);
  assert.equal(groups[1]?.items[0]?.title, 'Ada');
  assert.equal(groups[2]?.items.length, 0);
  assert.equal(groups[2]?.error, 'boom');

  const flat = flattenAdminSearchGroups(groups);
  assert.equal(flat.length, 2);
  assert.equal(flat[0]?.href, '/dashboard');
});

test('aggregateAdminSearchResults omits empty groups without errors', () => {
  const groups = aggregateAdminSearchResults([]);
  assert.equal(groups.length, 0);
});

test('runAdminSearchFanOut aborts when signal already aborted', async () => {
  const { runAdminSearchFanOut } = await import('./aggregate');
  const controller = new AbortController();
  controller.abort();
  const source = makeSource({
    id: 'pages',
    group: 'pages',
    listHref: '/dashboard',
    kind: 'local',
    minQueryLength: 0,
    search: async () => {
      assert.fail('search should not run when already aborted');
      return [];
    },
  });

  await assert.rejects(
    () =>
      runAdminSearchFanOut([source], '', { permissions: [], isSuperAdmin: true }, {
        signal: controller.signal,
      }),
    (error: unknown) =>
      error instanceof Error && error.name === 'AbortError',
  );
});

test('runAdminSearchFanOut passes signal to searchers', async () => {
  const { runAdminSearchFanOut } = await import('./aggregate');
  const controller = new AbortController();
  let seenSignal: AbortSignal | undefined;
  const source = makeSource({
    id: 'pages',
    group: 'pages',
    listHref: '/dashboard',
    kind: 'local',
    minQueryLength: 0,
    search: async (_query, _context, options) => {
      seenSignal = options?.signal;
      return [];
    },
  });

  await runAdminSearchFanOut(
    [source],
    '',
    { permissions: [], isSuperAdmin: true },
    { signal: controller.signal },
  );
  assert.equal(seenSignal, controller.signal);
});
