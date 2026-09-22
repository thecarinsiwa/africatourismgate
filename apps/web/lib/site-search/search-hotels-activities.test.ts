import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesSiteActivity } from './search-activities';
import { matchesSiteHotel } from './search-hotels';

test('matchesSiteHotel filters on name, destination and slug', () => {
  const property = {
    name: 'Savanna Lodge',
    destinationName: 'Kinshasa',
    slug: 'savanna-lodge',
  };
  assert.equal(matchesSiteHotel(property, ''), false);
  assert.equal(matchesSiteHotel(property, 'savanna'), true);
  assert.equal(matchesSiteHotel(property, 'kinshasa'), true);
  assert.equal(matchesSiteHotel(property, 'savanna-lodge'), true);
  assert.equal(matchesSiteHotel(property, 'xyz'), false);
});

test('matchesSiteActivity filters on title and destination', () => {
  const activity = {
    title: 'Gorilla Trekking',
    destination: 'Virunga',
  };
  assert.equal(matchesSiteActivity(activity, ''), false);
  assert.equal(matchesSiteActivity(activity, 'gorilla'), true);
  assert.equal(matchesSiteActivity(activity, 'virunga'), true);
  assert.equal(matchesSiteActivity(activity, 'xyz'), false);
});
