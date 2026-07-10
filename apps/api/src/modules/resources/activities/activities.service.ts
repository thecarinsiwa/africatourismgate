import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Activities } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivitiesListQueryDto } from './dto/activities-list-query.dto';

@Injectable()
export class ActivitiesService extends CrudService<Activities> {
  constructor(
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
  ) {
    super(activitiesRepository);
  }

  override async findAll(
    query: ActivitiesListQueryDto,
  ): Promise<PaginatedResult<Activities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.deletedAt IS NULL');

    if (query.destinationId) {
      qb.innerJoin(
        'activity_providers',
        'provider',
        'provider.id = activity.providerId AND provider.deletedAt IS NULL',
      ).andWhere('provider.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    if (query.providerId) {
      qb.andWhere('activity.providerId = :providerId', {
        providerId: query.providerId,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('activity.title LIKE :term', { term: `%${search}%` });
    }

    qb.orderBy('activity.createdAt', 'DESC')
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
