import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import type { ResolvedVehicleSharedTrip } from '@africatourismgate/types';
import { PLATFORM_ORG_ID } from '../../../common/org-scope/org-scope.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  BookingItems,
  Bookings,
  Payments,
  VehicleAvailability,
  VehicleRoutePriceTiers,
  VehicleRoutes,
  VehicleTrips,
  Vehicles,
} from '../../../entities/generated';
import { BookingEngineService } from '../../resources/bookings/booking-engine.service';
import { OrganizationSettingsService } from '../../resources/organization-settings/organization-settings.service';
import {
  CreateVehicleTripDto,
  JoinVehicleTripDto,
  UpdateVehicleTripDto,
  VehicleTripDto,
  VehicleTripsListQueryDto,
} from './dto/vehicle-trip.dto';
import { dateOnlyFromDatetime, parseDateOnly, slotCoversTravelDate } from './vehicle-dates.util';
import { resolveVehicleRoutePriceCents } from './vehicle-trip-pricing.util';

const UNPAID_BOOKING_STATUSES: Bookings['status'][] = [
  'draft',
  'pending_approval',
  'pending_payment',
];

@Injectable()
export class PublicVehicleTripsService {
  private readonly logger = new Logger(PublicVehicleTripsService.name);

  constructor(
    @InjectRepository(VehicleTrips)
    private readonly tripsRepository: Repository<VehicleTrips>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(VehicleRoutes)
    private readonly routesRepository: Repository<VehicleRoutes>,
    @InjectRepository(VehicleRoutePriceTiers)
    private readonly tiersRepository: Repository<VehicleRoutePriceTiers>,
    @InjectRepository(VehicleAvailability)
    private readonly availabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    private readonly organizationSettingsService: OrganizationSettingsService,
    @Inject(forwardRef(() => BookingEngineService))
    private readonly bookingEngine: BookingEngineService,
  ) {}

  async list(
    query: VehicleTripsListQueryDto,
    viewerUserId?: string,
  ): Promise<PaginatedResult<VehicleTripDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const rules = await this.loadRules();

    const qb = this.tripsRepository
      .createQueryBuilder('trip')
      .where('trip.deletedAt IS NULL');

    if (query.routeId) {
      qb.andWhere('trip.routeId = :routeId', { routeId: query.routeId });
    }
    if (query.vehicleId) {
      qb.andWhere('trip.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }
    if (query.status) {
      qb.andWhere('trip.status = :status', { status: query.status });
    } else {
      qb.andWhere('trip.status = :status', { status: 'open' });
    }
    if (query.travelDate) {
      parseDateOnly(query.travelDate);
      qb.andWhere('DATE(trip.departureDatetime) = :travelDate', {
        travelDate: query.travelDate,
      });
    }

    qb.orderBy('trip.departureDatetime', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [trips, total] = await qb.getManyAndCount();
    const data = await this.toDtos(trips, rules, viewerUserId);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string, viewerUserId?: string): Promise<VehicleTripDto> {
    const trip = await this.requireTrip(id);
    const rules = await this.loadRules();
    const [dto] = await this.toDtos([trip], rules, viewerUserId);
    return dto;
  }

  async create(
    dto: CreateVehicleTripDto,
    userId: string,
  ): Promise<VehicleTripDto> {
    const seats = dto.seats ?? 1;
    const departure = this.parseFutureDeparture(dto.departureDatetime);
    const rules = await this.loadRules();
    this.assertBeforePaymentClose(departure, rules);

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: dto.vehicleId, deletedAt: IsNull() },
    });
    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    const route = await this.routesRepository.findOne({
      where: { id: dto.routeId, deletedAt: IsNull() },
    });
    if (!route || route.vehicleId !== vehicle.id) {
      throw new BadRequestException(
        'Tronçon invalide pour ce véhicule.',
      );
    }

