import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchAdminHelp } from './search-help';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function loadPaletteArticle(locale: 'fr' | 'en' | 'es') {
  const raw = readFileSync(
    join(root, 'messages', locale, 'modules', 'adminHelp.json'),
    'utf8',
  );
  const json = JSON.parse(raw) as {
    articles: Record<
      string,
      { title: string; summary: string; body: string }
    >;
  };
  const article = json.articles['palette-commandes'];
  assert.ok(article, `palette-commandes missing in ${locale}`);
  return article;
}

test('palette-commandes help article covers phased search and new sources', () => {
  for (const locale of ['fr', 'en', 'es'] as const) {
    const article = loadPaletteArticle(locale);
    assert.match(article.title, /Ctrl\+F/i);
    assert.match(article.body, /\/paiements\/promotions/);
    assert.match(article.body, /\/paiements\/codes-promo/);
    assert.match(article.body, /\/guides/);
    assert.match(article.body, /\/systeme\/roles/);
    assert.match(article.body, /GAP/i);
    assert.match(
      article.body,
      /vagues|waves|oleadas/i,
      `${locale}: missing phased/waves wording`,
    );
  }
});

test('searchAdminHelp finds palette-commandes', async () => {
  const fr = loadPaletteArticle('fr');
  const results = await searchAdminHelp(
    'palette',
    {
      permissions: [],
      isSuperAdmin: true,
      helpStringsBySlug: {
        'palette-commandes': {
          title: fr.title,
          summary: fr.summary,
          body: fr.body,
        },
      },
    },
  );

  assert.ok(results.some((item) => item.href.includes('palette-commandes')));
  assert.equal(
    results.find((item) => item.href.includes('palette-commandes'))?.title,
    fr.title,
  );
});
