import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { GapImpactStats } from '../../../entities/gap-impact-stat.entity';
import { CreateGapImpactStatDto } from './dto/create-gap-impact-stat.dto';
import { GapImpactStatsListQueryDto } from './dto/gap-impact-stats-list-query.dto';
import { UpdateGapImpactStatDto } from './dto/update-gap-impact-stat.dto';

@Injectable()
export class GapImpactStatsService extends CrudService<GapImpactStats> {
  constructor(
    @InjectRepository(GapImpactStats)
    private readonly statsRepository: Repository<GapImpactStats>,
  ) {
    super(statsRepository);
  }

  createFromDto(
    dto: CreateGapImpactStatDto,
    actorUserId?: string,
  ): Promise<GapImpactStats> {
    return super.create(dto as DeepPartial<GapImpactStats>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateGapImpactStatDto,
    actorUserId?: string,
  ): Promise<GapImpactStats> {
    return super.update(id, dto as DeepPartial<GapImpactStats>, actorUserId);
  }

  override async findAll(
    query: GapImpactStatsListQueryDto,
  ): Promise<PaginatedResult<GapImpactStats>> {
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
