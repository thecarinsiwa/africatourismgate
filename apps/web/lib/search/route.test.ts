import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildComingSoonRoute,
  buildSearchRoute,
  IMPLEMENTED_SEARCH_VERTICALS,
} from './route';

test('buildSearchRoute routes hotels to /hotels', () => {
  const params = new URLSearchParams({ destination: 'Nairobi' });
  assert.equal(buildSearchRoute('hotels', params), '/hotels?destination=Nairobi');
});

test('buildSearchRoute routes flights to /flights', () => {
  const params = new URLSearchParams({ from: 'FIH', to: 'NBO', departureDate: '2026-08-01' });
  assert.equal(
    buildSearchRoute('flights', params),
    '/flights?from=FIH&to=NBO&departureDate=2026-08-01',
  );
});

test('buildSearchRoute routes cars to /cars', () => {
  const params = new URLSearchParams({
    pickupLocation: 'Kinshasa',
    pickupDate: '2026-08-01',
    returnDate: '2026-08-08',
  });
  assert.equal(
    buildSearchRoute('cars', params),
    '/cars?pickupLocation=Kinshasa&pickupDate=2026-08-01&returnDate=2026-08-08',
  );
});

test('buildSearchRoute routes cruises to /cruises', () => {
  const params = new URLSearchParams({
    sailFrom: 'CDKIN',
    sailTo: 'CDBNW',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    guests: '2',
  });
  assert.equal(
    buildSearchRoute('cruises', params),
    '/cruises?sailFrom=CDKIN&sailTo=CDBNW&startDate=2026-09-01&endDate=2026-09-30&guests=2',
  );
});

test('buildSearchRoute routes tours to /activities', () => {
  const params = new URLSearchParams({
    destination: 'Nairobi',
    date: '2026-08-15',
    participants: '2',
  });
  assert.equal(
    buildSearchRoute('tours', params),
    '/activities?destination=Nairobi&date=2026-08-15&participants=2',
  );
});

test('buildSearchRoute routes tours to /activities without query params', () => {
  assert.equal(buildSearchRoute('tours', new URLSearchParams()), '/activities');
});

test('buildComingSoonRoute preserves query params', () => {
  const params = new URLSearchParams({ from: 'FIH', to: 'NBO', departureDate: '2026-08-01' });
  assert.equal(
    buildComingSoonRoute('flights', params),
    '/coming-soon/flights?from=FIH&to=NBO&departureDate=2026-08-01',
  );
});

test('buildComingSoonRoute works for tours vertical', () => {
  const params = new URLSearchParams({ date: '2026-08-15', participants: '2' });
  assert.equal(
    buildComingSoonRoute('tours', params),
    '/coming-soon/tours?date=2026-08-15&participants=2',
  );
});

test('buildComingSoonRoute omits query string when params are empty', () => {
  assert.equal(buildComingSoonRoute('cruises', new URLSearchParams()), '/coming-soon/cruises');
});

test('buildSearchRoute routes unimplemented vertical to coming-soon', () => {
  const original = IMPLEMENTED_SEARCH_VERTICALS.flights;
  IMPLEMENTED_SEARCH_VERTICALS.flights = false;
  try {
    const params = new URLSearchParams({ from: 'FIH', to: 'NBO' });
    assert.equal(buildSearchRoute('flights', params), '/coming-soon/flights?from=FIH&to=NBO');
  } finally {
    IMPLEMENTED_SEARCH_VERTICALS.flights = original;
  }
});

test('buildSearchRoute routes unimplemented tours to coming-soon with activity params', () => {
  const original = IMPLEMENTED_SEARCH_VERTICALS.tours;
  IMPLEMENTED_SEARCH_VERTICALS.tours = false;
  try {
    const params = new URLSearchParams({
      destination: 'Marrakech',
      date: '2026-09-01',
      participants: '4',
    });
    assert.equal(
      buildSearchRoute('tours', params),
      '/coming-soon/tours?destination=Marrakech&date=2026-09-01&participants=4',
    );
  } finally {
    IMPLEMENTED_SEARCH_VERTICALS.tours = original;
  }
});
