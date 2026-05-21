import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Bookings } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingDetailDto } from './dto/booking-detail.dto';
import { BookingsListQueryDto } from './dto/bookings-list-query.dto';

@Injectable()
export class BookingsService extends CrudService<Bookings> {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    private readonly bookingEngine: BookingEngineService,
  ) {
    super(bookingsRepository);
  }

  override async findAll(
    query: BookingsListQueryDto,
  ): Promise<PaginatedResult<Bookings>> {
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

    qb.orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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
