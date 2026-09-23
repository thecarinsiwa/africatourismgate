import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { BookingItems, Bookings } from '../../../entities/generated';
import { BookingItemListItemDto } from './dto/booking-item-list-item.dto';
import { BookingItemsListQueryDto } from './dto/booking-items-list-query.dto';

@Injectable()
export class BookingItemsService extends CrudService<BookingItems> {
  constructor(
    @InjectRepository(BookingItems)
    repository: Repository<BookingItems>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
  ) {
    super(repository);
  }

  async listForAdmin(
    query: BookingItemsListQueryDto,
  ): Promise<PaginatedResult<BookingItemListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repository
      .createQueryBuilder('item')
      .innerJoin(Bookings, 'booking', 'booking.id = item.bookingId AND booking.deletedAt IS NULL')
      .where('item.deletedAt IS NULL');

    if (query.itemType) {
      qb.andWhere('item.itemType = :itemType', { itemType: query.itemType });
    }
    if (query.status) {
      qb.andWhere('booking.status = :status', { status: query.status });
    }
    if (query.bookingId) {
      qb.andWhere('item.bookingId = :bookingId', { bookingId: query.bookingId });
    }

    qb.orderBy('item.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    const bookingIds = [...new Set(rows.map((row) => row.bookingId))];
    const bookings =
      bookingIds.length > 0
        ? await this.bookingsRepository
            .createQueryBuilder('booking')
            .select(['booking.id', 'booking.status', 'booking.currency'])
            .where('booking.id IN (:...bookingIds)', { bookingIds })
            .getMany()
        : [];
    const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));

    const data: BookingItemListItemDto[] = rows.map((item) => {
      const booking = bookingById.get(item.bookingId);
      return {
        id: item.id,
        bookingId: item.bookingId,
        itemType: item.itemType,
        referenceId: item.referenceId,
        titleSnapshot: item.titleSnapshot,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.quantity * item.unitPriceCents,
        startDate: item.startDate,
        endDate: item.endDate,
        bookingStatus: booking?.status ?? 'draft',
        currency: booking?.currency ?? 'USD',
        createdAt: item.createdAt,
      };
    });

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
}
