import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { ActivityItineraryStops } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivityItineraryStopsListQueryDto } from './dto/activity-itinerary-stops-list-query.dto';
import { CreateActivityItineraryStopDto } from './dto/create-activity-itinerary-stop.dto';
import { UpdateActivityItineraryStopDto } from './dto/update-activity-itinerary-stop.dto';

@Injectable()
export class ActivityItineraryStopsService extends CrudService<ActivityItineraryStops> {
  constructor(
    @InjectRepository(ActivityItineraryStops)
    private readonly activityItineraryStopsRepository: Repository<ActivityItineraryStops>,
  ) {
    super(activityItineraryStopsRepository);
  }

  createFromDto(
    dto: CreateActivityItineraryStopDto,
    actorUserId?: string,
  ): Promise<ActivityItineraryStops> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateActivityItineraryStopDto,
    actorUserId?: string,
  ): Promise<ActivityItineraryStops> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateActivityItineraryStopDto | UpdateActivityItineraryStopDto,
  ): DeepPartial<ActivityItineraryStops> {
    const { latitude, longitude, description, ...rest } = dto;
    const payload: DeepPartial<ActivityItineraryStops> = { ...rest };

    if (latitude !== undefined) {
      payload.latitude = String(latitude);
    }
    if (longitude !== undefined) {
      payload.longitude = String(longitude);
    }
    if (description !== undefined) {
      payload.description = description ?? null;
    }

    return payload;
  }

  override async findAll(
    query: ActivityItineraryStopsListQueryDto,
  ): Promise<PaginatedResult<ActivityItineraryStops>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<ActivityItineraryStops> = {};

    if (query.activityId) {
      where.activityId = query.activityId;
    }

    const [data, total] = await this.activityItineraryStopsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { stopOrder: 'ASC', createdAt: 'ASC' },
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
