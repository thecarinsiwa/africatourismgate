import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HELP_QUICK_START_SLUGS,
  getArticleBySlug,
  getQuickStartArticles,
} from './help-catalog';

test('HELP_QUICK_START_SLUGS resolve to existing articles', () => {
  assert.equal(HELP_QUICK_START_SLUGS.length, 6);
  for (const slug of HELP_QUICK_START_SLUGS) {
    const article = getArticleBySlug(slug);
    assert.ok(article, `missing article for quick-start slug ${slug}`);
    assert.equal(article!.slug, slug);
  }
});

test('getQuickStartArticles preserves curated order', () => {
  const articles = getQuickStartArticles();
  assert.equal(articles.length, HELP_QUICK_START_SLUGS.length);
  assert.deepEqual(
    articles.map((article) => article.slug),
    [...HELP_QUICK_START_SLUGS],
  );
});
