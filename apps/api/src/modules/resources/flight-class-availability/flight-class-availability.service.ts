import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { FlightClassAvailability } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { FlightClassAvailabilityListQueryDto } from './dto/flight-class-availability-list-query.dto';

@Injectable()
export class FlightClassAvailabilityService extends CrudService<FlightClassAvailability> {
  constructor(
    @InjectRepository(FlightClassAvailability)
    private readonly availabilityRepository: Repository<FlightClassAvailability>,
  ) {
    super(availabilityRepository);
  }

  override async findAll(
    query: FlightClassAvailabilityListQueryDto,
  ): Promise<PaginatedResult<FlightClassAvailability>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.availabilityRepository
      .createQueryBuilder('fca')
      .where('fca.deletedAt IS NULL')
      .andWhere('fca.flightClassId = :flightClassId', {
        flightClassId: query.flightClassId,
      });

    if (query.dateFrom) {
      qb.andWhere('fca.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('fca.date <= :dateTo', { dateTo: query.dateTo });
    }

    qb.orderBy('fca.date', 'ASC')
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
}
