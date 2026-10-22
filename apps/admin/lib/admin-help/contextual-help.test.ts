import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAdminContextualHelpHref,
  getAdminContextualHelpRules,
  resolveAdminContextualHelp,
} from './contextual-help';
import {
  ADMIN_HELP_ARTICLES,
  ADMIN_HELP_CATEGORIES,
  getAdminHelpArticleBySlug,
  isValidAdminHelpArticlePath,
} from './help-catalog';
import { isAllowedAdminHelpHref } from './admin-path-links';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCALES = ['fr', 'en', 'es'] as const;

type HelpMessages = {
  categories: Record<string, { title?: string; description?: string }>;
  articles: Record<string, { title?: string; summary?: string; body?: string }>;
};

function loadHelpMessages(locale: (typeof LOCALES)[number]): HelpMessages {
  const raw = readFileSync(
    join(root, 'messages', locale, 'modules', 'adminHelp.json'),
    'utf8',
  );
  return JSON.parse(raw) as HelpMessages;
}

test('treasury and currency routes resolve to their help article', () => {
  const cases: [string, string, string][] = [
    ['/tresorerie', 'tresorerie-comptabilite', 'vue-ensemble-tresorerie'],
    ['/tresorerie/', 'tresorerie-comptabilite', 'vue-ensemble-tresorerie'],
    ['/tresorerie/entrees/123', 'tresorerie-comptabilite', 'entrees-et-sorties'],
    ['/tresorerie/sorties/nouveau', 'tresorerie-comptabilite', 'entrees-et-sorties'],
    ['/tresorerie/besoins/42/voir', 'tresorerie-comptabilite', 'besoins-et-externes'],
    ['/tresorerie/externes', 'tresorerie-comptabilite', 'besoins-et-externes'],
    ['/tresorerie/budgets/suivi', 'tresorerie-comptabilite', 'budgets-et-suivi'],
    ['/tresorerie/taux-change', 'tresorerie-comptabilite', 'taux-de-change'],
    ['/tresorerie/rapports', 'tresorerie-comptabilite', 'rapports-et-audit'],
    ['/tresorerie/audit', 'tresorerie-comptabilite', 'rapports-et-audit'],
    ['/tresorerie/comptabilite', 'tresorerie-comptabilite', 'comptabilite-syscohada'],
    [
      '/tresorerie/comptabilite/grand-livre',
      'tresorerie-comptabilite',
      'comptabilite-syscohada',
    ],
    [
      '/tresorerie/comptabilite/journal/abc',
      'tresorerie-comptabilite',
      'comptabilite-syscohada',
    ],
    [
      '/tresorerie/comptabilite/exercices',
      'tresorerie-comptabilite',
      'exercices-et-cloture',
    ],
    [
      '/tresorerie/comptabilite/cloture',
      'tresorerie-comptabilite',
      'exercices-et-cloture',
    ],
    [
      '/tresorerie/comptabilite/audit',
      'tresorerie-comptabilite',
      'exercices-et-cloture',
    ],
    ['/systeme/devises', 'systeme', 'devises-et-devise-par-defaut'],
  ];

  for (const [pathname, categorySlug, articleSlug] of cases) {
    assert.deepEqual(
      resolveAdminContextualHelp(pathname),
      { categorySlug, articleSlug },
      pathname,
    );
  }

  assert.equal(
    getAdminContextualHelpHref('/tresorerie/taux-change'),
    '/aide/tresorerie-comptabilite/taux-de-change',
  );
});

test('prefixes that only share a start do not match', () => {
  assert.equal(resolveAdminContextualHelp('/tresorerie-archive'), null);
  assert.equal(resolveAdminContextualHelp('/aide/tresorerie-comptabilite'), null);
});

test('every contextual rule points to an article of its category', () => {
  for (const rule of getAdminContextualHelpRules()) {
    const article = getAdminHelpArticleBySlug(rule.articleSlug);
    assert.ok(article, `${rule.prefix}: unknown article ${rule.articleSlug}`);
    assert.equal(article.categorySlug, rule.categorySlug, rule.prefix);
    assert.deepEqual(
      resolveAdminContextualHelp(rule.prefix),
      { categorySlug: rule.categorySlug, articleSlug: rule.articleSlug },
      rule.prefix,
    );
  }
});

test('catalog categories, articles and related slugs are consistent', () => {
  for (const category of ADMIN_HELP_CATEGORIES) {
    for (const slug of category.articleSlugs) {
      const article = getAdminHelpArticleBySlug(slug);
      assert.ok(article, `${category.slug}: unknown article ${slug}`);
      assert.equal(article.categorySlug, category.slug, slug);
    }
  }

  for (const article of ADMIN_HELP_ARTICLES) {
    const category = ADMIN_HELP_CATEGORIES.find(
      (item) => item.slug === article.categorySlug,
    );
    assert.ok(category?.articleSlugs.includes(article.slug), article.slug);
    for (const related of article.relatedSlugs ?? []) {
      assert.ok(
        getAdminHelpArticleBySlug(related),
        `${article.slug}: unknown related ${related}`,
      );
    }
  }
});

test('help messages are complete in every locale with valid links', () => {
  for (const locale of LOCALES) {
    const messages = loadHelpMessages(locale);

    for (const category of ADMIN_HELP_CATEGORIES) {
      const strings = messages.categories[category.slug];
      assert.ok(strings?.title, `${locale}: ${category.slug} title`);
      assert.ok(strings?.description, `${locale}: ${category.slug} description`);
    }

    for (const article of ADMIN_HELP_ARTICLES) {
      const strings = messages.articles[article.slug];
      assert.ok(strings?.title, `${locale}: ${article.slug} title`);
      assert.ok(strings?.summary, `${locale}: ${article.slug} summary`);
      assert.ok(strings?.body, `${locale}: ${article.slug} body`);

      const hrefs = Array.from(
        strings.body.matchAll(/\]\(([^)]+)\)/g),
        (match) => match[1] ?? '',
      );
      for (const href of hrefs) {
        assert.ok(
          isAllowedAdminHelpHref(href),
          `${locale}: ${article.slug} link not allowed ${href}`,
        );
        const helpPath = /^\/aide\/([^/]+)\/([^/]+)$/.exec(href);
        if (helpPath) {
          assert.ok(
            isValidAdminHelpArticlePath(helpPath[1] ?? '', helpPath[2] ?? ''),
            `${locale}: ${article.slug} links unknown help article ${href}`,
          );
        }
      }
    }
  }
});
