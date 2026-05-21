import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { ActivityProviders, Destinations } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivityProvidersListQueryDto } from './dto/activity-providers-list-query.dto';
import { CreateActivityProviderDto } from './dto/create-activity-provider.dto';
import { UpdateActivityProviderDto } from './dto/update-activity-provider.dto';

@Injectable()
export class ActivityProvidersService extends CrudService<ActivityProviders> {
  constructor(
    @InjectRepository(ActivityProviders)
    private readonly providersRepository: Repository<ActivityProviders>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
  ) {
    super(providersRepository);
  }

  override async findAll(
    query: ActivityProvidersListQueryDto,
  ): Promise<PaginatedResult<ActivityProviders>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.providersRepository
      .createQueryBuilder('provider')
      .where('provider.deletedAt IS NULL');

    if (query.destinationId) {
      qb.andWhere('provider.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere('LOWER(provider.name) LIKE :pattern', { pattern });
    }

    qb.orderBy('provider.name', 'ASC')
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

  createProvider(
    dto: CreateActivityProviderDto,
    actorUserId?: string,
  ): Promise<ActivityProviders> {
    return this.assertDestinationExists(dto.destinationId).then(() =>
      super.create(
        {
          destinationId: dto.destinationId,
          name: dto.name.trim(),
        } as DeepPartial<ActivityProviders>,
        actorUserId,
      ),
    );
  }

  updateProvider(
    id: string,
    dto: UpdateActivityProviderDto,
    actorUserId?: string,
  ): Promise<ActivityProviders> {
    const check = dto.destinationId
      ? this.assertDestinationExists(dto.destinationId)
      : Promise.resolve();
    return check.then(() => {
      const payload: DeepPartial<ActivityProviders> = {};
      if (dto.destinationId !== undefined) payload.destinationId = dto.destinationId;
      if (dto.name !== undefined) payload.name = dto.name.trim();
      return super.update(id, payload, actorUserId);
    });
  }

  private async assertDestinationExists(destinationId: string): Promise<void> {
    const row = await this.destinationsRepository.findOne({
      where: { id: destinationId },
    });
    if (!row || row.deletedAt) {
      throw new NotFoundException('Destination introuvable.');
    }
  }
}
