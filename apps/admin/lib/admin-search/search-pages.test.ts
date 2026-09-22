import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesAdminNavSearchItem } from './nav-match';
import { searchAdminPages } from './search-pages-query';

test('matchesAdminNavSearchItem matches label and href', () => {
  const item = { href: '/utilisateurs', label: 'Utilisateurs' };
  assert.equal(matchesAdminNavSearchItem(item, ''), true);
  assert.equal(matchesAdminNavSearchItem(item, 'util'), true);
  assert.equal(matchesAdminNavSearchItem(item, '/utilisateurs'), true);
  assert.equal(matchesAdminNavSearchItem(item, 'xyz'), false);
});

test('matchesAdminNavSearchItem matches help aliases on /aide', () => {
  const help = { href: '/aide', label: 'Centre d’aide' };
  assert.equal(matchesAdminNavSearchItem(help, 'he'), true);
  assert.equal(matchesAdminNavSearchItem(help, 'docs'), true);
  assert.equal(matchesAdminNavSearchItem(help, 'x'), false);
});

test('searchAdminPages maps nav items to results with limit', async () => {
  const items = await searchAdminPages(
    'dash',
    {
      permissions: [],
      isSuperAdmin: true,
      navItems: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/utilisateurs', label: 'Utilisateurs' },
      ],
    },
    { resultLimit: 1 },
  );

  assert.equal(items.length, 1);
  assert.equal(items[0]?.href, '/dashboard');
  assert.equal(items[0]?.sourceId, 'pages');
  assert.equal(items[0]?.group, 'pages');
  assert.equal(items[0]?.id, 'pages:/dashboard');
});

test('searchAdminPages returns empty without navItems', async () => {
  const items = await searchAdminPages('anything', {
    permissions: [],
    isSuperAdmin: true,
  });
  assert.equal(items.length, 0);
});
