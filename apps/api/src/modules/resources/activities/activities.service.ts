import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Activities, ActivityProviders } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivitiesListQueryDto } from './dto/activities-list-query.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService extends CrudService<Activities> {
  constructor(
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(ActivityProviders)
    private readonly providersRepository: Repository<ActivityProviders>,
  ) {
    super(activitiesRepository);
  }

  override async findAll(
    query: ActivitiesListQueryDto,
  ): Promise<PaginatedResult<Activities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.activitiesRepository
      .createQueryBuilder('act')
      .where('act.deletedAt IS NULL');

    if (query.providerId) {
      qb.andWhere('act.providerId = :providerId', { providerId: query.providerId });
    }

    if (query.destinationId) {
      qb.innerJoin(
        ActivityProviders,
        'ap',
        'ap.id = act.providerId AND ap.deletedAt IS NULL',
      ).andWhere('ap.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('LOWER(act.title) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('act.createdAt', 'DESC')
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

  createActivity(dto: CreateActivityDto, actorUserId?: string): Promise<Activities> {
    return this.assertProviderExists(dto.providerId).then(() =>
      super.create(this.toEntityPayload(dto), actorUserId),
    );
  }

  updateActivity(
    id: string,
    dto: UpdateActivityDto,
    actorUserId?: string,
  ): Promise<Activities> {
    const check = dto.providerId
      ? this.assertProviderExists(dto.providerId)
      : Promise.resolve();
    return check.then(() => super.update(id, this.toEntityPayload(dto), actorUserId));
  }

  private toEntityPayload(
    dto: CreateActivityDto | UpdateActivityDto,
  ): DeepPartial<Activities> {
    const payload: DeepPartial<Activities> = {};
    if (dto.providerId !== undefined) payload.providerId = dto.providerId;
    if (dto.title !== undefined) payload.title = dto.title.trim();
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.durationMinutes !== undefined) payload.durationMinutes = dto.durationMinutes;
    if (dto.priceCents !== undefined) payload.priceCents = dto.priceCents;
    if (dto.currency !== undefined) {
      payload.currency = dto.currency.trim().toUpperCase();
    }
    return payload;
  }

  private async assertProviderExists(providerId: string): Promise<void> {
    const row = await this.providersRepository.findOne({ where: { id: providerId } });
    if (!row || row.deletedAt) {
      throw new NotFoundException('Fournisseur d’activités introuvable.');
    }
  }
}
