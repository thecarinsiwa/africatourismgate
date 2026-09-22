import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesSiteCruisePort,
  searchSiteCruises,
} from './search-cruises';
import {
  matchesSiteDestination,
  slugifyDestinationName,
} from './search-destinations';

test('slugifyDestinationName normalizes spaces and accents', () => {
  assert.equal(slugifyDestinationName('Cape Town'), 'cape-town');
  assert.equal(slugifyDestinationName('  Côte d’Ivoire  '), 'cote-d-ivoire');
});

test('matchesSiteDestination matches name, country and slug', () => {
  const destination = {
    id: '1',
    name: 'Cape Town',
    countryCode: 'ZA',
    slug: 'cape-town',
  };

  assert.equal(matchesSiteDestination(destination, ''), true);
  assert.equal(matchesSiteDestination(destination, 'cape'), true);
  assert.equal(matchesSiteDestination(destination, 'za'), true);
  assert.equal(matchesSiteDestination(destination, 'cape-town'), true);
  assert.equal(matchesSiteDestination(destination, 'xyz'), false);
});

test('matchesSiteDestination derives slug from name when missing', () => {
  const destination = {
    id: '2',
    name: 'Kinshasa',
    countryCode: 'CD',
  };
  assert.equal(matchesSiteDestination(destination, 'kinshasa'), true);
  assert.equal(matchesSiteDestination(destination, 'cd'), true);
});

test('matchesSiteCruisePort matches code and name', () => {
  const port = { code: 'CDKIN', name: 'Kinshasa Port' };
  assert.equal(matchesSiteCruisePort(port, ''), false);
  assert.equal(matchesSiteCruisePort(port, 'cdkin'), true);
  assert.equal(matchesSiteCruisePort(port, 'kinshasa'), true);
  assert.equal(matchesSiteCruisePort(port, 'xyz'), false);
});

test('searchSiteCruises returns cruise routes (catalog and/or prefilled)', async () => {
  const items = await searchSiteCruises('kinshasa');
  assert.ok(items.length >= 1);
  assert.equal(items[0]?.sourceId, 'cruises');
  assert.equal(items[0]?.group, 'cruises');
  assert.ok(items[0]?.kind === 'entity' || items[0]?.kind === 'prefilled');
  assert.ok(items[0]?.href.startsWith('/cruises'));
});

test('searchSiteCruises returns empty for blank query', async () => {
  const items = await searchSiteCruises('  ');
  assert.equal(items.length, 0);
});
