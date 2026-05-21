import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  Activities,
  ActivitySchedules,
  BookingItems,
  Bookings,
  CabinAvailability,
  Cabins,
  FlightClassAvailability,
  FlightClasses,
  RoomAvailability,
  Rooms,
  VehicleAvailability,
  Vehicles,
} from '../../../entities/generated';
import { enumerateDates } from '../room-availability/room-availability-date.util';
import {
  BookingCheckoutDto,
  BookingCheckoutItemDto,
} from './dto/booking-checkout.dto';
import {
  BookingCheckoutLineDto,
  BookingCheckoutPreviewResponseDto,
} from './dto/booking-checkout-preview-response.dto';
import { BookingDetailDto } from './dto/booking-detail.dto';

type StockTarget =
  | { kind: 'room'; roomId: string; date: string }
  | { kind: 'flight_class'; flightClassId: string; date: string }
  | { kind: 'vehicle'; availabilityId: string }
  | { kind: 'cabin'; availabilityId: string }
  | { kind: 'activity_schedule'; scheduleId: string };

type ResolvedBookingLine = BookingCheckoutLineDto & { stock: StockTarget };

@Injectable()
export class BookingEngineService {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(RoomAvailability)
    private readonly roomAvailabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(FlightClassAvailability)
    private readonly flightAvailabilityRepository: Repository<FlightClassAvailability>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(VehicleAvailability)
    private readonly vehicleAvailabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(CabinAvailability)
    private readonly cabinAvailabilityRepository: Repository<CabinAvailability>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
  ) {}

  async previewCheckout(
    dto: BookingCheckoutDto,
    _userId: string,
  ): Promise<BookingCheckoutPreviewResponseDto> {
    const { lines, currency } = await this.resolveCheckoutLines(dto);
    const totalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
    return {
      lines: lines.map(({ stock: _s, ...rest }) => rest),
      totalCents,
      currency,
    };
  }

  async createBooking(
    dto: BookingCheckoutDto,
    userId: string,
    actorUserId?: string,
  ): Promise<BookingDetailDto> {
    const { lines, currency } = await this.resolveCheckoutLines(dto);
    const totalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

    const bookingId = await this.bookingsRepository.manager.transaction(
      async (manager) => {
        await this.allocateStock(manager, lines, 'decrement', actorUserId);

        const bookingsRepo = manager.getRepository(Bookings);
        const itemsRepo = manager.getRepository(BookingItems);
        const id = newId();

        const booking = bookingsRepo.create({
          id,
          userId,
          status: 'pending_payment',
          totalCents,
          currency,
          createdByUserId: actorUserId ?? null,
        } as Bookings);
        await bookingsRepo.save(booking);

        for (const line of lines) {
          const item = itemsRepo.create({
            id: newId(),
            bookingId: id,
            itemType: line.itemType,
            referenceId: line.referenceId,
            titleSnapshot: line.titleSnapshot,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            startDate: line.startDate,
            endDate: line.endDate,
            createdByUserId: actorUserId ?? null,
          } as BookingItems);
          await itemsRepo.save(item);
        }

        return id;
      },
    );

    return this.getBookingDetail(bookingId);
  }

  async confirmBooking(id: string, actorUserId?: string): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        `Impossible de confirmer une réservation au statut « ${booking.status} ».`,
      );
    }
    booking.status = 'confirmed';
    booking.updatedByUserId = actorUserId ?? null;
    await this.bookingsRepository.save(booking);
    return this.getBookingDetail(id);
  }

  async cancelBooking(id: string, actorUserId?: string): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    if (booking.status !== 'pending_payment' && booking.status !== 'confirmed') {
      throw new BadRequestException(
        `Impossible d'annuler une réservation au statut « ${booking.status} ».`,
      );
    }

    await this.bookingsRepository.manager.transaction(async (manager) => {
      const items = await manager.getRepository(BookingItems).find({
        where: { bookingId: id },
      });
      const lines = await this.bookingItemsToResolvedLines(manager, items);
      if (lines.length > 0) {
        await this.allocateStock(manager, lines, 'restore', actorUserId);
      }

      const bookingsRepo = manager.getRepository(Bookings);
      const row = await bookingsRepo.findOne({ where: { id } });
      if (!row) throw new NotFoundException('Réservation introuvable.');
      row.status = 'cancelled';
      row.updatedByUserId = actorUserId ?? null;
      await bookingsRepo.save(row);
    });

    return this.getBookingDetail(id);
  }

  async getBookingDetail(id: string): Promise<BookingDetailDto> {
    const booking = await this.findBookingOrThrow(id);
    const items = await this.bookingItemsRepository
      .createQueryBuilder('bi')
      .where('bi.bookingId = :bookingId', { bookingId: id })
      .andWhere('bi.deletedAt IS NULL')
      .orderBy('bi.startDate', 'ASC')
      .addOrderBy('bi.createdAt', 'ASC')
      .getMany();

    return {
      booking,
      items,
      totalCents: booking.totalCents,
      currency: booking.currency,
    };
  }

  private async resolveCheckoutLines(
    dto: BookingCheckoutDto,
  ): Promise<{ lines: ResolvedBookingLine[]; currency: string }> {
    const requestedCurrency = (dto.currency ?? 'USD').trim().toUpperCase();
    const lines: ResolvedBookingLine[] = [];

    for (const item of dto.items) {
      const resolved = await this.resolveItem(item);
      lines.push(...resolved);
    }

    if (lines.length === 0) {
      throw new BadRequestException('Au moins un item réservable est requis.');
    }

    const currencies = new Set(lines.map((l) => l.currency));
    if (currencies.size > 1) {
      throw new BadRequestException(
        'Tous les items doivent utiliser la même devise.',
      );
    }

    const lineCurrency = [...currencies][0];
    if (lineCurrency !== requestedCurrency) {
      throw new BadRequestException(
        `La devise demandée (${requestedCurrency}) ne correspond pas à celle des produits (${lineCurrency}).`,
      );
    }

    return { lines, currency: lineCurrency };
  }

  private async resolveItem(item: BookingCheckoutItemDto): Promise<ResolvedBookingLine[]> {
    switch (item.itemType) {
      case 'room':
        return this.resolveRoomItem(item);
      case 'flight_class':
        return this.resolveFlightClassItem(item);
      case 'vehicle':
        return this.resolveVehicleItem(item);
      case 'cabin':
        return this.resolveCabinItem(item);
      case 'activity_schedule':
        return this.resolveActivityScheduleItem(item);
      default:
        throw new BadRequestException('Type d’item non supporté.');
    }
  }

  private async resolveRoomItem(item: BookingCheckoutItemDto): Promise<ResolvedBookingLine[]> {
    if (!item.startDate || !item.endDate) {
      throw new BadRequestException('startDate et endDate sont requis pour une chambre.');
    }

    const room = await this.roomsRepository.findOne({ where: { id: item.referenceId } });
    if (!room || room.deletedAt) {
      throw new NotFoundException(`Chambre introuvable : ${item.referenceId}.`);
    }

    const lines: ResolvedBookingLine[] = [];
    const dates = enumerateDates(item.startDate, item.endDate);

    for (const date of dates) {
      const availability = await this.roomAvailabilityRepository.findOne({
        where: { roomId: item.referenceId, date },
      });
      if (!availability || availability.deletedAt) {
        throw new BadRequestException(
          `Aucune disponibilité pour ${room.name} le ${date}.`,
        );
      }
      if (availability.availableUnits < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${room.name} le ${date} (demandé: ${item.quantity}, disponible: ${availability.availableUnits}).`,
        );
      }

      const unitPriceCents = availability.priceCents;
      lines.push({
        itemType: 'room',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: room.name,
        currency: room.currency,
        startDate: date,
        endDate: date,
        stock: { kind: 'room', roomId: item.referenceId, date },
      });
    }

    return lines;
  }

  private async resolveFlightClassItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    if (!item.date) {
      throw new BadRequestException('date est requis pour une classe de vol.');
    }

    const flightClass = await this.flightClassesRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!flightClass || flightClass.deletedAt) {
      throw new NotFoundException(`Classe de vol introuvable : ${item.referenceId}.`);
    }

    const availability = await this.flightAvailabilityRepository.findOne({
      where: { flightClassId: item.referenceId, date: item.date },
    });
    if (!availability || availability.deletedAt) {
      throw new BadRequestException(
        `Aucune disponibilité pour la classe ${flightClass.className} le ${item.date}.`,
      );
    }
    if (availability.availableSeats < item.quantity) {
      throw new BadRequestException(
        `Sièges insuffisants (${item.quantity} demandés, ${availability.availableSeats} disponibles).`,
      );
    }

    const unitPriceCents = availability.priceCents;
    const title = `Vol ${flightClass.className} (${item.date})`;

    return [
      {
        itemType: 'flight_class',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: title,
        currency: 'USD',
        startDate: item.date,
        endDate: item.date,
        stock: {
          kind: 'flight_class',
          flightClassId: item.referenceId,
          date: item.date,
        },
      },
    ];
  }

  private async resolveVehicleItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    const slot = await this.vehicleAvailabilityRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!slot || slot.deletedAt) {
      throw new NotFoundException(`Créneau véhicule introuvable : ${item.referenceId}.`);
    }
    if (item.quantity !== 1) {
      throw new BadRequestException('La réservation véhicule accepte une quantité de 1 par créneau.');
    }
    if (slot.status !== 'available') {
      throw new BadRequestException('Le véhicule n’est pas disponible sur ce créneau.');
    }

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: slot.vehicleId },
    });
    if (!vehicle || vehicle.deletedAt) {
      throw new NotFoundException('Véhicule introuvable.');
    }

    const unitPriceCents = vehicle.dailyPriceCents;
    const startIso = slot.startDatetime instanceof Date
      ? slot.startDatetime.toISOString().slice(0, 10)
      : String(slot.startDatetime).slice(0, 10);
    const endIso = slot.endDatetime instanceof Date
      ? slot.endDatetime.toISOString().slice(0, 10)
      : String(slot.endDatetime).slice(0, 10);

    return [
      {
        itemType: 'vehicle',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: vehicle.licensePlate?.trim() || `Véhicule ${vehicle.id.slice(0, 8)}`,
        currency: vehicle.currency,
        startDate: startIso,
        endDate: endIso,
        stock: { kind: 'vehicle', availabilityId: item.referenceId },
      },
    ];
  }

  private async resolveCabinItem(item: BookingCheckoutItemDto): Promise<ResolvedBookingLine[]> {
    const availability = await this.cabinAvailabilityRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!availability || availability.deletedAt) {
      throw new NotFoundException(`Disponibilité cabine introuvable : ${item.referenceId}.`);
    }
    if (availability.availableCount < item.quantity) {
      throw new BadRequestException(
        `Cabines insuffisantes (${item.quantity} demandées, ${availability.availableCount} disponibles).`,
      );
    }

    const cabin = await this.cabinsRepository.findOne({
      where: { id: availability.cabinId },
    });
    if (!cabin || cabin.deletedAt) {
      throw new NotFoundException('Cabine introuvable.');
    }

    const unitPriceCents = availability.priceCents;

    return [
      {
        itemType: 'cabin',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: cabin.categoryName,
        currency: cabin.currency,
        startDate: null,
        endDate: null,
        stock: { kind: 'cabin', availabilityId: item.referenceId },
      },
    ];
  }

  private async resolveActivityScheduleItem(
    item: BookingCheckoutItemDto,
  ): Promise<ResolvedBookingLine[]> {
    const schedule = await this.activitySchedulesRepository.findOne({
      where: { id: item.referenceId },
    });
    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException(`Créneau activité introuvable : ${item.referenceId}.`);
    }

    const remaining = schedule.capacity - schedule.bookedCount;
    if (remaining < item.quantity) {
      throw new BadRequestException(
        `Places insuffisantes (${item.quantity} demandées, ${remaining} restantes).`,
      );
    }

    const activity = await this.activitiesRepository.findOne({
      where: { id: schedule.activityId },
    });
    if (!activity || activity.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }

    const unitPriceCents = activity.priceCents;
    const dateIso = schedule.startDatetime instanceof Date
      ? schedule.startDatetime.toISOString().slice(0, 10)
      : String(schedule.startDatetime).slice(0, 10);

    return [
      {
        itemType: 'activity_schedule',
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents: item.quantity * unitPriceCents,
        titleSnapshot: activity.title,
        currency: activity.currency,
        startDate: dateIso,
        endDate: dateIso,
        stock: { kind: 'activity_schedule', scheduleId: item.referenceId },
      },
    ];
  }

  private async allocateStock(
    manager: EntityManager,
    lines: ResolvedBookingLine[],
    direction: 'decrement' | 'restore',
    actorUserId?: string,
  ): Promise<void> {
    for (const line of lines) {
      await this.applyStockChange(manager, line.stock, line.quantity, direction, actorUserId);
    }
  }

  private async applyStockChange(
    manager: EntityManager,
    stock: StockTarget,
    quantity: number,
    direction: 'decrement' | 'restore',
    actorUserId?: string,
  ): Promise<void> {
    const delta = direction === 'decrement' ? -1 : 1;

    switch (stock.kind) {
      case 'room': {
        const repo = manager.getRepository(RoomAvailability);
        const row = await repo.findOne({
          where: { roomId: stock.roomId, date: stock.date },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException(
            `Disponibilité chambre introuvable le ${stock.date}.`,
          );
        }
        const next = row.availableUnits + delta * quantity;
        if (next < 0) {
          throw new BadRequestException(`Stock chambre insuffisant le ${stock.date}.`);
        }
        row.availableUnits = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'flight_class': {
        const repo = manager.getRepository(FlightClassAvailability);
        const row = await repo.findOne({
          where: { flightClassId: stock.flightClassId, date: stock.date },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException(
            `Disponibilité vol introuvable le ${stock.date}.`,
          );
        }
        const next = row.availableSeats + delta * quantity;
        if (next < 0) {
          throw new BadRequestException(`Sièges insuffisants le ${stock.date}.`);
        }
        row.availableSeats = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'vehicle': {
        const repo = manager.getRepository(VehicleAvailability);
        const row = await repo.findOne({
          where: { id: stock.availabilityId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException('Créneau véhicule introuvable.');
        }
        if (direction === 'decrement') {
          if (row.status !== 'available') {
            throw new BadRequestException('Véhicule déjà indisponible.');
          }
          row.status = 'rented';
        } else {
          row.status = 'available';
        }
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'cabin': {
        const repo = manager.getRepository(CabinAvailability);
        const row = await repo.findOne({
          where: { id: stock.availabilityId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException('Disponibilité cabine introuvable.');
        }
        const next = row.availableCount + delta * quantity;
        if (next < 0) {
          throw new BadRequestException('Cabines insuffisantes.');
        }
        row.availableCount = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      case 'activity_schedule': {
        const repo = manager.getRepository(ActivitySchedules);
        const row = await repo.findOne({
          where: { id: stock.scheduleId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row || row.deletedAt) {
          throw new BadRequestException('Créneau activité introuvable.');
        }
        const next = row.bookedCount + delta * quantity;
        if (next < 0 || next > row.capacity) {
          throw new BadRequestException('Capacité activité invalide.');
        }
        row.bookedCount = next;
        row.updatedByUserId = actorUserId ?? null;
        await repo.save(row);
        break;
      }
      default:
        break;
    }
  }

  private async bookingItemsToResolvedLines(
    manager: EntityManager,
    items: BookingItems[],
  ): Promise<ResolvedBookingLine[]> {
    const active = items.filter((i) => !i.deletedAt);
    const lines: ResolvedBookingLine[] = [];

    for (const item of active) {
      const lineTotalCents = item.quantity * item.unitPriceCents;
      const base: BookingCheckoutLineDto = {
        itemType: item.itemType,
        referenceId: item.referenceId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents,
        titleSnapshot: item.titleSnapshot,
        currency: 'USD',
        startDate: item.startDate,
        endDate: item.endDate,
      };

      switch (item.itemType) {
        case 'room': {
          const date = item.startDate;
          if (!date) break;
          lines.push({
            ...base,
            stock: { kind: 'room', roomId: item.referenceId, date },
          });
          break;
        }
        case 'flight_class': {
          const date = item.startDate;
          if (!date) break;
          lines.push({
            ...base,
            stock: {
              kind: 'flight_class',
              flightClassId: item.referenceId,
              date,
            },
          });
          break;
        }
        case 'vehicle':
          lines.push({
            ...base,
            stock: { kind: 'vehicle', availabilityId: item.referenceId },
          });
          break;
        case 'cabin':
          lines.push({
            ...base,
            stock: { kind: 'cabin', availabilityId: item.referenceId },
          });
          break;
        case 'activity_schedule':
          lines.push({
            ...base,
            stock: { kind: 'activity_schedule', scheduleId: item.referenceId },
          });
          break;
        default:
          break;
      }
    }

    return lines;
  }

  private async findBookingOrThrow(id: string): Promise<Bookings> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking || booking.deletedAt) {
      throw new NotFoundException('Réservation introuvable.');
    }
    return booking;
  }
}
