/**
 * Public vehicle search (no auth).
 * Run: pnpm --filter @africatourismgate/api test:public-vehicle-search
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const VEHICLE_DEMO_ECO = '00000000-0000-4000-8000-000000004021';
const VEHICLE_AVAIL_DEMO_ECO = '00000000-0000-4000-8000-000000004023';

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

  console.log('1. GET /public/vehicles/pickup-locations');
  const pickupLocations = await request('/public/vehicles/pickup-locations');
  assertStatus('pickup locations', pickupLocations.status, 200);
  if (!pickupLocations.data?.length) {
    throw new Error('Expected at least one pickup location');
  }
  const kinshasaLocation = pickupLocations.data.find((d) =>
    d.name?.toLowerCase().includes('kinshasa'),
  );
  if (!kinshasaLocation) {
    throw new Error('Expected Kinshasa in pickup locations');
  }
  console.log(`  → ${pickupLocations.data.length} location(s), including Kinshasa`);

  console.log('\n2. GET /public/vehicles/search (browse all, no params)');
  const browseAll = await request('/public/vehicles/search?page=1&limit=50');
  assertStatus('browse all search', browseAll.status, 200);
  const browseEco = browseAll.data?.data?.find((v) => v.licensePlate === 'CD-KIN-001');
  if (!browseEco) {
    throw new Error('Expected CD-KIN-001 when browsing all vehicles');
  }
  if (!browseEco.pickupDate || !browseEco.returnDate) {
    throw new Error('Browse result should include resolved pickupDate and returnDate');
  }
  console.log(
    `  → ${browseAll.data.data.length} vehicle(s), ${browseEco.licensePlate} @ ${browseEco.pickupDate} → ${browseEco.returnDate}`,
  );

  console.log('\n3. GET /public/vehicles/search Kinshasa');
  const search = await request(
    '/public/vehicles/search?pickupLocation=Kinshasa&pickupDate=2026-08-01&returnDate=2026-08-08',
  );
  assertStatus('Kinshasa search', search.status, 200);
  if (!search.data?.data?.length) {
    throw new Error('Expected at least one vehicle in Kinshasa');
  }
  const eco = search.data.data.find((v) => v.licensePlate === 'CD-KIN-001');
  if (!eco) {
    throw new Error('Seed economy vehicle CD-KIN-001 not found');
  }
  const expectedTotal = 5500 * 7;
  if (eco.dailyPriceCents !== 5500 || eco.totalPriceCents !== expectedTotal) {
    throw new Error(
      `Expected daily 5500 and total ${expectedTotal} cents, got ${eco.dailyPriceCents}/${eco.totalPriceCents}`,
    );
  }
  if (eco.rentalDays !== 7) {
    throw new Error(`Expected rentalDays 7, got ${eco.rentalDays}`);
  }
  const suv = search.data.data.find((v) => v.licensePlate === 'CD-KIN-SUV');
  if (suv) {
    throw new Error('Rented SUV CD-KIN-SUV should be excluded from search');
  }
  console.log(`  OK ${eco.categoryName} @ ${eco.totalPriceCents} cents (${eco.rentalDays} days)`);

  console.log('4. GET search period outside availability (empty)');
  const emptyPeriod = await request(
    '/public/vehicles/search?pickupLocation=Kinshasa&pickupDate=2026-09-01&returnDate=2026-09-08',
  );
  assertStatus('out-of-range search', emptyPeriod.status, 200);
  if (emptyPeriod.data?.data?.length !== 0) {
    throw new Error('Expected empty results for September dates');
  }

  console.log('5. GET search unknown location (empty)');
  const emptyLocation = await request(
    '/public/vehicles/search?pickupLocation=Nairobi&pickupDate=2026-08-01&returnDate=2026-08-08',
  );
  assertStatus('unknown location', emptyLocation.status, 200);
  if (emptyLocation.data?.data?.length !== 0) {
    throw new Error('Expected empty results for Nairobi');
  }

  console.log('6. GET search invalid returnDate (400)');
  const invalid = await request(
    '/public/vehicles/search?pickupLocation=Kinshasa&pickupDate=2026-08-08&returnDate=2026-08-01',
  );
  assertStatus('invalid dates', invalid.status, 400);

  console.log('7. GET /public/vehicles/:id detail');
  const detail = await request(
    `/public/vehicles/${VEHICLE_DEMO_ECO}?pickupDate=2026-08-01&returnDate=2026-08-08`,
  );
  assertStatus('vehicle detail', detail.status, 200);
  if (detail.data?.agency?.name !== 'Tourism Gate Rent Kinshasa') {
    throw new Error('Expected demo agency name in detail');
  }
  if (detail.data?.category?.name !== 'Economy') {
    throw new Error('Expected Economy category in detail');
  }
  if (detail.data?.availabilitySlot?.id !== VEHICLE_AVAIL_DEMO_ECO) {
    throw new Error(
      `Expected availability slot ${VEHICLE_AVAIL_DEMO_ECO}, got ${detail.data?.availabilitySlot?.id}`,
    );
  }
  if (detail.data?.totalPriceCents !== expectedTotal) {
    throw new Error(
      `Expected totalPriceCents ${expectedTotal}, got ${detail.data?.totalPriceCents}`,
    );
  }
  console.log(`  OK detail: ${detail.data.category.name} via ${detail.data.agency.name}`);

  console.log('\nAll public vehicle search checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
