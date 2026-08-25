import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivityItineraryStops } from '../../../entities/generated';
import { ActivityItineraryStopsListQueryDto } from './dto/activity-itinerary-stops-list-query.dto';

@Injectable()
export class ActivityItineraryStopsService extends CrudService<ActivityItineraryStops> {
  constructor(
    @InjectRepository(ActivityItineraryStops)
    private readonly activityItineraryStopsRepository: Repository<ActivityItineraryStops>,
  ) {
    super(activityItineraryStopsRepository);
  }

  override async findAll(
    query: ActivityItineraryStopsListQueryDto,
  ): Promise<PaginatedResult<ActivityItineraryStops>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.activityItineraryStopsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.activityId ? { activityId: query.activityId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { stopOrder: 'ASC', createdAt: 'DESC' },
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
