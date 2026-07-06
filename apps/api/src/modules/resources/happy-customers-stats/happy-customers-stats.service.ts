import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { HappyCustomersStats } from '../../../entities/happy-customers-stat.entity';
import { CreateHappyCustomersStatDto } from './dto/create-happy-customers-stat.dto';
import { HappyCustomersStatsListQueryDto } from './dto/happy-customers-stats-list-query.dto';
import { UpdateHappyCustomersStatDto } from './dto/update-happy-customers-stat.dto';

@Injectable()
export class HappyCustomersStatsService extends CrudService<HappyCustomersStats> {
  constructor(
    @InjectRepository(HappyCustomersStats)
    private readonly statsRepository: Repository<HappyCustomersStats>,
  ) {
    super(statsRepository);
  }

  createFromDto(
    dto: CreateHappyCustomersStatDto,
    actorUserId?: string,
  ): Promise<HappyCustomersStats> {
    return super.create(dto as DeepPartial<HappyCustomersStats>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateHappyCustomersStatDto,
    actorUserId?: string,
  ): Promise<HappyCustomersStats> {
    return super.update(id, dto as DeepPartial<HappyCustomersStats>, actorUserId);
  }

  override async findAll(
    query: HappyCustomersStatsListQueryDto,
  ): Promise<PaginatedResult<HappyCustomersStats>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.statsRepository
      .createQueryBuilder('stat')
      .where('stat.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('stat.label LIKE :term', { term: `%${search}%` });
    }

    if (query.locale) {
      qb.andWhere('stat.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('stat.status = :status', { status: query.status });
    }

    qb.orderBy('stat.sortOrder', 'ASC')
      .addOrderBy('stat.label', 'ASC')
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
