import test from 'node:test';
import assert from 'node:assert/strict';
import { adminSearchDeepLinks } from './deep-links';

test('adminSearchDeepLinks cover new entity routes', () => {
  assert.equal(adminSearchDeepLinks.tourGuide('g1'), '/guides/g1/voir');
  assert.equal(
    adminSearchDeepLinks.promotion('p1'),
    '/paiements/promotions/p1/voir',
  );
  assert.equal(
    adminSearchDeepLinks.promoCode('c1'),
    '/paiements/codes-promo/c1/voir',
  );
  assert.equal(adminSearchDeepLinks.gapPage('gp1'), '/gap/pages/gp1');
  assert.equal(adminSearchDeepLinks.gapActivity('ga1'), '/gap/activites/ga1');
  assert.equal(adminSearchDeepLinks.role('r1'), '/systeme/roles/r1');
});
