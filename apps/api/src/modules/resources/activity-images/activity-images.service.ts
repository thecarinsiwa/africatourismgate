import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { ActivityImages } from '../../../entities/generated';
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

    const [data, total] = await this.activityImagesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.activityId ? { activityId: query.activityId } : {}),
      },
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
