import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { GapActivities } from '../../../entities/gap-activity.entity';
import { CreateGapActivityDto } from './dto/create-gap-activity.dto';
import { GapActivitiesListQueryDto } from './dto/gap-activities-list-query.dto';
import { UpdateGapActivityDto } from './dto/update-gap-activity.dto';

@Injectable()
export class GapActivitiesService extends CrudService<GapActivities> {
  constructor(
    @InjectRepository(GapActivities)
    private readonly activitiesRepository: Repository<GapActivities>,
  ) {
    super(activitiesRepository);
  }

  createFromDto(
    dto: CreateGapActivityDto,
    actorUserId?: string,
  ): Promise<GapActivities> {
    return super.create(dto as DeepPartial<GapActivities>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateGapActivityDto,
    actorUserId?: string,
  ): Promise<GapActivities> {
    return super.update(id, dto as DeepPartial<GapActivities>, actorUserId);
  }

  override async findAll(
    query: GapActivitiesListQueryDto,
  ): Promise<PaginatedResult<GapActivities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(activity.title LIKE :term OR activity.description LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.locale) {
      qb.andWhere('activity.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('activity.status = :status', { status: query.status });
    }

    qb.orderBy('activity.sortOrder', 'ASC')
      .addOrderBy('activity.title', 'ASC')
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
