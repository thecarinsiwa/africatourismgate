import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { AboutResources } from '../../../entities/about-resource.entity';
import { AboutResourcesListQueryDto } from './dto/about-resources-list-query.dto';
import { CreateAboutResourceDto } from './dto/create-about-resource.dto';
import { UpdateAboutResourceDto } from './dto/update-about-resource.dto';

@Injectable()
export class AboutResourcesService extends CrudService<AboutResources> {
  constructor(
    @InjectRepository(AboutResources)
    private readonly aboutResourcesRepository: Repository<AboutResources>,
  ) {
    super(aboutResourcesRepository);
  }

  createFromDto(
    dto: CreateAboutResourceDto,
    actorUserId?: string,
  ): Promise<AboutResources> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateAboutResourceDto,
    actorUserId?: string,
  ): Promise<AboutResources> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateAboutResourceDto | UpdateAboutResourceDto,
  ): DeepPartial<AboutResources> {
    const payload: DeepPartial<AboutResources> = { ...dto };

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
    query: AboutResourcesListQueryDto,
  ): Promise<PaginatedResult<AboutResources>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.aboutResourcesRepository
      .createQueryBuilder('resource')
      .where('resource.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(resource.title LIKE :term OR resource.description LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.type) {
      qb.andWhere('resource.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('resource.status = :status', { status: query.status });
    }

    if (query.locale) {
      qb.andWhere('resource.locale = :locale', { locale: query.locale });
    }

    qb.orderBy('resource.sortOrder', 'ASC')
      .addOrderBy('resource.publishedAt', 'DESC')
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
