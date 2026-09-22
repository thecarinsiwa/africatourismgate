import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdminSearchResultId,
  isAdminSearchSourceAllowed,
  listAllowedAdminSearchSources,
  shouldRunAdminSearchSource,
  getAdminSearchSourceDefinition,
} from './sources';

test('shouldRunAdminSearchSource respects minQueryLength', () => {
  assert.equal(shouldRunAdminSearchSource({ minQueryLength: 0 }, ''), true);
  assert.equal(shouldRunAdminSearchSource({ minQueryLength: 0 }, '  x  '), true);
  assert.equal(shouldRunAdminSearchSource({ minQueryLength: 2 }, 'a'), false);
  assert.equal(shouldRunAdminSearchSource({ minQueryLength: 2 }, 'ab'), true);
  assert.equal(shouldRunAdminSearchSource({ minQueryLength: 2 }, '  ab '), true);
});

test('isAdminSearchSourceAllowed uses route permissions', () => {
  const users = { listHref: '/utilisateurs' };
  assert.equal(
    isAdminSearchSourceAllowed(users, {
      permissions: [],
      isSuperAdmin: false,
    }),
    false,
  );
  assert.equal(
    isAdminSearchSourceAllowed(users, {
      permissions: ['users.read'],
      isSuperAdmin: false,
    }),
    true,
  );
  assert.equal(
    isAdminSearchSourceAllowed(users, {
      permissions: [],
      isSuperAdmin: true,
    }),
    true,
  );

  const help = { listHref: '/aide' };
  assert.equal(
    isAdminSearchSourceAllowed(help, {
      permissions: [],
      isSuperAdmin: false,
    }),
    true,
  );
});

test('listAllowedAdminSearchSources hides unauthorized API sources', () => {
  const allowed = listAllowedAdminSearchSources({
    permissions: ['users.read'],
    isSuperAdmin: false,
  });
  const ids = allowed.map((s) => s.id);
  assert.ok(ids.includes('pages'));
  assert.ok(ids.includes('help'));
  assert.ok(ids.includes('users'));
  assert.ok(!ids.includes('bookings'));
  assert.ok(!ids.includes('properties'));
  assert.ok(!ids.includes('activities'));
});

test('buildAdminSearchResultId prefixes source id', () => {
  assert.equal(buildAdminSearchResultId('users', 'abc'), 'users:abc');
});

test('getAdminSearchSourceDefinition returns known sources', () => {
  const users = getAdminSearchSourceDefinition('users');
  assert.ok(users);
  assert.equal(users?.listHref, '/utilisateurs');
  assert.equal(users?.kind, 'api');
  assert.equal(getAdminSearchSourceDefinition('pages')?.kind, 'local');
});
