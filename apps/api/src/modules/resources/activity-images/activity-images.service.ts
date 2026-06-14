import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { ActivityImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivityImagesListQueryDto } from './dto/activity-images-list-query.dto';

@Injectable()
export class ActivityImagesService extends CrudService<ActivityImages> {
  constructor(
    @InjectRepository(ActivityImages)
    private readonly activityImagesRepository: Repository<ActivityImages>,
  ) {
    super(activityImagesRepository);
  }

  override async findAll(
    query: ActivityImagesListQueryDto,
  ): Promise<PaginatedResult<ActivityImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<ActivityImages> = {};
    if (query.activityId) {
      where.activityId = query.activityId;
    }
    const [data, total] = await this.activityImagesRepository.findAndCount({
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
