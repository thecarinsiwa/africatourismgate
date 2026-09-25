import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { CruiseSailings, Itineraries } from '../../../entities/generated';
import { CruiseSailingsListQueryDto } from './dto/cruise-sailings-list-query.dto';

@Injectable()
export class CruiseSailingsService extends CrudService<CruiseSailings> {
  constructor(
    @InjectRepository(CruiseSailings)
    private readonly cruiseSailingsRepository: Repository<CruiseSailings>,
  ) {
    super(cruiseSailingsRepository);
  }

  override async findAll(
    query: CruiseSailingsListQueryDto,
  ): Promise<PaginatedResult<CruiseSailings>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.cruiseSailingsRepository
      .createQueryBuilder('sailing')
      .where('sailing.deletedAt IS NULL');

    if (query.itineraryId) {
      qb.andWhere('sailing.itineraryId = :itineraryId', {
        itineraryId: query.itineraryId,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.leftJoin(
        Itineraries,
        'itinerary',
        'itinerary.id = sailing.itineraryId AND itinerary.deletedAt IS NULL',
      ).andWhere(
        '(sailing.id LIKE :term OR sailing.itineraryId LIKE :term OR CAST(sailing.departureDate AS CHAR) LIKE :term OR itinerary.name LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('sailing.departureDate', 'ASC')
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
