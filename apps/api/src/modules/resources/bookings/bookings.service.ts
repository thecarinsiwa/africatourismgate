import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Bookings, Users } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingDetailDto } from './dto/booking-detail.dto';
import { BookingListItemDto } from './dto/booking-list-item.dto';
import { BookingsListQueryDto } from './dto/bookings-list-query.dto';

@Injectable()
export class BookingsService extends CrudService<Bookings> {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly bookingEngine: BookingEngineService,
  ) {
    super(bookingsRepository);
  }

  async list(
    query: BookingsListQueryDto,
  ): Promise<PaginatedResult<BookingListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('booking.status = :status', { status: query.status });
    }
    if (query.userId) {
      qb.andWhere('booking.userId = :userId', { userId: query.userId });
    }
    if (query.dateFrom) {
      qb.andWhere('booking.createdAt >= :dateFrom', {
        dateFrom: `${query.dateFrom}T00:00:00.000Z`,
      });
    }
    if (query.dateTo) {
      qb.andWhere('booking.createdAt <= :dateTo', {
        dateTo: `${query.dateTo}T23:59:59.999Z`,
      });
    }
    if (query.organizationId) {
      qb.innerJoin(
        Users,
        'client',
        'client.id = booking.userId AND client.deletedAt IS NULL',
      );
      qb.andWhere('client.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    qb.orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [bookings, total] = await qb.getManyAndCount();
    const userIds = [...new Set(bookings.map((b) => b.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({
            where: { id: In(userIds) },
          })
        : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    const data = bookings.map((booking) => {
      const client = userById.get(booking.userId);
      return {
        id: booking.id,
        userId: booking.userId,
        status: booking.status,
        totalCents: booking.totalCents,
        currency: booking.currency,
        promoCodeId: booking.promoCodeId,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        clientEmail: client?.email ?? '—',
        clientFirstName: client?.firstName ?? '',
        clientLastName: client?.lastName ?? '',
        organizationId: client?.organizationId ?? null,
      } satisfies BookingListItemDto;
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

  getDetail(id: string): Promise<BookingDetailDto> {
    return this.bookingEngine.getBookingDetail(id);
  }
}
