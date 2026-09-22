import test from 'node:test';
import assert from 'node:assert/strict';
import { siteSearchDeepLinks } from './deep-links';

test('package and blog deep-links target entity routes', () => {
  assert.equal(siteSearchDeepLinks.packageItem('pkg-1'), '/packages/pkg-1');
  assert.equal(
    siteSearchDeepLinks.blogPost('safari-tips'),
    '/blog/safari-tips',
  );
});
