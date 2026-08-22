import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Promotions } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PromotionsListQueryDto } from './dto/promotions-list-query.dto';

@Injectable()
export class PromotionsService extends CrudService<Promotions> {
  constructor(
    @InjectRepository(Promotions)
    private readonly promotionsRepository: Repository<Promotions>,
  ) {
    super(promotionsRepository);
  }

  async list(query: PromotionsListQueryDto): Promise<PaginatedResult<Promotions>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.promotionsRepository
      .createQueryBuilder('promotion')
      .where('promotion.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(promotion.name LIKE :term OR promotion.description LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('promotion.createdAt', 'DESC')
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
