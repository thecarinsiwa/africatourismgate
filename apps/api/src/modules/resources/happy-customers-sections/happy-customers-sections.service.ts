import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { HappyCustomersSections } from '../../../entities/happy-customers-section.entity';
import { CreateHappyCustomersSectionDto } from './dto/create-happy-customers-section.dto';
import { HappyCustomersSectionsListQueryDto } from './dto/happy-customers-sections-list-query.dto';
import { UpdateHappyCustomersSectionDto } from './dto/update-happy-customers-section.dto';

@Injectable()
export class HappyCustomersSectionsService extends CrudService<HappyCustomersSections> {
  constructor(
    @InjectRepository(HappyCustomersSections)
    private readonly sectionsRepository: Repository<HappyCustomersSections>,
  ) {
    super(sectionsRepository);
  }

  createFromDto(
    dto: CreateHappyCustomersSectionDto,
    actorUserId?: string,
  ): Promise<HappyCustomersSections> {
    return super.create(dto as DeepPartial<HappyCustomersSections>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateHappyCustomersSectionDto,
    actorUserId?: string,
  ): Promise<HappyCustomersSections> {
    return super.update(id, dto as DeepPartial<HappyCustomersSections>, actorUserId);
  }

  override async findAll(
    query: HappyCustomersSectionsListQueryDto,
  ): Promise<PaginatedResult<HappyCustomersSections>> {
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
