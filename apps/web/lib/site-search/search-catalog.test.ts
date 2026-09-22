import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearSiteSearchCatalogInflightCache,
  mapSiteSearchCatalogHitToResultItem,
} from './search-catalog';

test('mapSiteSearchCatalogHitToResultItem builds entity items', () => {
  const item = mapSiteSearchCatalogHitToResultItem({
    type: 'hotels',
    id: 'hotel-1',
    title: 'Savanna Lodge',
    subtitle: 'Kinshasa · CD',
    href: '/hotels/hotel-1',
    imageUrl: null,
    score: 100,
  });

  assert.equal(item.id, 'hotels:hotel-1');
  assert.equal(item.sourceId, 'hotels');
  assert.equal(item.group, 'hotels');
  assert.equal(item.title, 'Savanna Lodge');
  assert.equal(item.subtitle, 'Kinshasa · CD');
  assert.equal(item.href, '/hotels/hotel-1');
  assert.equal(item.kind, 'entity');
});

test('mapSiteSearchCatalogHitToResultItem drops blank subtitle', () => {
  const item = mapSiteSearchCatalogHitToResultItem({
    type: 'blog',
    id: 'safari-tips',
    title: 'Safari Tips',
    subtitle: '  ',
    href: '/blog/safari-tips',
    score: 80,
  });

  assert.equal(item.subtitle, undefined);
  assert.equal(item.id, 'blog:safari-tips');
});

test('clearSiteSearchCatalogInflightCache is safe when empty', () => {
  clearSiteSearchCatalogInflightCache();
  clearSiteSearchCatalogInflightCache();
});
