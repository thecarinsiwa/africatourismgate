import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Airports } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { AirportsListQueryDto } from './dto/airports-list-query.dto';

@Injectable()
export class AirportsService extends CrudService<Airports> {
  constructor(
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
  ) {
    super(airportsRepository);
  }

  override async findAll(
    query: AirportsListQueryDto,
  ): Promise<PaginatedResult<Airports>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.airportsRepository
      .createQueryBuilder('airport')
      .where('airport.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(airport.iataCode LIKE :term OR airport.name LIKE :term OR airport.city LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('airport.createdAt', 'DESC')
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
