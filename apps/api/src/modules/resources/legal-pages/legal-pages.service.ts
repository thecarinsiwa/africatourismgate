import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { LegalPages } from '../../../entities/legal-page.entity';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { LegalPagesListQueryDto } from './dto/legal-pages-list-query.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';

@Injectable()
export class LegalPagesService extends CrudService<LegalPages> {
  constructor(
    @InjectRepository(LegalPages)
    private readonly legalPagesRepository: Repository<LegalPages>,
  ) {
    super(legalPagesRepository);
  }

  createFromDto(dto: CreateLegalPageDto, actorUserId?: string): Promise<LegalPages> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateLegalPageDto,
    actorUserId?: string,
  ): Promise<LegalPages> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateLegalPageDto | UpdateLegalPageDto,
  ): DeepPartial<LegalPages> {
    const payload: DeepPartial<LegalPages> = { ...dto };

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
    query: LegalPagesListQueryDto,
  ): Promise<PaginatedResult<LegalPages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.legalPagesRepository
      .createQueryBuilder('page')
      .where('page.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('page.title LIKE :term', { term: `%${search}%` });
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
