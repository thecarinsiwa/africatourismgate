import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { WhyUsItems } from '../../../entities/why-us-item.entity';
import { CreateWhyUsItemDto } from './dto/create-why-us-item.dto';
import { UpdateWhyUsItemDto } from './dto/update-why-us-item.dto';
import { WhyUsItemsListQueryDto } from './dto/why-us-items-list-query.dto';

@Injectable()
export class WhyUsItemsService extends CrudService<WhyUsItems> {
  constructor(
    @InjectRepository(WhyUsItems)
    private readonly itemsRepository: Repository<WhyUsItems>,
  ) {
    super(itemsRepository);
  }

  createFromDto(dto: CreateWhyUsItemDto, actorUserId?: string): Promise<WhyUsItems> {
    return super.create(dto as DeepPartial<WhyUsItems>, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateWhyUsItemDto,
    actorUserId?: string,
  ): Promise<WhyUsItems> {
    return super.update(id, dto as DeepPartial<WhyUsItems>, actorUserId);
  }

  override async findAll(query: WhyUsItemsListQueryDto): Promise<PaginatedResult<WhyUsItems>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.itemsRepository
      .createQueryBuilder('item')
      .where('item.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(item.title LIKE :term OR item.description LIKE :term)', {
        term: `%${search}%`,
      });
    }

    if (query.locale) {
      qb.andWhere('item.locale = :locale', { locale: query.locale });
    }

    if (query.status) {
      qb.andWhere('item.status = :status', { status: query.status });
    }

    qb.orderBy('item.sortOrder', 'ASC')
      .addOrderBy('item.title', 'ASC')
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
