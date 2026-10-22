import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PublicActivityProviderListItem } from '@africatourismgate/types';
import {
  DEFAULT_PARTNERS_VIEW_MODE,
  isPartnersSortKey,
  isPartnersViewMode,
  sortPartners,
} from './view-mode';

const partner = (
  name: string,
  extra: Partial<PublicActivityProviderListItem> = {},
): PublicActivityProviderListItem => ({ id: name, name, logoUrl: null, ...extra });

test('default view mode is grid', () => {
  assert.equal(DEFAULT_PARTNERS_VIEW_MODE, 'grid');
});

test('isPartnersViewMode accepts only grid/list/table', () => {
  assert.ok(isPartnersViewMode('grid'));
  assert.ok(isPartnersViewMode('list'));
  assert.ok(isPartnersViewMode('table'));
  assert.ok(!isPartnersViewMode('cards'));
  assert.ok(!isPartnersViewMode(null));
});

test('isPartnersSortKey rejects unknown keys', () => {
  assert.ok(isPartnersSortKey('rating'));
  assert.ok(!isPartnersSortKey('price'));
});

test('sortPartners by name and does not mutate input', () => {
  const input = [partner('Zeta'), partner('Alpha'), partner('Mike')];
  assert.deepEqual(
    sortPartners(input, 'name-asc').map((p) => p.name),
    ['Alpha', 'Mike', 'Zeta'],
  );
  assert.deepEqual(
    sortPartners(input, 'name-desc').map((p) => p.name),
    ['Zeta', 'Mike', 'Alpha'],
  );
  assert.deepEqual(input.map((p) => p.name), ['Zeta', 'Alpha', 'Mike']);
});

test('sortPartners by activities count then name', () => {
  const input = [
    partner('B', { activitiesCount: 2 }),
    partner('A', { activitiesCount: 2 }),
    partner('C', { activitiesCount: 5 }),
    partner('D'),
  ];
  assert.deepEqual(
    sortPartners(input, 'activities').map((p) => p.name),
    ['C', 'A', 'B', 'D'],
  );
});

test('sortPartners by rating puts unrated last', () => {
  const input = [
    partner('Unrated', { averageRating: null }),
    partner('Good', { averageRating: 4.2, reviewCount: 3 }),
    partner('Best', { averageRating: 4.8, reviewCount: 1 }),
    partner('GoodMore', { averageRating: 4.2, reviewCount: 9 }),
  ];
  assert.deepEqual(
    sortPartners(input, 'rating').map((p) => p.name),
    ['Best', 'GoodMore', 'Good', 'Unrated'],
  );
});
