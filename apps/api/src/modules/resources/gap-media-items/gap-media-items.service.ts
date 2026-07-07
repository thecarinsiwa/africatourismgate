import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { GapMediaItems } from '../../../entities/gap-media-item.entity';
import { CreateGapMediaItemDto } from './dto/create-gap-media-item.dto';
import { GapMediaItemsListQueryDto } from './dto/gap-media-items-list-query.dto';
import { UpdateGapMediaItemDto } from './dto/update-gap-media-item.dto';

@Injectable()
export class GapMediaItemsService extends CrudService<GapMediaItems> {
  constructor(
    @InjectRepository(GapMediaItems)
    private readonly mediaItemsRepository: Repository<GapMediaItems>,
  ) {
    super(mediaItemsRepository);
  }

  createFromDto(
    dto: CreateGapMediaItemDto,
    actorUserId?: string,
  ): Promise<GapMediaItems> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateGapMediaItemDto,
    actorUserId?: string,
  ): Promise<GapMediaItems> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateGapMediaItemDto | UpdateGapMediaItemDto,
  ): DeepPartial<GapMediaItems> {
    const payload: DeepPartial<GapMediaItems> = { ...dto };

    if (dto.publishedAt !== undefined) {
      payload.publishedAt =
        dto.publishedAt === null || dto.publishedAt === ''
          ? null
          : new Date(dto.publishedAt);
    }

    if (dto.status === 'published' && !dto.publishedAt && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    return payload;
  }

  override async findAll(
    query: GapMediaItemsListQueryDto,
  ): Promise<PaginatedResult<GapMediaItems>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.mediaItemsRepository
      .createQueryBuilder('item')
      .where('item.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(item.title LIKE :term OR item.description LIKE :term)', {
        term: `%${search}%`,
      });
    }

    if (query.mediaType) {
      qb.andWhere('item.mediaType = :mediaType', { mediaType: query.mediaType });
    }

    if (query.status) {
      qb.andWhere('item.status = :status', { status: query.status });
    }

    if (query.locale) {
      qb.andWhere('item.locale = :locale', { locale: query.locale });
    }

    qb.orderBy('item.sortOrder', 'ASC')
      .addOrderBy('item.publishedAt', 'DESC')
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
