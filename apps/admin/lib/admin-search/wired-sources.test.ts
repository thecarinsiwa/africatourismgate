import test from 'node:test';
import assert from 'node:assert/strict';
import { listCatalogAdminSearchSources } from './catalog-sources';
import { listCoreAdminSearchSources } from './core-sources';
import { listAdminSearchSourceDefinitions } from './sources';

test('core and catalog wiring include new search sources', () => {
  const definitions = listAdminSearchSourceDefinitions();
  const coreIds = listCoreAdminSearchSources(definitions).map((s) => s.id);
  const catalogIds = listCatalogAdminSearchSources(definitions).map((s) => s.id);

  assert.ok(coreIds.includes('promotions'));
  assert.ok(coreIds.includes('promoCodes'));
  assert.ok(coreIds.includes('roles'));
  assert.ok(coreIds.includes('employees'));
  assert.ok(coreIds.includes('users'));

  assert.ok(catalogIds.includes('tourGuides'));
  assert.ok(catalogIds.includes('gapPages'));
  assert.ok(catalogIds.includes('gapActivities'));
  assert.ok(catalogIds.includes('destinations'));
  assert.ok(!catalogIds.includes('employees'));

  for (const source of [
    ...listCoreAdminSearchSources(definitions),
    ...listCatalogAdminSearchSources(definitions),
  ]) {
    assert.equal(typeof source.search, 'function');
  }
});