    const maxCapacity = Math.max(1, vehicle.maxPassengers ?? 4);
    if (seats > maxCapacity) {
      throw new BadRequestException(
        `Capacité insuffisante (${seats} demandées, max ${maxCapacity}).`,
      );
    }

    const travelDate = dateOnlyFromDatetime(departure);
    await this.assertNoConflictingTrip(vehicle.id, travelDate);

    const slot = await this.findAvailableSlot(vehicle.id, travelDate);
    if (!slot) {
      throw new BadRequestException(
        'Aucun créneau de disponibilité pour cette date.',
      );
    }

    const trip = this.tripsRepository.create({
      id: newId(),
      vehicleId: vehicle.id,
      routeId: route.id,
      availabilityId: slot.id,
      departureDatetime: departure,
      createdByUserId: userId,
      maxCapacity,
      seatsReserved: seats,
      status: 'open',
    });
    const saved = await this.tripsRepository.save(trip);
    const [dtoOut] = await this.toDtos([saved], rules, userId);
    return dtoOut;
  }

  async join(
    tripId: string,
    dto: JoinVehicleTripDto,
    userId: string,
  ): Promise<VehicleTripDto> {
    const seats = dto.seats ?? 1;
    const trip = await this.requireTrip(tripId);
    const rules = await this.loadRules();

    if (trip.createdByUserId === userId) {
      throw new BadRequestException(
        'Vous êtes déjà le créateur de ce trajet. Continuez votre réservation ou ajoutez des places.',
      );
    }

    if (trip.status !== 'open') {
      throw new BadRequestException('Ce trajet n’accepte plus de passagers.');
    }
    this.assertBeforePaymentClose(trip.departureDatetime, rules);

    if (trip.seatsReserved + seats > trip.maxCapacity) {
      throw new BadRequestException(
        `Places insuffisantes (${seats} demandées, ${trip.maxCapacity - trip.seatsReserved} restantes).`,
      );
    }

    trip.seatsReserved += seats;
    trip.updatedByUserId = userId;
    const saved = await this.tripsRepository.save(trip);
    const [dtoOut] = await this.toDtos([saved], rules, userId);
    return dtoOut;
  }

  async updateDeparture(
    tripId: string,
    dto: UpdateVehicleTripDto,
    userId: string,
  ): Promise<VehicleTripDto> {
    const trip = await this.requireTrip(tripId);
    const rules = await this.loadRules();

    if (trip.createdByUserId !== userId) {
      throw new ForbiddenException(
        'Seul le premier réservant peut modifier l’heure de départ.',
      );
    }
    if (trip.status !== 'open') {
      throw new BadRequestException(
        'L’heure de départ ne peut plus être modifiée.',
      );
    }

    const canEdit = await this.canEditDeparture(trip, userId, rules);
    if (!canEdit) {
      throw new BadRequestException(
        'La modification de l’heure n’est plus autorisée pour ce trajet.',
      );
    }

    const departure = this.parseFutureDeparture(dto.departureDatetime);
    this.assertBeforePaymentClose(departure, rules);

    const travelDate = dateOnlyFromDatetime(departure);
    const previousDate = dateOnlyFromDatetime(trip.departureDatetime);
    if (travelDate !== previousDate) {
      await this.assertNoConflictingTrip(trip.vehicleId, travelDate, trip.id);
      const slot = await this.findAvailableSlot(trip.vehicleId, travelDate);
      if (!slot) {
        throw new BadRequestException(
          'Aucun créneau de disponibilité pour cette nouvelle date.',
        );
      }
      trip.availabilityId = slot.id;
    }

    trip.departureDatetime = departure;
    trip.updatedByUserId = userId;
    const saved = await this.tripsRepository.save(trip);
    const [dtoOut] = await this.toDtos([saved], rules, userId);
    return dtoOut;
  }

  /** Exported for checkout: price per person for headcount N on a route. */
  async resolvePriceForRoute(
    routeId: string,
    passengerCount: number,
  ): Promise<{ priceCents: number; currency: string }> {
    const route = await this.routesRepository.findOne({
      where: { id: routeId, deletedAt: IsNull() },
    });
    if (!route) {
      throw new NotFoundException('Tronçon introuvable.');
    }
    const tiers = await this.loadTiers(routeId);
    return {
      priceCents: resolveVehicleRoutePriceCents(
        passengerCount,
        tiers,
        route.priceCents,
      ),
      currency: route.currency,
    };
  }

  /**
   * Close open trips past H−N payment window and cancel unpaid seat bookings.
   * Seats reserved without a paid booking are released.
   */
  async closePastPaymentDeadlines(): Promise<{
    closedTrips: number;
    cancelledBookings: number;
  }> {
    const rules = await this.loadRules();
    const hours = rules.paymentCloseHoursBeforeDeparture;
    const horizon = new Date(Date.now() + hours * 60 * 60 * 1000);

    const candidates = await this.tripsRepository.find({
      where: {
        status: 'open',
        deletedAt: IsNull(),
        departureDatetime: LessThanOrEqual(horizon),
      },
      take: 100,
    });

    let closedTrips = 0;
    let cancelledBookings = 0;

    for (const trip of candidates) {
      const closesAt = this.paymentClosesAt(
        trip.departureDatetime,
        hours,
      );
      if (Date.now() < closesAt.getTime()) {
        continue;
      }

      const items = await this.bookingItemsRepository.find({
        where: { vehicleTripId: trip.id, deletedAt: IsNull() },
      });
      const bookingIds = [...new Set(items.map((item) => item.bookingId))];

      if (bookingIds.length > 0) {
        const bookings = await this.bookingsRepository.find({
          where: { id: In(bookingIds), deletedAt: IsNull() },
        });
        const payments = await this.paymentsRepository.find({
          where: {
            bookingId: In(bookingIds),
            status: 'succeeded',
            deletedAt: IsNull(),
          },
        });
        const paidBookingIds = new Set(payments.map((p) => p.bookingId));

        for (const booking of bookings) {
          if (paidBookingIds.has(booking.id)) {
            continue;
          }
          if (!UNPAID_BOOKING_STATUSES.includes(booking.status)) {
            continue;
          }
          try {
            await this.bookingEngine.cancelBooking(
              booking.id,
              undefined,
              `Clôture paiement H−${hours} trajet partagé`,
            );
            cancelledBookings += 1;
          } catch (err) {
            this.logger.warn(
              `Failed to cancel unpaid booking ${booking.id} for trip ${trip.id}: ${
                err instanceof Error ? err.message : err
              }`,
            );
          }
        }
      }

      const paidSeats = await this.sumPaidTripSeats(trip.id);
      trip.status = 'payment_closed';
      trip.seatsReserved = paidSeats;
      await this.tripsRepository.save(trip);
      closedTrips += 1;
      this.logger.log(
        `Trip ${trip.id} payment_closed (paid seats=${paidSeats})`,
      );
    }

    return { closedTrips, cancelledBookings };
  }

  private async sumPaidTripSeats(tripId: string): Promise<number> {
    const items = await this.bookingItemsRepository.find({
      where: { vehicleTripId: tripId, deletedAt: IsNull() },
    });
    if (!items.length) {
      return 0;
    }
    const bookingIds = [...new Set(items.map((item) => item.bookingId))];
    const payments = await this.paymentsRepository.find({
      where: {
        bookingId: In(bookingIds),
        status: 'succeeded',
        deletedAt: IsNull(),
      },
    });
    const paidBookingIds = new Set(payments.map((p) => p.bookingId));
    const bookings = await this.bookingsRepository.find({
      where: { id: In(bookingIds), deletedAt: IsNull() },
    });
    const activePaid = new Set(
      bookings
        .filter(
          (b) =>
            paidBookingIds.has(b.id) &&
            (b.status === 'confirmed' || b.status === 'pending_payment'),
        )
        .map((b) => b.id),
    );
    return items
      .filter((item) => activePaid.has(item.bookingId))
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  private async toDtos(
    trips: VehicleTrips[],
    rules: ResolvedVehicleSharedTrip,
    viewerUserId?: string,
  ): Promise<VehicleTripDto[]> {
    if (!trips.length) {
      return [];
    }

    const routeIds = [...new Set(trips.map((t) => t.routeId))];
    const routes = await this.routesRepository.find({
      where: { id: In(routeIds) },
    });
    const routeById = new Map(routes.map((r) => [r.id, r]));

    const tiersByRoute = new Map<
      string,
      Array<{ minPassengers: number; maxPassengers: number; priceCents: number }>
    >();
    for (const routeId of routeIds) {
      tiersByRoute.set(routeId, await this.loadTiers(routeId));
    }

    const paidTripIds = await this.loadTripsWithSucceededPayment(
      trips.map((t) => t.id),
    );

    const now = Date.now();
    return trips.map((trip) => {
      const route = routeById.get(trip.routeId);
      const tiers = tiersByRoute.get(trip.routeId) ?? [];
      const priceCentsPerPerson = resolveVehicleRoutePriceCents(
        trip.seatsReserved,
        tiers,
        route?.priceCents ?? 0,
      );
      const paymentClosesAt = this.paymentClosesAt(
        trip.departureDatetime,
        rules.paymentCloseHoursBeforeDeparture,
      );
      const beforeClose = now < paymentClosesAt.getTime();
      const seatsRemaining = Math.max(0, trip.maxCapacity - trip.seatsReserved);
      const isMine = Boolean(
        viewerUserId && trip.createdByUserId === viewerUserId,
      );
      const canJoin =
        !isMine &&
        trip.status === 'open' &&
        beforeClose &&
        seatsRemaining > 0;
      let canEditDeparture = false;
      if (isMine && trip.status === 'open' && beforeClose) {
        if (rules.departureTimeEditableUntil === 'until_payment_close') {
          canEditDeparture = true;
        } else {
          canEditDeparture = !paidTripIds.has(trip.id);
        }
      }

      return {
        id: trip.id,
        vehicleId: trip.vehicleId,
        routeId: trip.routeId,
        availabilityId: trip.availabilityId,
        departureDatetime: this.toIso(trip.departureDatetime),
        createdByUserId: trip.createdByUserId,
        maxCapacity: trip.maxCapacity,
        seatsReserved: trip.seatsReserved,
        seatsRemaining,
        status: trip.status,
        priceCentsPerPerson,
        currency: route?.currency ?? 'USD',
        departureCity: route?.departureCity ?? '',
        arrivalCity: route?.arrivalCity ?? '',
        paymentClosesAt: paymentClosesAt.toISOString(),
        canJoin,
        isMine,
        canEditDeparture,
        createdAt: this.toIso(trip.createdAt),
        updatedAt: trip.updatedAt ? this.toIso(trip.updatedAt) : null,
      };
    });
  }

  private async canEditDeparture(
    trip: VehicleTrips,
    userId: string,
    rules: ResolvedVehicleSharedTrip,
  ): Promise<boolean> {
    if (trip.createdByUserId !== userId || trip.status !== 'open') {
      return false;
    }
    const closesAt = this.paymentClosesAt(
      trip.departureDatetime,
      rules.paymentCloseHoursBeforeDeparture,
    );
    if (Date.now() >= closesAt.getTime()) {
      return false;
    }
    if (rules.departureTimeEditableUntil === 'until_payment_close') {
      return true;
    }
    const paid = await this.loadTripsWithSucceededPayment([trip.id]);
    return !paid.has(trip.id);
  }

  private async loadTripsWithSucceededPayment(
    tripIds: string[],
  ): Promise<Set<string>> {
    if (!tripIds.length) {
      return new Set();
    }
    const items = await this.bookingItemsRepository.find({
      where: { vehicleTripId: In(tripIds), deletedAt: IsNull() },
    });
    if (!items.length) {
      return new Set();
    }
    const bookingIds = [...new Set(items.map((item) => item.bookingId))];
    const payments = await this.paymentsRepository.find({
      where: {
        bookingId: In(bookingIds),
        status: 'succeeded',
        deletedAt: IsNull(),
      },
    });
    const paidBookingIds = new Set(payments.map((payment) => payment.bookingId));
    return new Set(
      items
        .filter(
          (item) =>
            item.vehicleTripId != null && paidBookingIds.has(item.bookingId),
        )
        .map((item) => item.vehicleTripId as string),
    );
  }

  private async loadTiers(
    routeId: string,
  ): Promise<
    Array<{ minPassengers: number; maxPassengers: number; priceCents: number }>
  > {
    const tiers = await this.tiersRepository.find({
      where: { routeId, deletedAt: IsNull() },
      order: { minPassengers: 'ASC', maxPassengers: 'ASC' },
    });
    return tiers.map((tier) => ({
      minPassengers: tier.minPassengers,
      maxPassengers: tier.maxPassengers,
      priceCents: tier.priceCents,
    }));
  }

  private async findAvailableSlot(
    vehicleId: string,
    travelDate: string,
  ): Promise<VehicleAvailability | null> {
    const slots = await this.availabilityRepository.find({
      where: { vehicleId, status: 'available', deletedAt: IsNull() },
      order: { startDatetime: 'ASC' },
    });
    return (
      slots.find((slot) =>
        slotCoversTravelDate(slot.startDatetime, slot.endDatetime, travelDate),
      ) ?? null
    );
  }

  private async assertNoConflictingTrip(
    vehicleId: string,
    travelDate: string,
    excludeTripId?: string,
  ): Promise<void> {
    const qb = this.tripsRepository
      .createQueryBuilder('trip')
      .where('trip.vehicleId = :vehicleId', { vehicleId })
      .andWhere('trip.deletedAt IS NULL')
      .andWhere('trip.status IN (:...statuses)', {
        statuses: ['open', 'payment_closed'],
      })
      .andWhere('DATE(trip.departureDatetime) = :travelDate', { travelDate });

    if (excludeTripId) {
      qb.andWhere('trip.id != :excludeTripId', { excludeTripId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new BadRequestException(
        'Un trajet existe déjà pour ce véhicule à cette date.',
      );
    }
  }

  private async requireTrip(id: string): Promise<VehicleTrips> {
    const trip = await this.tripsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!trip) {
      throw new NotFoundException('Trajet introuvable.');
    }
    return trip;
  }

  private async loadRules(): Promise<ResolvedVehicleSharedTrip> {
    return this.organizationSettingsService.getResolvedVehicleSharedTrip(
      PLATFORM_ORG_ID,
    );
  }

  private parseFutureDeparture(iso: string): Date {
    const departure = new Date(iso);
    if (Number.isNaN(departure.getTime())) {
      throw new BadRequestException('Date/heure de départ invalide.');
    }
    if (departure.getTime() <= Date.now()) {
      throw new BadRequestException(
        'L’heure de départ doit être dans le futur.',
      );
    }
    return departure;
  }

  private assertBeforePaymentClose(
    departure: Date,
    rules: ResolvedVehicleSharedTrip,
  ): void {
    const closesAt = this.paymentClosesAt(
      departure,
      rules.paymentCloseHoursBeforeDeparture,
    );
    if (Date.now() >= closesAt.getTime()) {
      throw new BadRequestException(
        `Les paiements et inscriptions sont clos ${rules.paymentCloseHoursBeforeDeparture} h avant le départ.`,
      );
    }
  }

  private paymentClosesAt(departure: Date | string, hoursBefore: number): Date {
    const dep = departure instanceof Date ? departure : new Date(departure);
    return new Date(dep.getTime() - hoursBefore * 60 * 60 * 1000);
  }

  private toIso(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
