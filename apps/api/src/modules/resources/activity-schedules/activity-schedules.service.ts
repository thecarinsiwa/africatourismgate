import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Activities,
  ActivityProviders,
  ActivitySchedules,
} from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivitySchedulesListQueryDto } from './dto/activity-schedules-list-query.dto';
import { CreateActivityScheduleDto } from './dto/create-activity-schedule.dto';
import { UpdateActivityScheduleDto } from './dto/update-activity-schedule.dto';

@Injectable()
export class ActivitySchedulesService extends CrudService<ActivitySchedules> {
  constructor(
    @InjectRepository(ActivitySchedules)
    private readonly schedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
  ) {
    super(schedulesRepository);
  }

  override async findAll(
    query: ActivitySchedulesListQueryDto,
  ): Promise<PaginatedResult<ActivitySchedules>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.schedulesRepository
      .createQueryBuilder('sched')
      .where('sched.deletedAt IS NULL');

    if (query.activityId) {
      qb.andWhere('sched.activityId = :activityId', { activityId: query.activityId });
    }

    if (query.destinationId) {
      qb.innerJoin(Activities, 'act', 'act.id = sched.activityId AND act.deletedAt IS NULL')
        .innerJoin(
          ActivityProviders,
          'ap',
          'ap.id = act.providerId AND ap.deletedAt IS NULL',
        )
        .andWhere('ap.destinationId = :destinationId', {
          destinationId: query.destinationId,
        });
    }

    qb.orderBy('sched.startDatetime', 'ASC')
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

  createSchedule(
    dto: CreateActivityScheduleDto,
    actorUserId?: string,
  ): Promise<ActivitySchedules> {
    return this.assertActivityExists(dto.activityId).then(() =>
      super.create(
        {
          activityId: dto.activityId,
          startDatetime: new Date(dto.startDatetime),
          capacity: dto.capacity,
          bookedCount: 0,
        } as DeepPartial<ActivitySchedules>,
        actorUserId,
      ),
    );
  }

  updateSchedule(
    id: string,
    dto: UpdateActivityScheduleDto,
    actorUserId?: string,
  ): Promise<ActivitySchedules> {
    const payload: DeepPartial<ActivitySchedules> = {};
    if (dto.startDatetime !== undefined) {
      payload.startDatetime = new Date(dto.startDatetime);
    }
    if (dto.capacity !== undefined) payload.capacity = dto.capacity;
    return super.update(id, payload, actorUserId);
  }

  private async assertActivityExists(activityId: string): Promise<void> {
    const row = await this.activitiesRepository.findOne({ where: { id: activityId } });
    if (!row || row.deletedAt) {
      throw new NotFoundException('Activité introuvable.');
    }
  }
}
