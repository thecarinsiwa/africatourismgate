import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { CruiseSailings } from '../../../entities/generated';
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

    const [data, total] = await this.cruiseSailingsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.itineraryId ? { itineraryId: query.itineraryId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { departureDate: 'ASC' },
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
