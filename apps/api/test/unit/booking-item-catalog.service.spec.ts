import { In } from 'typeorm';
import { BookingItemCatalogService } from '../../src/modules/resources/bookings/booking-item-catalog.service';

describe('BookingItemCatalogService', () => {
  function createService(overrides: {
    rooms?: Array<{ id: string; propertyId: string }>;
    flightClasses?: Array<{ id: string; flightId: string }>;
    vehicleAvailability?: Array<{ id: string; vehicleId: string }>;
    cabinAvailability?: Array<{ id: string; sailingId: string }>;
    activitySchedules?: Array<{ id: string; activityId: string }>;
  }) {
    const findFor = (rows: Array<{ id: string }>) =>
      jest.fn(async (opts: { where: { id: ReturnType<typeof In> } }) => {
        const ids = new Set((opts.where.id as { value: string[] }).value ?? []);
        return rows.filter((row) => ids.has(row.id));
      });

    return new BookingItemCatalogService(
      { find: findFor(overrides.rooms ?? []) } as never,
      { find: findFor(overrides.flightClasses ?? []) } as never,
      { find: findFor(overrides.vehicleAvailability ?? []) } as never,
      { find: findFor(overrides.cabinAvailability ?? []) } as never,
      { find: findFor(overrides.activitySchedules ?? []) } as never,
    );
  }

  it('maps package referenceId as catalogProductId', async () => {
    const service = createService({});
    const enriched = await service.enrichItems([
      { itemType: 'package', referenceId: 'pkg-1' },
    ]);
    expect(enriched[0]?.catalogProductId).toBe('pkg-1');
  });

  it('resolves room → propertyId', async () => {
    const service = createService({
      rooms: [{ id: 'room-1', propertyId: 'prop-1' }],
    });
    const map = await service.resolveProductIds([
      { itemType: 'room', referenceId: 'room-1' },
    ]);
    expect(map.get('room:room-1')).toBe('prop-1');
  });

  it('resolves flight_class, vehicle, cabin, activity_schedule parents', async () => {
    const service = createService({
      flightClasses: [{ id: 'fc-1', flightId: 'fl-1' }],
      vehicleAvailability: [{ id: 'va-1', vehicleId: 'v-1' }],
      cabinAvailability: [{ id: 'ca-1', sailingId: 'sail-1' }],
      activitySchedules: [{ id: 'as-1', activityId: 'act-1' }],
    });
    const map = await service.resolveProductIds([
      { itemType: 'flight_class', referenceId: 'fc-1' },
      { itemType: 'vehicle', referenceId: 'va-1' },
      { itemType: 'cabin', referenceId: 'ca-1' },
      { itemType: 'activity_schedule', referenceId: 'as-1' },
    ]);
    expect(map.get('flight_class:fc-1')).toBe('fl-1');
    expect(map.get('vehicle:va-1')).toBe('v-1');
    expect(map.get('cabin:ca-1')).toBe('sail-1');
    expect(map.get('activity_schedule:as-1')).toBe('act-1');
  });
});
