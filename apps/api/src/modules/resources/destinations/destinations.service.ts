import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Destinations } from '../../../entities/generated';
import { DestinationsListQueryDto } from './dto/destinations-list-query.dto';

@Injectable()
export class DestinationsService extends CrudService<Destinations> {
  constructor(
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {
    super(destinationsRepository);
  }

  override async findAll(
    query: DestinationsListQueryDto,
  ): Promise<PaginatedResult<Destinations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.destinationsRepository
      .createQueryBuilder('destination')
      .where('destination.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(destination.name LIKE :term OR destination.slug LIKE :term OR destination.countryCode LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.isFeatured !== undefined) {
      qb.andWhere('destination.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured ? 1 : 0,
      });
    }

    qb.orderBy('destination.createdAt', 'DESC')
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
