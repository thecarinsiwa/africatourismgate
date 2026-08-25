import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBlogListLocaleFallback,
  applyBlogDetailLocaleFallback,
  resolveBlogApiSlug,
} from './fallback-posts';
import { localizeBlogPosts } from './locale';
import type { PublicBlogPostListItem } from '@africatourismgate/types';

const frPost: PublicBlogPostListItem = {
  id: '3',
  title: 'Voyager en RDC : Kinshasa et les trésors naturels',
  slug: 'voyager-rdc-kinshasa',
  excerpt: 'Conseils logistiques…',
  coverImageUrl: null,
  publishedAt: '2026-06-01T14:00:00.000Z',
  locale: 'fr',
};

test('translates list item to English but keeps API slug for links', () => {
  const en = applyBlogListLocaleFallback(frPost, 'en');
  assert.match(en.title, /Traveling in the DRC/);
  assert.equal(en.slug, 'voyager-rdc-kinshasa');
  assert.equal(en.locale, 'en');
  assert.ok(en.coverImageUrl?.includes('Kinshasa'));
});

test('applies cover image even when locale is omitted', () => {
  const withCover = applyBlogListLocaleFallback(frPost);
  assert.ok(withCover.coverImageUrl?.includes('Kinshasa'));
});

test('resolves localized slug to canonical API slug', () => {
  assert.equal(resolveBlogApiSlug('travel-drc-kinshasa'), 'voyager-rdc-kinshasa');
});

test('localizes grouped FR-only API rows', () => {
  const { data } = localizeBlogPosts([frPost], 'en');
  assert.equal(data.length, 1);
  assert.match(data[0]?.title ?? '', /Traveling in the DRC/);
});

test('translates detail content', () => {
  const detail = applyBlogDetailLocaleFallback({ ...frPost, content: '<p>FR</p>' }, 'es');
  assert.match(detail.title, /Viajar en la RDC/);
  assert.match(detail.content, /Kinshasa/);
});
