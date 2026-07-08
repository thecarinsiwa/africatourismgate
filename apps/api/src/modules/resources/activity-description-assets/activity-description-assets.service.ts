import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivityDescriptionAssets } from '../../../entities/generated';
import { ActivityDescriptionAssetsListQueryDto } from './dto/activity-description-assets-list-query.dto';

@Injectable()
export class ActivityDescriptionAssetsService extends CrudService<ActivityDescriptionAssets> {
  constructor(
    @InjectRepository(ActivityDescriptionAssets)
    private readonly activityDescriptionAssetsRepository: Repository<ActivityDescriptionAssets>,
  ) {
    super(activityDescriptionAssetsRepository);
  }

  override async findAll(
    query: ActivityDescriptionAssetsListQueryDto,
  ): Promise<PaginatedResult<ActivityDescriptionAssets>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<ActivityDescriptionAssets> = {};

    if (query.activityId) {
      where.activityId = query.activityId;
    }
    if (query.assetType) {
      where.assetType = query.assetType;
    }

    const [data, total] = await this.activityDescriptionAssetsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
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
