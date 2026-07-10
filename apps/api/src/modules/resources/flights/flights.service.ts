import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Flights } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { FlightsListQueryDto } from './dto/flights-list-query.dto';

@Injectable()
export class FlightsService extends CrudService<Flights> {
  constructor(
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
  ) {
    super(flightsRepository);
  }

  override async findAll(
    query: FlightsListQueryDto,
  ): Promise<PaginatedResult<Flights>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.flightsRepository
      .createQueryBuilder('flight')
      .where('flight.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('flight.flightNumber LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('flight.createdAt', 'DESC')
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
