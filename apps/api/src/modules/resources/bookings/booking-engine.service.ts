import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  BookingItems,
  Bookings,
  RoomAvailability,
  Rooms,
} from '../../../entities/generated';
import { enumerateDates } from '../room-availability/room-availability-date.util';
import { BookingCheckoutDto } from './dto/booking-checkout.dto';
import {
  BookingCheckoutLineDto,
  BookingCheckoutPreviewResponseDto,
} from './dto/booking-checkout-preview-response.dto';
import { BookingDetailDto } from './dto/booking-detail.dto';

type ResolvedNightLine = BookingCheckoutLineDto & {
  availabilityId: string;
};

@Injectable()
export class BookingEngineService {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(RoomAvailability)
    private readonly availabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
  ) {}

  async previewCheckout(
    dto: BookingCheckoutDto,
    _userId: string,
  ): Promise<BookingCheckoutPreviewResponseDto> {
    const { lines, currency } = await this.resolveCheckoutLines(dto);
    const totalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
    return {
      lines: lines.map(({ availabilityId: _a, ...rest }) => rest),
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
        await this.allocateRoomStock(manager, lines, 'decrement', actorUserId);

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
            itemType: 'room',
            referenceId: line.roomId,
            titleSnapshot: line.titleSnapshot,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            startDate: line.date,
            endDate: line.date,
            createdByUserId: actorUserId ?? null,
          });
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
      const roomLines = await this.bookingItemsToResolvedLines(manager, items);
      if (roomLines.length > 0) {
        await this.allocateRoomStock(manager, roomLines, 'restore', actorUserId);
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
  ): Promise<{ lines: ResolvedNightLine[]; currency: string }> {
    const requestedCurrency = (dto.currency ?? 'USD').trim().toUpperCase();
    const lines: ResolvedNightLine[] = [];

    for (const item of dto.items) {
      const room = await this.roomsRepository.findOne({
        where: { id: item.roomId },
      });
      if (!room || room.deletedAt) {
        throw new NotFoundException(`Chambre introuvable : ${item.roomId}.`);
      }

      const dates = enumerateDates(item.startDate, item.endDate);

      for (const date of dates) {
        const availability = await this.availabilityRepository.findOne({
          where: { roomId: item.roomId, date },
        });

        if (!availability || availability.deletedAt) {
          throw new BadRequestException(
            `Aucune disponibilité pour la chambre ${room.name} le ${date}.`,
          );
        }

        if (availability.availableUnits < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${room.name} le ${date} (demandé: ${item.quantity}, disponible: ${availability.availableUnits}).`,
          );
        }

        const lineTotalCents = item.quantity * availability.priceCents;
        lines.push({
          roomId: item.roomId,
          date,
          quantity: item.quantity,
          unitPriceCents: availability.priceCents,
          lineTotalCents,
          titleSnapshot: room.name,
          currency: room.currency,
          availabilityId: availability.id,
        });
      }
    }

    if (lines.length === 0) {
      throw new BadRequestException('Au moins une nuit réservable est requise.');
    }

    const currencies = new Set(lines.map((l) => l.currency));
    if (currencies.size > 1) {
      throw new BadRequestException(
        'Toutes les chambres doivent utiliser la même devise.',
      );
    }

    const lineCurrency = [...currencies][0];
    if (lineCurrency !== requestedCurrency) {
      throw new BadRequestException(
        `La devise demandée (${requestedCurrency}) ne correspond pas à celle des chambres (${lineCurrency}).`,
      );
    }

    return { lines, currency: lineCurrency };
  }

  private async allocateRoomStock(
    manager: EntityManager,
    lines: ResolvedNightLine[],
    direction: 'decrement' | 'restore',
    actorUserId?: string,
  ): Promise<void> {
    const repo = manager.getRepository(RoomAvailability);
    const delta = direction === 'decrement' ? -1 : 1;

    for (const line of lines) {
      const row = await repo.findOne({
        where: { roomId: line.roomId, date: line.date },
        lock: { mode: 'pessimistic_write' },
      });

      if (!row || row.deletedAt) {
        throw new BadRequestException(
          `Disponibilité introuvable pour ${line.roomId} le ${line.date}.`,
        );
      }

      const nextUnits = row.availableUnits + delta * line.quantity;
      if (nextUnits < 0) {
        throw new BadRequestException(
          `Stock insuffisant pour ${line.titleSnapshot} le ${line.date}.`,
        );
      }

      row.availableUnits = nextUnits;
      row.updatedByUserId = actorUserId ?? null;
      await repo.save(row);
    }
  }

  private async bookingItemsToResolvedLines(
    manager: EntityManager,
    items: BookingItems[],
  ): Promise<ResolvedNightLine[]> {
    const roomItems = items.filter(
      (i) => i.itemType === 'room' && !i.deletedAt,
    );
    const lines: ResolvedNightLine[] = [];
    const availRepo = manager.getRepository(RoomAvailability);

    for (const item of roomItems) {
      const date = item.startDate;
      if (!date) continue;

      const availability = await availRepo.findOne({
        where: { roomId: item.referenceId, date },
      });

      lines.push({
        roomId: item.referenceId,
        date,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.quantity * item.unitPriceCents,
        titleSnapshot: item.titleSnapshot,
        currency: 'USD',
        availabilityId: availability?.id ?? '',
      });
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
