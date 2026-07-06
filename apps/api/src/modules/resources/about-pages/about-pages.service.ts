import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { AboutPages } from '../../../entities/about-page.entity';
import { AboutPagesListQueryDto } from './dto/about-pages-list-query.dto';
import { CreateAboutPageDto } from './dto/create-about-page.dto';
import { UpdateAboutPageDto } from './dto/update-about-page.dto';

@Injectable()
export class AboutPagesService extends CrudService<AboutPages> {
  constructor(
    @InjectRepository(AboutPages)
    private readonly aboutPagesRepository: Repository<AboutPages>,
  ) {
    super(aboutPagesRepository);
  }

  createFromDto(dto: CreateAboutPageDto, actorUserId?: string): Promise<AboutPages> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateAboutPageDto,
    actorUserId?: string,
  ): Promise<AboutPages> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateAboutPageDto | UpdateAboutPageDto,
  ): DeepPartial<AboutPages> {
    const payload: DeepPartial<AboutPages> = { ...dto };

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
    query: AboutPagesListQueryDto,
  ): Promise<PaginatedResult<AboutPages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.aboutPagesRepository
      .createQueryBuilder('page')
      .where('page.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(page.title LIKE :term OR page.excerpt LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('page.status = :status', { status: query.status });
    }

    if (query.sectionKey) {
      qb.andWhere('page.sectionKey = :sectionKey', { sectionKey: query.sectionKey });
    }

    if (query.locale) {
      qb.andWhere('page.locale = :locale', { locale: query.locale });
    }

    qb.orderBy('page.sectionKey', 'ASC')
      .addOrderBy('page.locale', 'ASC')
      .addOrderBy('page.publishedAt', 'DESC')
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
