import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesSiteNavSearchItem,
  normalizeSiteSearchText,
} from './nav-match';
import {
  buildSiteNavSearchItems,
  searchSitePages,
} from './search-pages';

test('normalizeSiteSearchText strips accents and case', () => {
  assert.equal(normalizeSiteSearchText('  À propos  '), 'a propos');
  assert.equal(normalizeSiteSearchText('Hôtels'), 'hotels');
  assert.equal(normalizeSiteSearchText(''), '');
});

test('matchesSiteNavSearchItem matches label and href without accents', () => {
  const item = { href: '/hotels', label: 'Hôtels' };
  assert.equal(matchesSiteNavSearchItem(item, ''), true);
  assert.equal(matchesSiteNavSearchItem(item, 'hotel'), true);
  assert.equal(matchesSiteNavSearchItem(item, 'hotels'), true);
  assert.equal(matchesSiteNavSearchItem(item, '/hotels'), true);
  assert.equal(matchesSiteNavSearchItem(item, 'xyz'), false);
});

test('matchesSiteNavSearchItem matches aliases on /support', () => {
  const help = { href: '/support', label: "Centre d'aide" };
  assert.equal(matchesSiteNavSearchItem(help, 'aide'), true);
  assert.equal(matchesSiteNavSearchItem(help, 'help'), true);
  assert.equal(matchesSiteNavSearchItem(help, 'docs'), true);
  assert.equal(matchesSiteNavSearchItem(help, 'x'), false);
});

test('matchesSiteNavSearchItem matches legal and donate aliases', () => {
  assert.equal(
    matchesSiteNavSearchItem(
      { href: '/legal/terms', label: "Conditions d'utilisation" },
      'cgu',
    ),
    true,
  );
  assert.equal(
    matchesSiteNavSearchItem(
      { href: '/legal/privacy', label: 'Politique de confidentialité' },
      'rgpd',
    ),
    true,
  );
  assert.equal(
    matchesSiteNavSearchItem(
      { href: '/donate', label: 'Faire un don' },
      'don',
    ),
    true,
  );
});

test('buildSiteNavSearchItems includes nav, about, legal and donate', () => {
  const items = buildSiteNavSearchItems({
    nav: (key) => `nav:${key}`,
    aboutNav: (key) => `about:${key}`,
    legal: (key) => `legal:${key}`,
  });

  const byHref = new Map(items.map((item) => [item.href, item]));

  assert.equal(byHref.get('/')?.label, 'nav:home');
  assert.equal(byHref.get('/blog')?.label, 'nav:blog');
  assert.equal(byHref.get('/partners')?.label, 'nav:partners');
  assert.equal(byHref.get('/packages')?.label, 'nav:packages');
  assert.equal(byHref.get('/support')?.label, 'nav:help');
  assert.equal(byHref.get('/donate')?.label, 'nav:donate');
  assert.equal(byHref.get('/hotels')?.label, 'nav:hotels');
  assert.equal(byHref.get('/activities')?.label, 'nav:tours');
  assert.equal(byHref.get('/about/who-we-are')?.label, 'about:whoWeAre');
  assert.equal(byHref.get('/about/contact')?.label, 'about:contact');
  assert.equal(
    byHref.get('/legal/terms')?.label,
    'legal:termsOfUseTitle',
  );
  assert.equal(
    byHref.get('/legal/privacy')?.label,
    'legal:privacyPolicyTitle',
  );

  const hrefs = items.map((item) => item.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test('buildSiteNavSearchItems hides disabled catalog products', () => {
  const items = buildSiteNavSearchItems(
    {
      nav: (key) => `nav:${key}`,
      aboutNav: (key) => `about:${key}`,
      legal: (key) => `legal:${key}`,
    },
    {
      hotels: false,
      flights: true,
      cars: false,
      cruises: true,
      tours: false,
      packages: false,
    },
  );

  const hrefs = new Set(items.map((item) => item.href));
  assert.equal(hrefs.has('/hotels'), false);
  assert.equal(hrefs.has('/cars'), false);
  assert.equal(hrefs.has('/activities'), false);
  assert.equal(hrefs.has('/packages'), false);
  assert.equal(hrefs.has('/flights'), true);
  assert.equal(hrefs.has('/cruises'), true);
  assert.equal(hrefs.has('/'), true);
});

test('searchSitePages maps nav items to results with limit', async () => {
  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/blog', label: 'Blog' },
    { href: '/hotels', label: 'Hôtels' },
  ];

  const noMatch = await searchSitePages('xyz', { navItems });
  assert.equal(noMatch.length, 0);

  const hotelItems = await searchSitePages('hotel', { navItems }, {
    resultLimit: 1,
  });
  assert.equal(hotelItems.length, 1);
  assert.equal(hotelItems[0]?.href, '/hotels');
  assert.equal(hotelItems[0]?.sourceId, 'pages');
  assert.equal(hotelItems[0]?.group, 'pages');
  assert.equal(hotelItems[0]?.kind, 'entity');
  assert.equal(hotelItems[0]?.id, 'pages:/hotels');
});

test('searchSitePages returns all items for empty query', async () => {
  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/blog', label: 'Blog' },
  ];
  const items = await searchSitePages('', { navItems });
  assert.equal(items.length, 2);
});

test('searchSitePages returns empty without navItems', async () => {
  const items = await searchSitePages('anything', {});
  assert.equal(items.length, 0);
});
