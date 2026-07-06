import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { WhyUsSections } from '../../../entities/why-us-section.entity';
import { CreateWhyUsSectionDto } from './dto/create-why-us-section.dto';
import { UpdateWhyUsSectionDto } from './dto/update-why-us-section.dto';
import { WhyUsSectionsListQueryDto } from './dto/why-us-sections-list-query.dto';

@Injectable()
export class WhyUsSectionsService extends CrudService<WhyUsSections> {
  constructor(
    @InjectRepository(WhyUsSections)
    private readonly sectionsRepository: Repository<WhyUsSections>,
  ) {
    super(sectionsRepository);
  }

  createFromDto(dto: CreateWhyUsSectionDto, actorUserId?: string): Promise<WhyUsSections> {
    return super.create(dto as DeepPartial<WhyUsSections>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateWhyUsSectionDto,
    actorUserId?: string,
  ): Promise<WhyUsSections> {
    return super.update(id, dto as DeepPartial<WhyUsSections>, actorUserId);
  }

  override async findAll(
    query: WhyUsSectionsListQueryDto,
  ): Promise<PaginatedResult<WhyUsSections>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.sectionsRepository
      .createQueryBuilder('section')
      .where('section.deletedAt IS NULL');

    if (query.locale) {
      qb.andWhere('section.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('section.status = :status', { status: query.status });
    }

    qb.orderBy('section.locale', 'ASC').skip((page - 1) * limit).take(limit);

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
