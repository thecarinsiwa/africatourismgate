import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PublicVehicleTripsService } from '../../src/modules/public/vehicles/public-vehicle-trips.service';

const CREATOR_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_ID = '00000000-0000-4000-8000-000000000002';
const TRIP_ID = '00000000-0000-4000-8000-000000004023';
const ROUTE_ID = '00000000-0000-4000-8000-000000004022';
const VEHICLE_ID = '00000000-0000-4000-8000-000000004021';
const SLOT_ID = '00000000-0000-4000-8000-000000004024';

function futureDeparture(hoursFromNow = 48): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

function makeTrip(overrides: Record<string, unknown> = {}) {
  const departure = futureDeparture();
  return {
    id: TRIP_ID,
    vehicleId: VEHICLE_ID,
    routeId: ROUTE_ID,
    availabilityId: SLOT_ID,
    departureDatetime: departure,
    createdByUserId: CREATOR_ID,
    maxCapacity: 4,
    seatsReserved: 1,
    status: 'open',
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

function makeService(trip = makeTrip()) {
  const tripsRepository = {
    findOne: jest.fn().mockResolvedValue(trip),
    save: jest.fn(async (row: typeof trip) => row),
  };
  const routesRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: ROUTE_ID,
        priceCents: 5000,
        currency: 'USD',
        departureCity: 'Kinshasa',
        arrivalCity: 'Lubumbashi',
      },
    ]),
  };
  const tiersRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const bookingItemsRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const paymentsRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const bookingsRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const organizationSettingsService = {
    getResolvedVehicleSharedTrip: jest.fn().mockResolvedValue({
      paymentCloseHoursBeforeDeparture: 3,
      departureTimeEditableUntil: 'until_payment_close',
      minSeatsToOpen: 1,
    }),
  };
  const bookingEngine = {
    countActiveTripSeatClaims: jest.fn().mockResolvedValue(0),
  };

  const service = new PublicVehicleTripsService(
    tripsRepository as never,
    {} as never,
    routesRepository as never,
    tiersRepository as never,
    {} as never,
    bookingItemsRepository as never,
    paymentsRepository as never,
    bookingsRepository as never,
    organizationSettingsService as never,
    bookingEngine as never,
  );

  return {
    service,
    trip,
    tripsRepository,
    bookingEngine,
  };
}

describe('PublicVehicleTripsService creator vs join', () => {
  it('rejects join when the caller is the trip creator (400)', async () => {
    const { service } = makeService();

    await expect(
      service.join(TRIP_ID, { seats: 1 }, CREATOR_ID),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.join(TRIP_ID, { seats: 1 }, CREATOR_ID),
    ).rejects.toThrow(/créateur/i);
  });

  it('allows another user to join and increments seatsReserved', async () => {
    const { service, trip, tripsRepository } = makeService();

    const dto = await service.join(TRIP_ID, { seats: 1 }, OTHER_ID);

    expect(trip.seatsReserved).toBe(2);
    expect(tripsRepository.save).toHaveBeenCalled();
    expect(dto.isMine).toBe(false);
    expect(dto.canJoin).toBe(true);
    expect(dto.seatsReserved).toBe(2);
  });

  it('lets the creator ensure-seats (continue) without join', async () => {
    const { service, trip, tripsRepository, bookingEngine } = makeService(
      makeTrip({ seatsReserved: 1 }),
    );
    bookingEngine.countActiveTripSeatClaims.mockResolvedValue(0);

    const dto = await service.ensureSeats(TRIP_ID, { seats: 2 }, CREATOR_ID);

    expect(bookingEngine.countActiveTripSeatClaims).toHaveBeenCalledWith(TRIP_ID);
    expect(trip.seatsReserved).toBe(2);
    expect(tripsRepository.save).toHaveBeenCalled();
    expect(dto.isMine).toBe(true);
    expect(dto.canJoin).toBe(false);
  });

  it('forbids ensure-seats for a non-creator', async () => {
    const { service } = makeService();

    await expect(
      service.ensureSeats(TRIP_ID, { seats: 1 }, OTHER_ID),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('marks isMine and disables canJoin for the creator on getById', async () => {
    const { service } = makeService();

    const mine = await service.getById(TRIP_ID, CREATOR_ID);
    expect(mine.isMine).toBe(true);
    expect(mine.canJoin).toBe(false);

    const other = await service.getById(TRIP_ID, OTHER_ID);
    expect(other.isMine).toBe(false);
    expect(other.canJoin).toBe(true);
  });
});
