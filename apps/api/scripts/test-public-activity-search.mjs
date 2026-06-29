/**
 * Public activity search (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-activity-search
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const ACTIVITY_DEMO_GOMBE_TOUR = '00000000-0000-4000-8000-000000004031';
const ACTIVITY_SCHEDULE_DEMO_MORNING = '00000000-0000-4000-8000-000000004033';

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { status: res.status, data };
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  console.log('1. GET /public/activities/destinations');
  const destinations = await request('/public/activities/destinations');
  assertStatus('activity destinations', destinations.status, 200);
  if (!destinations.data?.length) {
    throw new Error('Expected at least one activity destination');
  }
  const kinshasa = destinations.data.find((d) => d.name === 'Kinshasa');
  if (!kinshasa) {
    throw new Error('Expected Kinshasa in activity destinations');
  }
  console.log(`  OK ${destinations.data.length} destination(s), including Kinshasa`);

  console.log('2. GET /public/activities/browse');
  const browse = await request('/public/activities/browse');
  assertStatus('activity browse', browse.status, 200);
  if (!browse.data?.data?.length) {
    throw new Error('Expected at least one activity in browse');
  }
  const browseTour = browse.data.data.find((a) => a.id === ACTIVITY_DEMO_GOMBE_TOUR);
  if (!browseTour) {
    throw new Error('Seed activity Gombe City Tour not found in browse');
  }
  console.log(`  OK browse: ${browse.data.data.length} activity(ies)`);

  console.log('3. GET /public/activities/search Kinshasa');
  const search = await request(
    '/public/activities/search?destination=Kinshasa&date=2026-07-20&participants=2',
  );
  assertStatus('Kinshasa search', search.status, 200);
  if (!search.data?.data?.length) {
    throw new Error('Expected at least one activity in Kinshasa');
  }
  const tour = search.data.data.find((a) => a.id === ACTIVITY_DEMO_GOMBE_TOUR);
  if (!tour) {
    throw new Error('Seed activity Gombe City Tour not found');
  }
  if (tour.priceCents !== 4500 || tour.availableSchedulesCount !== 1) {
    throw new Error(
      `Expected price 4500 and 1 schedule, got ${tour.priceCents}/${tour.availableSchedulesCount}`,
    );
  }
  const riverWalk = search.data.data.find((a) => a.title === 'Congo River Walk');
  if (riverWalk) {
    throw new Error('Congo River Walk should be excluded (no schedules)');
  }
  console.log(`  OK ${tour.title} @ ${tour.priceCents} cents (${tour.availableSchedulesCount} slot)`);

  console.log('4. GET search all destinations on date');
  const allDest = await request(
    '/public/activities/search?date=2026-07-20&participants=2',
  );
  assertStatus('all destinations search', allDest.status, 200);
  if (!allDest.data?.data?.length) {
    throw new Error('Expected at least one activity when searching all destinations');
  }
  const allDestTour = allDest.data.data.find((a) => a.id === ACTIVITY_DEMO_GOMBE_TOUR);
  if (!allDestTour) {
    throw new Error('Seed activity Gombe City Tour not found in all-destinations search');
  }
  console.log(`  OK all destinations: ${allDest.data.data.length} activity(ies)`);

  console.log('5. GET search participants=11 (empty)');
  const tooMany = await request(
    '/public/activities/search?destination=Kinshasa&date=2026-07-20&participants=11',
  );
  assertStatus('participants=11', tooMany.status, 200);
  if (tooMany.data?.data?.length !== 0) {
    throw new Error('Expected empty results for participants=11');
  }

  console.log('6. GET search unknown destination (empty)');
  const emptyDest = await request(
    '/public/activities/search?destination=Nairobi&date=2026-07-20&participants=2',
  );
  assertStatus('unknown destination', emptyDest.status, 200);
  if (emptyDest.data?.data?.length !== 0) {
    throw new Error('Expected empty results for Nairobi');
  }

  console.log('7. GET search invalid date (400)');
  const invalid = await request(
    '/public/activities/search?destination=Kinshasa&date=not-a-date&participants=2',
  );
  assertStatus('invalid date', invalid.status, 400);

  console.log('8. GET /public/activities/:id detail');
  const detail = await request(
    `/public/activities/${ACTIVITY_DEMO_GOMBE_TOUR}?date=2026-07-20&participants=2`,
  );
  assertStatus('activity detail', detail.status, 200);
  if (detail.data?.schedules?.length !== 1) {
    throw new Error('Expected 1 available schedule in detail');
  }
  const slot = detail.data.schedules[0];
  if (slot.scheduleId !== ACTIVITY_SCHEDULE_DEMO_MORNING) {
    throw new Error(`Expected morning schedule ${ACTIVITY_SCHEDULE_DEMO_MORNING}`);
  }
  if (slot.remainingPlaces !== 10 || slot.priceCents !== 4500) {
    throw new Error(`Unexpected slot: places=${slot.remainingPlaces} price=${slot.priceCents}`);
  }
  console.log(`  OK detail: ${slot.remainingPlaces} places @ ${slot.priceCents} cents`);

  console.log('9. GET /public/activities/:id no schedules for date (200, empty schedules)');
  const noSchedules = await request(
    `/public/activities/${ACTIVITY_DEMO_GOMBE_TOUR}?date=2026-06-13&participants=1`,
  );
  assertStatus('activity detail no schedules', noSchedules.status, 200);
  if (!Array.isArray(noSchedules.data?.schedules) || noSchedules.data.schedules.length !== 0) {
    throw new Error('Expected empty schedules array for June 13');
  }

  console.log('\nAll public activity search checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
