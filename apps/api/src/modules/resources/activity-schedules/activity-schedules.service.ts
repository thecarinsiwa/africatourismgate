import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivitySchedules } from '../../../entities/generated';
import { ActivitySchedulesListQueryDto } from './dto/activity-schedules-list-query.dto';

@Injectable()
export class ActivitySchedulesService extends CrudService<ActivitySchedules> {
  constructor(
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
  ) {
    super(activitySchedulesRepository);
  }

  override async findAll(
    query: ActivitySchedulesListQueryDto,
  ): Promise<PaginatedResult<ActivitySchedules>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.activitySchedulesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.activityId ? { activityId: query.activityId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { startDatetime: 'ASC', createdAt: 'DESC' },
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
