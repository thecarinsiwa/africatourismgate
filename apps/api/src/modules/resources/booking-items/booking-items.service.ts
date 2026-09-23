import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { BookingItems, Bookings } from '../../../entities/generated';
import { BookingItemListItemDto } from './dto/booking-item-list-item.dto';
import { BookingItemsListQueryDto } from './dto/booking-items-list-query.dto';

type BookingItemListRow = Record<string, unknown>;

function pick(row: BookingItemListRow, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

function toInt(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toStringValue(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value);
}

@Injectable()
export class BookingItemsService extends CrudService<BookingItems> {
  constructor(
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
  ) {
    super(bookingItemsRepository);
  }

  async listForAdmin(
    query: BookingItemsListQueryDto,
  ): Promise<PaginatedResult<BookingItemListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const baseQb = this.bookingItemsRepository
      .createQueryBuilder('item')
      .innerJoin(Bookings, 'booking', 'booking.id = item.bookingId AND booking.deletedAt IS NULL')
      .where('item.deletedAt IS NULL');

    if (query.itemType) {
      baseQb.andWhere('item.itemType = :itemType', { itemType: query.itemType });
    }
    if (query.status) {
      baseQb.andWhere('booking.status = :status', { status: query.status });
    }
    if (query.bookingId) {
      baseQb.andWhere('item.bookingId = :bookingId', { bookingId: query.bookingId });
    }

    const total = await baseQb.clone().getCount();

    const rows = await baseQb
      .clone()
      .select('item.id', 'item_id')
      .addSelect('item.bookingId', 'item_bookingId')
      .addSelect('item.itemType', 'item_itemType')
      .addSelect('item.referenceId', 'item_referenceId')
      .addSelect('item.titleSnapshot', 'item_titleSnapshot')
      .addSelect('item.quantity', 'item_quantity')
      .addSelect('item.unitPriceCents', 'item_unitPriceCents')
      .addSelect('item.startDate', 'item_startDate')
      .addSelect('item.endDate', 'item_endDate')
      .addSelect('item.createdAt', 'item_createdAt')
      .addSelect('booking.status', 'booking_status')
      .addSelect('booking.currency', 'booking_currency')
      .orderBy('item.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<BookingItemListRow>();

    const data: BookingItemListItemDto[] = rows.map((row) => {
      const quantity = toInt(pick(row, 'item_quantity', 'quantity'));
      const unitPriceCents = toInt(
        pick(row, 'item_unitPriceCents', 'item_unit_price_cents', 'unitPriceCents'),
      );
      const createdAtRaw = pick(row, 'item_createdAt', 'item_created_at', 'createdAt');
      return {
        id: toStringValue(pick(row, 'item_id', 'id')),
        bookingId: toStringValue(pick(row, 'item_bookingId', 'item_booking_id', 'bookingId')),
        itemType: pick(row, 'item_itemType', 'item_item_type', 'itemType') as BookingItems['itemType'],
        referenceId: toStringValue(
          pick(row, 'item_referenceId', 'item_reference_id', 'referenceId'),
        ),
        titleSnapshot: toStringValue(
          pick(row, 'item_titleSnapshot', 'item_title_snapshot', 'titleSnapshot'),
        ),
        quantity,
        unitPriceCents,
        lineTotalCents: quantity * unitPriceCents,
        startDate: (pick(row, 'item_startDate', 'item_start_date', 'startDate') as string | null) ?? null,
        endDate: (pick(row, 'item_endDate', 'item_end_date', 'endDate') as string | null) ?? null,
        bookingStatus: pick(row, 'booking_status', 'status') as Bookings['status'],
        currency: toStringValue(pick(row, 'booking_currency', 'currency'), 'USD').trim() || 'USD',
        createdAt:
          createdAtRaw instanceof Date ? createdAtRaw : new Date(String(createdAtRaw ?? Date.now())),
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
